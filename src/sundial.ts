import { workspace, window, WorkspaceConfiguration, ExtensionContext } from 'vscode'
import * as moment from 'moment'
import * as got from 'got'
import { getTimes } from 'suncalc'
import { v4 } from 'public-ip'

interface ITides {
  sunrise: moment.Moment
  sunset: moment.Moment
}

interface IpapiResponse {
  success: boolean
  error: {
    code: number
    type: string
    info: string
  }
  latitude: number
  longitude: number
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
  interval: number
  useHTTPS: boolean
  debug: boolean
}

export default class Sundial {
  readonly extensionName: string = 'Sundial'
  readonly extensionAlias: string = 'sundial'

  SundialConfig!: SundialConfiguration
  WorkbenchConfig!: WorkspaceConfiguration
  extensionContext!: ExtensionContext

  debug: boolean = false
  ipapiAccessKey: string = 'aae7ba6db75c991f311debe20ec58d7e'
  ipapi: string = `http://api.ipapi.com/{IP}?access_key=${
    this.ipapiAccessKey
  }&fields=latitude,longitude` // https://ipapi.com/usage
  polos: boolean = true // mount/dismount the polos from the sundial
  interval!: NodeJS.Timer
  tides!: ITides
  isRunning: boolean = false

  constructor() {
    this.updateConfig()
    this.checkConfig()

    if (this.SundialConfig.debug) {
      console.log('(Sundial) => WorkbenchConfig:', this.WorkbenchConfig)
      console.log('(Sundial) => SundialConfig:', this.SundialConfig)
    }
  }

  set context(context: ExtensionContext) {
    this.extensionContext = context
  }

  automater() {
    const interval = this.SundialConfig.debug
      ? this.SundialConfig.interval // while debugging do seconds
      : 60 * this.SundialConfig.interval
    this.interval = setInterval(() => this.check(), 1000 * interval)
  }

  async check() {
    if (!this.polos || this.isRunning) {
      return // Just mute it here, info would be disturbing
    }
    console.info('Sundial check initialized...')
    clearInterval(this.interval) // reset timer
    this.isRunning = true

    await this.updateConfig()
    await this.checkConfig()

    let now = moment(moment.now())

    if (this.SundialConfig.latitude || this.SundialConfig.longitude) {
      console.info('Sundial will try to use your configurated location')
      this.tides = await this.useLatitudeLongitude(now)
    } else if (this.SundialConfig.autoLocale) {
      console.info('Sundial will try to detect your location automatically')
      this.tides = await this.useAutoLocale(now)
    }

    if (this.SundialConfig.dayVariable || this.SundialConfig.nightVariable) {
      this.setVariable()
    }

    const nowIsBeforeSunrise = now.isBefore(this.tides.sunrise)
    const nowIsAfterSunrise = now.isAfter(this.tides.sunrise)
    const nowIsBeforeSunset = now.isBefore(this.tides.sunset)
    const nowIsAfterSunset = now.isAfter(this.tides.sunset)

    if (this.SundialConfig.debug) {
      console.log('(Sundial) => Sunrise:', this.tides.sunrise)
      console.log('(Sundial) => Sunset:', this.tides.sunset)
      console.log('(Sundial) => nowIsBeforeSunrise:', nowIsBeforeSunrise)
      console.log('(Sundial) => nowIsAfterSunrise:', nowIsAfterSunrise)
      console.log('(Sundial) => nowIsBeforeSunset:', nowIsBeforeSunset)
      console.log('(Sundial) => nowIsAfterSunset:', nowIsAfterSunset)
    }

    if (nowIsAfterSunrise && nowIsBeforeSunset) {
      console.info('Sundial applied your day theme! 🌕')
      this.changeThemeTo(this.SundialConfig.dayTheme)
    } else if (nowIsBeforeSunrise || nowIsAfterSunset) {
      console.info('Sundial applied your night theme! 🌑')
      this.changeThemeTo(this.SundialConfig.nightTheme)
    }

    await this.timer(400) // Cool down 😴
    this.isRunning = false
    this.automater()
  }

  private async useLatitudeLongitude(now: moment.Moment): Promise<ITides> {
    if (!this.SundialConfig.latitude || !this.SundialConfig.longitude) {
      throw window.showErrorMessage(
        'Sundial needs both, latitude and longitude, to work with this configuration!'
      )
    }

    if (this.SundialConfig.debug) {
      console.log('(Sundial) => Latitude:', this.SundialConfig.latitude)
      console.log('(Sundial) => Longitude:', this.SundialConfig.longitude)
    }

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
    const ip: string = await v4({
      https: this.SundialConfig.useHTTPS,
    })
    let storedPublicIP: string = this.extensionContext.globalState.get('userPublicIP') || ''
    let latitude: number = this.extensionContext.globalState.get('userLatitude') || 0
    let longitude: number = this.extensionContext.globalState.get('userLongitude') || 0
    if (this.SundialConfig.debug) {
      console.log('(Sundial) => Public IP:', ip)
      console.log('(Sundial) => Stored public IP:', storedPublicIP)
      console.log('(Sundial) => Stored latitude:', latitude)
      console.log('(Sundial) => Stored longitude:', longitude)
    }

    // only pull new location data if the location has really changed or while debugging
    if (storedPublicIP !== ip || (!latitude || !longitude) || this.SundialConfig.debug) {
      console.info('Sundial detected a location change and will search for your location again')
      const url = this.ipapi.replace('{IP}', ip)
      if (this.SundialConfig.debug) {
        console.info('(Sundial) => Calling ipapi...')
      }
      const gotPromise = await got(url) // request to ipapi
      const ipapiResponse: IpapiResponse = JSON.parse(gotPromise.body)
      if (!ipapiResponse.latitude && !ipapiResponse.longitude) {
        if (!ipapiResponse.success && ipapiResponse.error) {
          if (ipapiResponse.error.code === 104) {
            throw window.showErrorMessage(
              'We are sorry but ipapi request limit is reached (10.000 request per month). Please add your location manually and create an issue on GitHub!'
            )
          }
          console.error('(Sundial) => ERROR:', ipapiResponse.error.info)
          throw window.showErrorMessage(
            'Oops, something went wrong pulling your location from ipapi! Maybe it is a problem on their side. Please create an issue on GitHub should this problem persist.'
          )
        }
      }
      if (this.SundialConfig.debug) {
        console.log('(Sundial) => Success:', ipapiResponse)
      }
      latitude = ipapiResponse.latitude
      longitude = ipapiResponse.longitude
      this.extensionContext.globalState.update('userPublicIP', ip)
      this.extensionContext.globalState.update('userLatitude', latitude)
      this.extensionContext.globalState.update('userLongitude', longitude)
    } else {
      console.info('Sundial will use your cached location')
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
      console.log('(SundialConfig) =>', this.SundialConfig)
      console.log('(SundialTides) =>', this.tides)
      console.log('(WorkbenchConfig) =>', this.WorkbenchConfig)
    }
  }

  disablePolos() {
    console.info('Removing the polos from the sundial...')
    this.polos = false
    clearInterval(this.interval)
  }

  changeThemeTo(newTheme: string) {
    if (newTheme !== this.WorkbenchConfig.colorTheme) {
      const status: any = this.WorkbenchConfig.update('colorTheme', <string>newTheme, true)

      if (status._hasError) {
        console.error('(Sundial) => ERROR:', status)
        throw window.showErrorMessage(
          'Oops, something went wrong while changing your theme. Please set debugging to true and post an issue with the console output!'
        )
      }
    }
  }
}
