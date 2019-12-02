import { WorkspaceConfiguration, ExtensionContext } from 'vscode'
import dayjs from 'dayjs'
import sensors from './sensors'
import * as editor from './editor'
import * as loglevel from 'loglevel'
import { logger, setGlobalLevel } from './logger'
import { sleep, isMacOS } from './utils'
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
  debug: loglevel.LogLevel
  windowEvents: string[]
  workspaceEvents: string[]
}

export default class Sundial {
  static readonly extensionName = 'Sundial'
  static readonly extensionAlias = 'sundial'
  static extensionContext: ExtensionContext

  private enabled = true
  private isRunning = false
  private interval!: NodeJS.Timer

  public tides!: ITides

  constructor() {
    dayjs.extend(customParseFormat)
  }

  public enableExtension() {
    const log = logger.getLogger('enableExtension')
    log.info('Enabling Sundial...')
    this.enabled = true
    this.automater()
    this.check()
  }

  public disableExtension() {
    const log = logger.getLogger('disableExtension')
    log.info('Disabling Sundial...')
    clearInterval(this.interval)
    this.enabled = false
  }

  public automater() {
    const { sundial } = editor.getConfig()
    if (sundial.interval === 0) {
      return
    }
    const interval = 1000 * 60 * sundial.interval
    this.interval = setInterval(() => this.check(), interval)
  }

  public async check() {
    if (!this.enabled || this.isRunning) {
      return // disabled or already running
    }
    const { sundial, workbench } = editor.getConfig()
    clearInterval(this.interval) // reset timer
    this.isRunning = true

    setGlobalLevel(sundial.debug)
    const log = logger.getLogger('check')
    log.info('Sundial check initialized...')
    log.debug('SundialConfig:', sundial)
    log.debug('WorkbenchConfig:', workbench)

    if (sundial.systemTheme && isMacOS) {
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
      if (sundial.latitude || sundial.longitude) {
        log.info('Sundial will use your latitude and longitude')
        this.tides = await sensors.LatLong()
      } else if (sundial.autoLocale) {
        log.info('Sundial will now try to detect your location')
        this.tides = await sensors.AutoLocale()
      } else {
        log.info('Sundial will use your saved time settings')
        this.tides = {
          sunrise: dayjs(sundial.sunrise, 'HH:mm'),
          sunset: dayjs(sundial.sunset, 'HH:mm'),
        }
      }

      if (sundial.dayVariable || sundial.nightVariable) {
        this.setTimeVariables()
      }

      await this.evaluateTides()
    }

    await sleep(400) // Short nap to prevent too fast calls 😴
    this.isRunning = false
    this.automater()
  }

  private async evaluateTides() {
    const now = dayjs()
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
  }

  private setTimeVariables() {
    const { sundial, workbench } = editor.getConfig()
    let { sunrise, sunset } = this.tides
    sunrise = sunrise.add(sundial.dayVariable, 'minute')
    sunset = sunset.add(workbench.nightVariable, 'minute')
    this.tides = { sunrise, sunset }
  }
}
