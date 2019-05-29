import { window, WorkspaceConfiguration, ExtensionContext } from 'vscode'
import moment from 'moment'
import dns from 'dns'
import sensors from './sensors'
import * as editor from './editor'
import { logger, setGlobalLevel } from './logger'
import { sleep, isMacOS } from './utils'

export interface ITides {
  sunrise: moment.Moment
  sunset: moment.Moment
}

export interface SundialConfiguration extends WorkspaceConfiguration {
  dayTheme: string
  nightTheme: string
  sunrise: string
  sunset: string
  latitude: string
  longitude: string
  autoLocale: boolean
  systemTheme: boolean
  ambientLight: boolean
  dayVariable: number
  nightVariable: number
  daySettings: WorkspaceConfiguration
  nightSettings: WorkspaceConfiguration
  interval: number
  debug: boolean
}

export default class Sundial {
  readonly extensionName: string = 'Sundial'
  readonly extensionAlias: string = 'sundial'

  SundialConfig!: SundialConfiguration
  WorkbenchConfig!: WorkspaceConfiguration
  extensionContext!: ExtensionContext

  debug: boolean = false
  polos: boolean = true // mount/dismount the polos from the sundial
  interval!: NodeJS.Timer
  tides!: ITides
  isRunning: boolean = false
  connected: boolean = true

  constructor() {
    this.updateConfig()
    this.checkConfig()
  }

  set context(context: ExtensionContext) {
    this.extensionContext = context
  }

  automater() {
    if (this.SundialConfig.interval === 0) {
      return
    }
    const interval = this.SundialConfig.debug
      ? this.SundialConfig.interval // while debugging do seconds
      : 60 * this.SundialConfig.interval
    this.interval = setInterval(() => this.check(), 1000 * interval)
  }

  async check() {
    if (!this.polos || this.isRunning) {
      return // Just mute it here, info would be disturbing
    }
    clearInterval(this.interval) // reset timer
    this.isRunning = true

    this.connected = await this.checkConnection()
    await this.updateConfig()
    await this.checkConfig()

    const log = logger.getLogger('check')
    log.info('Sundial check initialized...')

    if (this.SundialConfig.systemTheme && isMacOS) {
      log.info('Sundial will use your sysmte theme')
      const darkMode = await sensors.SystemTheme()
      if (darkMode) {
        log.info('Sundial applied your night theme! 🌑')
        editor.changeToNight()
      } else {
        log.info('Sundial applied your day theme! 🌕')
        editor.changeToDay()
      }
    } else {
      // TODO: replace moment with native
      let now = moment(moment.now())

      if (this.SundialConfig.latitude || this.SundialConfig.longitude) {
        log.info('Sundial will use your latitude and longitude')
        this.tides = await sensors.LatLong(now)
      } else if (this.SundialConfig.autoLocale) {
        if (!this.connected) {
          log.info('You are not connected, so we will use your last location')
        } else {
          log.info('Sundial will now detect your location')
          this.tides = await sensors.Sun(this.extensionContext, now)
        }
      } else {
        log.info('Sundial will your saved time')
        // use default `sundial.sunrise` and `sundial.sunset`
      }

      if (this.SundialConfig.dayVariable || this.SundialConfig.nightVariable) {
        this.setTimeVariables()
      }

      await this.checkTides(now)
    }

    this.isRunning = false
    this.automater()
  }

  private async checkTides(now: moment.Moment) {
    const log = logger.getLogger('checkTides')

    const nowIsBeforeSunrise = now.isBefore(this.tides.sunrise)
    const nowIsAfterSunrise = now.isAfter(this.tides.sunrise)
    const nowIsBeforeSunset = now.isBefore(this.tides.sunset)
    const nowIsAfterSunset = now.isAfter(this.tides.sunset)

    log.debug('Sunrise:', this.tides.sunrise)
    log.debug('Sunset:', this.tides.sunset)
    log.debug('nowIsBeforeSunrise:', nowIsBeforeSunrise)
    log.debug('nowIsAfterSunrise:', nowIsAfterSunrise)
    log.debug('nowIsBeforeSunset:', nowIsBeforeSunset)
    log.debug('nowIsAfterSunset:', nowIsAfterSunset)

    if (nowIsAfterSunrise && nowIsBeforeSunset) {
      log.info('Sundial applied your day theme! 🌕')
      editor.changeToDay()
    } else if (nowIsBeforeSunrise || nowIsAfterSunset) {
      log.info('Sundial applied your night theme! 🌑')
      editor.changeToNight()
    }

    await sleep(400) // Short nap to prevent too fast calls 😴
  }

  private setTimeVariables() {
    let { sunrise, sunset } = this.tides
    sunrise = sunrise.add(this.SundialConfig.dayVariable, 'minutes')
    sunset = sunset.add(this.SundialConfig.nightVariable, 'minutes')
    this.tides = { sunrise, sunset }
  }

  disablePolos() {
    const log = logger.getLogger('disablePolos')
    log.info('Removing the polos from the sundial...')
    this.polos = false
    clearInterval(this.interval)
  }

  checkConnection(): Promise<boolean> {
    // TODO: waiting for a better solution: https://github.com/microsoft/vscode/issues/73094
    return new Promise(resolve => {
      dns.resolve('code.visualstudio.com', (err: any) => {
        if (err) {
          // No connection
          window.showInformationMessage(
            'Sundial detected that you are offline but will still try to run.'
          )
          resolve(false)
        } else {
          // Connected
          resolve(true)
        }
      })
    })
  }

  checkConfig() {
    const configSunrise = moment(this.SundialConfig.sunrise, 'H:m', true)
    const configSunset = moment(this.SundialConfig.sunset, 'H:m', true)
    if (
      (!configSunrise.isValid() || !configSunset.isValid()) &&
      (!this.SundialConfig.latitude ||
        !this.SundialConfig.longitude ||
        !this.SundialConfig.autoLocale)
    ) {
      window.showErrorMessage(
        'It looks like sundial.sunrise or sundial.sunset are no real dates and you have not set any other specifications to determine your sunset and sunrise. Please correct this by following the documentation.'
      )
    }
  }

  updateConfig() {
    const { sundial, workbench } = editor.getConfig()
    this.SundialConfig = sundial
    this.WorkbenchConfig = workbench
    this.tides = {
      sunrise: moment(this.SundialConfig.sunrise, 'H:m', true),
      sunset: moment(this.SundialConfig.sunset, 'H:m', true),
    }
    // TODO: waiting for: https://github.com/pimterry/loglevel/issues/134
    if (this.SundialConfig.debug) {
      setGlobalLevel(logger.levels.DEBUG)
    } else {
      setGlobalLevel(logger.levels.INFO)
    }
    const log = logger.getLogger('updateConfig')
    log.debug('SundialConfig:', this.SundialConfig)
    log.debug('SundialTides:', this.tides)
    log.debug('WorkbenchConfig:', this.WorkbenchConfig)
  }
}
