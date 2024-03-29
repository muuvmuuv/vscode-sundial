import dayjs from 'dayjs'
import {
  ExtensionContext,
  StatusBarAlignment,
  StatusBarItem,
  window,
  WorkspaceConfiguration,
} from 'vscode'

import * as editor from './editor'
import { getLogger, LogLevel, setLogLevelAll } from './logger'
import sensors from './sensors'
import { sleep } from './utils'

const STATE_ENABLED = 'sundial.enabled'

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
  statusBarItemPriority: number
  interval: number
  debug: LogLevel
}

export default class Sundial {
  static readonly extensionName = 'Sundial'
  static readonly extensionAlias = 'sundial'

  static extensionContext: ExtensionContext

  private isRunning = false
  private nextCircle?: editor.TimeNames
  private checkInterval!: NodeJS.Timer
  private statusBarItem?: StatusBarItem

  get enabled(): boolean {
    return Sundial.extensionContext.globalState.get(STATE_ENABLED, true)
  }

  /**
   * Enable the automation and checks.
   */
  enableExtension(): void {
    const log = getLogger('enableExtension')
    log.info('Enabling Sundial')
    Sundial.extensionContext.globalState.update(STATE_ENABLED, true)
    this.nextCircle = undefined
    this.automator()
    this.check()
    this.createStatusBarIcon()
  }

  /**
   * Disable the extension automation and checks.
   */
  disableExtension(): void {
    const log = getLogger('disableExtension')
    log.info('Disabling Sundial')
    Sundial.extensionContext.globalState.update(STATE_ENABLED, false)
    this.killAutomator()
  }

  /**
   * Pause automated checks until next time circle.
   */
  async pauseUntilNextCircle(): Promise<void> {
    const log = getLogger('pauseUntilNextCircle')
    const currentTime = await this.getCurrentTime()
    this.nextCircle =
      currentTime === editor.TimeNames.DAY ? editor.TimeNames.NIGHT : editor.TimeNames.DAY
    log.info(`Waiting until it becomes ${this.nextCircle} again...`)
  }

  /**
   * Create and start the automator interval.
   */
  automator(): void {
    if (!this.enabled) {
      this.killAutomator()
      return
    }
    const log = getLogger('automator')
    const { sundial } = editor.getConfig()
    if (sundial.interval === 0) {
      log.info('Automator offline')
      return
    }
    log.info('Automator online')
    const interval = 1000 * 60 * sundial.interval
    this.checkInterval = setInterval(() => {
      log.info('Autocheck')
      this.check()
    }, interval)
  }

  /**
   * Kill the automator interval.
   */
  killAutomator(): void {
    clearInterval(this.checkInterval)
  }

  /**
   * Main check. Will change theme if needed.
   */
  async check(): Promise<void> {
    if (!this.enabled || this.isRunning) {
      return // disabled or already running
    }
    const log = getLogger('check')
    log.info('Sundial check initialized')
    log.debug('With circle on ' + this.nextCircle)

    this.isRunning = true
    this.killAutomator()
    const { sundial } = editor.getConfig()
    setLogLevelAll(sundial.debug)

    const currentTime = await this.getCurrentTime()
    log.debug(`Current time is ${currentTime}`)

    if (this.nextCircle) {
      log.info(`Waiting for next circle`)
      if (currentTime === this.nextCircle) {
        log.info('Next circle reached!')
        this.nextCircle = undefined
        await this.check()
      }
    } else {
      if (currentTime === editor.TimeNames.DAY) {
        console.info('Sundial will apply your day theme! 🌕')
        editor.changeToDay()
      } else {
        console.info('Sundial will apply your night theme! 🌑')
        editor.changeToNight()
      }
    }

    await sleep(400) // Short nap 😴

    this.isRunning = false
    this.automator()
  }

  /**
   * Toggle the theme and disable the extension. So no automation
   * will be done until you enable it again.
   *
   * @see editor.toggleTheme
   */
  toggleTheme(time?: editor.TimeNames): void {
    this.disableExtension()
    editor.toggleTheme(time)
  }

  /**
   * Set the status bar icon to toggle the theme.
   */
  private createStatusBarIcon(): void {
    if (this.statusBarItem) {
      this.statusBarItem.dispose()
    }

    const { sundial } = editor.getConfig()

    this.statusBarItem = window.createStatusBarItem(
      StatusBarAlignment.Right,
      sundial.statusBarItemPriority,
    )
    this.statusBarItem.accessibilityInformation = {
      label: 'Toggle day/night theme',
      role: 'button',
    }
    this.statusBarItem.command = 'sundial.toggleDayNightTheme'
    this.statusBarItem.text = '$(color-mode)'
    this.statusBarItem.tooltip = 'Toggle day/night theme'

    Sundial.extensionContext.subscriptions.push(this.statusBarItem)

    this.statusBarItem.show()
  }

  /**
   * Get current time name based on sunrise and sunset.
   */
  private async getCurrentTime(): Promise<editor.TimeNames> {
    const log = getLogger('getCurrentTime')
    const tides = await this.getTides()

    const { nowIsBeforeSunrise, nowIsAfterSunrise, nowIsBeforeSunset, nowIsAfterSunset } =
      this.evaluateTides(tides)

    if (nowIsAfterSunrise && nowIsBeforeSunset) {
      log.debug(editor.TimeNames.DAY)
      return editor.TimeNames.DAY
    } else if (nowIsBeforeSunrise || nowIsAfterSunset) {
      log.debug(editor.TimeNames.NIGHT)
      return editor.TimeNames.NIGHT
    }

    return editor.TimeNames.NIGHT // always return something
  }

  /**
   * Get sunrise and sunset based on user settings.
   */
  private async getTides() {
    const log = getLogger('getTides')
    const { sundial } = editor.getConfig()

    if (sundial.latitude && sundial.longitude) {
      log.info('Sundial will use your latitude and longitude')
      return sensors.LatLong()
    } else if (sundial.autoLocale) {
      log.info('Sundial will now try to detect your location')
      return await sensors.AutoLocale()
    } else {
      log.info('Sundial will use your time settings')
      return {
        sunrise: dayjs(sundial.sunrise, 'HH:mm'),
        sunset: dayjs(sundial.sunset, 'HH:mm'),
      }
    }
  }

  /**
   * Set the time variables based on tides.
   */
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

  /**
   * Set the time variables based on user settings.
   */
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
