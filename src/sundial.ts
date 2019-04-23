import { workspace, window, WorkspaceConfiguration, ExtensionContext } from 'vscode'
import moment from 'moment'
import got from 'got'
import { getTimes } from 'suncalc'
import logger from './utils/logger'

interface ITides {
  sunrise: moment.Moment
  sunset: moment.Moment
}

interface IResponse {
  ip: string
  country_code: string
  country_name: string
  region_code: string
  region_name: string
  city: string
  zip_code: string
  time_zone: string
  latitude: number
  longitude: number
  metro_code: number
}

interface SundialConfiguration extends WorkspaceConfiguration {
  dayTheme: string
  nightTheme: string
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
  debug: boolean
}

export default class Sundial {
  readonly extensionName: string = 'Sundial'
  readonly extensionAlias: string = 'sundial'

  SundialConfig!: SundialConfiguration
  WorkbenchConfig!: WorkspaceConfiguration
  extensionContext!: ExtensionContext

  readonly geoAPI: string = `https://freegeoip.app/json` // https://freegeoip.app/

  debug: boolean = false
  polos: boolean = true // mount/dismount the polos from the sundial
  interval!: NodeJS.Timer
  tides!: ITides
  isRunning: boolean = false

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

    await this.updateConfig()
    await this.checkConfig()

    const log = logger.getLogger('check')
    log.info('Sundial check initialized...')

    let now = moment(moment.now())

    if (this.SundialConfig.latitude || this.SundialConfig.longitude) {
      log.info('Sundial will try to use your configurated location')
      this.tides = await this.useLatitudeLongitude(now)
    } else if (this.SundialConfig.autoLocale) {
      log.info('Sundial will try to detect your location automatically')
      this.tides = await this.useAutoLocale(now)
    }

    if (this.SundialConfig.dayVariable || this.SundialConfig.nightVariable) {
      this.setVariable()
    }

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
      this.changeToDay()
    } else if (nowIsBeforeSunrise || nowIsAfterSunset) {
      log.info('Sundial applied your night theme! 🌑')
      this.changeToNight()
    }

    await this.timer(400) // Cool down 😴
    this.isRunning = false
    this.automater()
  }

  private async useLatitudeLongitude(now: moment.Moment): Promise<ITides> {
    const log = logger.getLogger('useLatitudeLongitude')

    if (!this.SundialConfig.latitude || !this.SundialConfig.longitude) {
      throw window.showErrorMessage(
        'Sundial needs both, latitude and longitude, to work with this configuration!'
      )
    }

    log.debug('Latitude:', this.SundialConfig.latitude)
    log.debug('Longitude:', this.SundialConfig.longitude)

    const tides = await getTimes(
      now.toDate(),
      Number(this.SundialConfig.latitude),
      Number(this.SundialConfig.longitude)
    )

    return {
      sunrise: moment(tides.sunrise),
      sunset: moment(tides.sunset),
    }
  }

  private async useAutoLocale(now: moment.Moment): Promise<ITides> {
    const log = logger.getLogger('useAutoLocale')
    let latitude: number = 0
    let longitude: number = 0

    try {
      const gotResponse = await got(this.geoAPI)
      const response: IResponse = JSON.parse(gotResponse.body)
      if ((!response.latitude && !response.longitude) || gotResponse.statusCode !== 200) {
        throw new Error(`[${gotResponse.statusCode}]: ${gotResponse.statusMessage}`)
      }
      log.debug('Response:', response)
      latitude = response.latitude
      longitude = response.longitude
      this.extensionContext.globalState.update('userLatitude', latitude)
      this.extensionContext.globalState.update('userLongitude', longitude)
    } catch (error) {
      log.error(error)
      window.showErrorMessage(
        'Oops, something went wrong collecting your geolocation! Maybe it is a problem with the API. Please create an issue on GitHub should this problem persist.'
      )
    }

    if (latitude === 0 || longitude === 0) {
      return this.tides // fallback
    }

    const tides = await getTimes(now.toDate(), latitude, longitude)
    return {
      sunrise: moment(tides.sunrise),
      sunset: moment(tides.sunset),
    }
  }

  private setVariable() {
    let { sunrise, sunset } = this.tides
    sunrise = sunrise.add(this.SundialConfig.dayVariable, 'minutes')
    sunset = sunset.add(this.SundialConfig.nightVariable, 'minutes')
    this.tides = { sunrise, sunset }
  }

  timer = (ms: number): Promise<NodeJS.Timeout> => new Promise(r => setTimeout(r, ms))

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
    this.SundialConfig = <SundialConfiguration>workspace.getConfiguration('sundial')
    this.WorkbenchConfig = workspace.getConfiguration('workbench')
    this.tides = {
      sunrise: moment(this.SundialConfig.sunrise, 'H:m', true),
      sunset: moment(this.SundialConfig.sunset, 'H:m', true),
    }
    if (this.SundialConfig.debug) {
      logger.setLevel(logger.levels.DEBUG)
    } else {
      logger.setLevel(logger.levels.INFO)
    }
    const log = logger.getLogger('updateConfig')
    log.debug('SundialConfig:', this.SundialConfig)
    log.debug('SundialTides:', this.tides)
    log.debug('WorkbenchConfig:', this.WorkbenchConfig)
  }

  disablePolos() {
    const log = logger.getLogger('disablePolos')
    log.info('Removing the polos from the sundial...')
    this.polos = false
    clearInterval(this.interval)
  }

  async changeToDay() {
    this.changeThemeTo(this.SundialConfig.dayTheme)
    this.applySettings(this.SundialConfig.daySettings)
  }

  async changeToNight() {
    this.changeThemeTo(this.SundialConfig.nightTheme)
    this.applySettings(this.SundialConfig.nightSettings)
  }

  async changeThemeTo(theme: string) {
    if (theme !== this.WorkbenchConfig.colorTheme) {
      this.WorkbenchConfig.update('colorTheme', theme, true)
    }
  }

  async applySettings(settings: object) {
    const workspaceSettings = workspace.getConfiguration()
    Object.keys(settings).forEach(k => {
      workspaceSettings.update(k, settings[k], true)
    })
  }

  toggleTheme(time?: string) {
    switch (time) {
      case 'day':
        this.changeToDay()
        break
      case 'night':
        this.changeToNight()
        break
      default:
        const currentTheme = this.WorkbenchConfig.colorTheme
        if (currentTheme === this.SundialConfig.dayTheme) {
          this.changeToNight()
        } else {
          this.changeToDay()
        }
        break
    }
  }
}
