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
  private nextCircle: editor.TimeNames | null = null
  private checkInterval!: NodeJS.Timer

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
    clearInterval(this.checkInterval)
    this.enabled = false
  }

  public async pauseUntilNextCircle() {
    const log = getLogger('disableUntilNextCirle')
    const currentTime = await this.getCurrentTime()
    this.nextCircle =
      currentTime === editor.TimeNames.Day ? editor.TimeNames.Night : editor.TimeNames.Day
    log.info(`Waiting until it becomes ${this.nextCircle} again...`)
  }

  public automater() {
    const { sundial } = editor.getConfig()
    if (sundial.interval === 0) {
      return
    }
    const interval = 1000 * 60 * sundial.interval
    this.checkInterval = setInterval(() => {
      this.check()
    }, interval)
  }

  public async check() {
    if (!this.enabled || this.isRunning) {
      return // disabled or already running
    }
    const log = getLogger('check')
    log.info('Sundial check initialized...')

    this.isRunning = true
    const { sundial } = editor.getConfig()
    clearInterval(this.checkInterval) // reset timer
    setLogLevelAll(sundial.debug)

    const currentTime = await this.getCurrentTime()

    if (this.nextCircle) {
      log.debug(`Waiting for next circle: ${currentTime} => ${this.nextCircle}`)
      if (currentTime === this.nextCircle) {
        log.info('Next circle reached!')
        this.nextCircle = null
        this.check()
      }
    } else {
      if (currentTime === editor.TimeNames.Day) {
        console.info('Sundial will apply your day theme! 🌕')
        editor.changeToDay()
      } else {
        console.info('Sundial will apply your night theme! 🌑')
        editor.changeToNight()
      }
    }

    await sleep(400) // Short nap 😴
    this.isRunning = false
    this.automater()
  }

  private async getCurrentTime(): Promise<editor.TimeNames> {
    const log = getLogger('getCurrentTime')
    const tides = await this.getTides()

    const {
      nowIsBeforeSunrise,
      nowIsAfterSunrise,
      nowIsBeforeSunset,
      nowIsAfterSunset,
    } = this.evaluateTides(tides)

    if (nowIsAfterSunrise && nowIsBeforeSunset) {
      log.debug(editor.TimeNames.Day)
      return editor.TimeNames.Day
    } else if (nowIsBeforeSunrise || nowIsAfterSunset) {
      log.debug(editor.TimeNames.Night)
      return editor.TimeNames.Night
    }

    return editor.TimeNames.Night // always return something
  }

  private async getTides() {
    const log = getLogger('getTides')
    const { sundial } = editor.getConfig()

    if (sundial.latitude || sundial.longitude) {
      log.info('Sundial will use your latitude and longitude')
      return sensors.LatLong()
    } else if (sundial.autoLocale) {
      log.info('Sundial will now try to detect your location')
      return await sensors.AutoLocale()
    } else {
      log.info('Sundial will use your saved time settings')
      return {
        sunrise: dayjs(sundial.sunrise, 'HH:mm'),
        sunset: dayjs(sundial.sunset, 'HH:mm'),
      }
    }
  }

  private evaluateTides(tides: Tides) {
    const log = getLogger('evaluateTides')
    const { sundial } = editor.getConfig()

    if (sundial.dayVariable || sundial.nightVariable) {
      tides = this.setTimeVariables(tides)
    }

    const { sunrise, sunset } = tides
    const now = dayjs()

    const nowIsBeforeSunrise = now.isBefore(sunrise)
    const nowIsAfterSunrise = now.isAfter(sunrise)
    const nowIsBeforeSunset = now.isBefore(sunset)
    const nowIsAfterSunset = now.isAfter(sunset)

    log.debug('Now:', now.format())
    log.debug('Sunrise:', sunrise.format())
    log.debug('Sunset:', sunset.format())
    log.debug('nowIsBeforeSunrise:', nowIsBeforeSunrise)
    log.debug('nowIsAfterSunrise:', nowIsAfterSunrise)
    log.debug('nowIsBeforeSunset:', nowIsBeforeSunset)
    log.debug('nowIsAfterSunset:', nowIsAfterSunset)

    return {
      nowIsBeforeSunrise,
      nowIsAfterSunrise,
      nowIsBeforeSunset,
      nowIsAfterSunset,
    }
  }

  private setTimeVariables(tides: Tides) {
    const log = getLogger('setTimeVariables')
    const { sundial } = editor.getConfig()
    let { sunrise, sunset } = tides

    if (sundial.dayVariable) {
      if (sundial.dayVariable > 0) {
        sunrise = sunrise.add(sundial.dayVariable, 'minute')
        log.debug(`Added ${sundial.dayVariable} minutes from day`)
      } else {
        sunrise = sunrise.subtract(sundial.dayVariable * -1, 'minute')
        log.debug(`Subtracted ${sundial.dayVariable} minutes from day`)
      }
    }

    if (sundial.nightVariable) {
      if (sundial.nightVariable > 0) {
        sunset = sunset.add(sundial.nightVariable, 'minute')
        log.debug(`Added ${sundial.nightVariable} minutes from night`)
      } else {
        sunset = sunset.subtract(sundial.nightVariable * -1, 'minute')
        log.debug(`Subtracted ${sundial.nightVariable} minutes from night`)
      }
    }

    return { sunrise, sunset }
  }
}
