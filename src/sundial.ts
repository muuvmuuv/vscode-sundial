import { window, WorkspaceConfiguration, ExtensionContext } from 'vscode'
import dayjs from 'dayjs'
import sensors from './sensors'
import * as editor from './editor'
import { logger, setGlobalLevel } from './logger'
import { sleep, isMacOS, checkConnection } from './utils'
import customParseFormat from 'dayjs/plugin/customParseFormat'

export interface ITides {
  sunrise: dayjs.Dayjs
  sunset: dayjs.Dayjs
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
  windowEvents: string[]
  workspaceEvents: string[]
}

export default class Sundial {
  public readonly extensionName: string = 'Sundial'
  public readonly extensionAlias: string = 'sundial'

  public SundialConfig!: SundialConfiguration
  public WorkbenchConfig!: WorkspaceConfiguration
  public extensionContext!: ExtensionContext

  public debug: boolean = false
  public enabled: boolean = true // mount/dismount the enabled from the sundial
  public interval!: NodeJS.Timer
  public tides!: ITides
  public isRunning: boolean = false
  public connected: boolean = true

  constructor() {
    dayjs.extend(customParseFormat)

    this.updateConfig()
    this.checkConfig()
  }

  set context(context: ExtensionContext) {
    this.extensionContext = context
  }

  public disableExtension() {
    this.updateConfig()
    const log = logger.getLogger('disableExtension')
    log.info('Disabling Sundial...')
    this.enabled = false
    clearInterval(this.interval)
  }

  public enableExtension() {
    this.updateConfig()
    const log = logger.getLogger('enableExtension')
    log.info('Enabling Sundial...')
    this.enabled = true
    this.automater()
    this.check()
  }

  public automater() {
    if (this.SundialConfig.interval === 0) {
      return
    }
    const interval = 1000 * 60 * this.SundialConfig.interval
    this.interval = setInterval(() => this.check(), interval)
  }

  public async check() {
    if (!this.enabled || this.isRunning) {
      return // just mute it here, info would be disturbing
    }
    clearInterval(this.interval) // reset timer
    this.isRunning = true

    this.connected = await checkConnection()
    this.updateConfig()
    this.checkConfig()

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
      const now = dayjs()

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
        log.info('Sundial will use your saved time settings')
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

  private async checkTides(now: dayjs.Dayjs) {
    const log = logger.getLogger('checkTides')

    const nowIsBeforeSunrise = now.isBefore(this.tides.sunrise)
    const nowIsAfterSunrise = now.isAfter(this.tides.sunrise)
    const nowIsBeforeSunset = now.isBefore(this.tides.sunset)
    const nowIsAfterSunset = now.isAfter(this.tides.sunset)

    log.debug('Now:', now)
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
    sunrise = sunrise.add(this.SundialConfig.dayVariable, 'minute')
    sunset = sunset.add(this.SundialConfig.nightVariable, 'minute')
    this.tides = { sunrise, sunset }
  }

  public checkConfig() {
    if (
      (!this.tides.sunrise.isValid() || !this.tides.sunset.isValid()) &&
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
      sunrise: dayjs(this.SundialConfig.sunrise, 'HH:mm'),
      sunset: dayjs(this.SundialConfig.sunset, 'HH:mm'),
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
