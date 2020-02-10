import { WorkspaceConfiguration, ExtensionContext } from 'vscode'
import dayjs from 'dayjs'
import sensors from './sensors'
import * as editor from './editor'
import { LogLevel, getLogger, setLogLevelAll } from './logger'
import { sleep } from './utils'
import customParseFormat from 'dayjs/plugin/customParseFormat'

export interface Tides {
  sunrise: dayjs.Dayjs
  sunset: dayjs.Dayjs
}

export interface SundialConfiguration extends WorkspaceConfiguration {
  sunrise: string
  sunset: string
  latitude: string
  longitude: string
  autoLocale: boolean
  dayVariable: number
  nightVariable: number
  daySettings: WorkspaceConfiguration
  nightSettings: WorkspaceConfiguration
  interval: number
  debug: LogLevel
}

export default class Sundial {
  public static readonly extensionName = 'Sundial'
  public static readonly extensionAlias = 'sundial'
  public static extensionContext: ExtensionContext

  private enabled = true
  private isRunning = false
  private interval!: NodeJS.Timer

  public tides!: Tides

  constructor() {
    dayjs.extend(customParseFormat)
  }

  public enableExtension() {
    const log = getLogger('enableExtension')
    log.info('Enabling Sundial...')
    this.enabled = true
    this.automater()
    this.check()
  }

  public disableExtension() {
    const log = getLogger('disableExtension')
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
    this.interval = setInterval(() => {
      this.check()
    }, interval)
  }

  public async check() {
    if (!this.enabled || this.isRunning) {
      return // disabled or already running
    }
    this.isRunning = true
    const { sundial, workbench } = editor.getConfig()
    clearInterval(this.interval) // reset timer

    setLogLevelAll(sundial.debug)
    const log = getLogger('check')
    log.info('Sundial check initialized...')
    log.debug('SundialConfig:', JSON.stringify(sundial, null, 2))
    log.debug('WorkbenchConfig:', JSON.stringify(workbench, null, 2))

    if (sundial.latitude || sundial.longitude) {
      log.info('Sundial will use your latitude and longitude')
      this.tides = sensors.LatLong()
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

    this.evaluateTides()

    await sleep(400) // Short nap 😴
    this.isRunning = false
    this.automater()
  }

  private evaluateTides() {
    const now = dayjs()
    const log = getLogger('evaluateTides')

    const nowIsBeforeSunrise = now.isBefore(this.tides.sunrise)
    const nowIsAfterSunrise = now.isAfter(this.tides.sunrise)
    const nowIsBeforeSunset = now.isBefore(this.tides.sunset)
    const nowIsAfterSunset = now.isAfter(this.tides.sunset)

    log.debug('Now:', now.format())
    log.debug('Sunrise:', this.tides.sunrise.format())
    log.debug('Sunset:', this.tides.sunset.format())
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
    const { sundial } = editor.getConfig()
    let { sunrise, sunset } = this.tides

    if (sundial.dayVariable > 0) {
      sunrise = sunrise.add(sundial.dayVariable, 'minute')
    } else {
      sunrise = sunrise.subtract(sundial.dayVariable * -1, 'minute')
    }

    if (sundial.nightVariable > 0) {
      sunset = sunset.add(sundial.nightVariable, 'minute')
    } else {
      sunset = sunset.subtract(sundial.nightVariable * -1, 'minute')
    }

    this.tides = { sunrise, sunset }
  }
}
