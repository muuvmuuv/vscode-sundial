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
  public readonly extensionName: string = 'Sundial'
  public readonly extensionAlias: string = 'sundial'

  public SundialConfig!: SundialConfiguration
  public WorkbenchConfig!: WorkspaceConfiguration
  public extensionContext!: ExtensionContext

  public debug: boolean = false
  public polos: boolean = true // mount/dismount the polos from the sundial
  public interval!: NodeJS.Timer
  public tides!: ITides
  public isRunning: boolean = false
  public connected: boolean = true

  constructor() {
    this.updateConfig()
    this.checkConfig()
  }

  set context(context: ExtensionContext) {
    this.extensionContext = context
  }

  public automater() {
    if (this.SundialConfig.interval === 0) {
      return
    }
    const interval = this.SundialConfig.debug
      ? this.SundialConfig.interval // while debugging do seconds
      : 60 * this.SundialConfig.interval
    this.interval = setInterval(() => this.check(), 1000 * interval)
  }

  public async check() {
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
      log.info('Sundial will use your system theme')
      const darkMode = await sensors.SystemTheme()
      if (darkMode) {
        log.info('Sundial applied your night theme! 🌑')
        editor.changeToNight()
      } else {
        log.info('Sundial applied your day theme! 🌕')
        editor.changeToDay()
      }
    } else {
      const now = moment(moment.now())

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

  public disablePolos() {
    const log = logger.getLogger('disablePolos')
    log.info('Removing the polos from the sundial...')
    this.polos = false
    clearInterval(this.interval)
  }

  public checkConnection(): Promise<boolean> {
    const log = logger.getLogger('checkConnection')
    // TODO: waiting for a better solution: https://github.com/microsoft/vscode/issues/73094
    return new Promise(resolve => {
      dns.resolve('8.8.8.8', (err: any) => {
        if (err) {
          // No connection
          log.debug(err)
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

  public checkConfig() {
    const configSunrise = moment(this.SundialConfig.sunrise, 'H:m', true)
    const configSunset = moment(this.SundialConfig.sunset, 'H:m', true)
    if (
      (!configSunrise.isValid() || !configSunset.isValid()) &&
      (!this.SundialConfig.latitude ||
        !this.SundialConfig.longitude ||
        !this.SundialConfig.autoLocale)
    ) {
      window.showErrorMessage(
        'It looks like sundial.sunrise or sundial.sunset are ' +
          'no real dates and you have not set any other specifications ' +
          'to determine your sunset and sunrise. Please correct this ' +
          'by following the documentation.'
      )
    }
  }

  public updateConfig() {
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
