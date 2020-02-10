import dayjs from 'dayjs'
import Sundial, { Tides } from '../sundial'
import got from 'got'
import { window } from 'vscode'
import { getTimes } from 'suncalc'
import publicIp from 'public-ip'
import { getLogger } from '../logger'
import { checkConnection } from '../utils'

interface Response {
  geo: {
    latitude: number
    latitude_dec: string
    longitude: number
    longitude_dec: string
    max_latitude: number
    max_longitude: number
    min_latitude: number
    min_longitude: number
  }
}

const geoAPI = 'https://api.ipgeolocationapi.com/geolocate'
let now = dayjs()
let end = now.add(-1, 'minute')

async function AutoLocale(): Promise<Tides> {
  now = dayjs()
  const timeout = now.isAfter(end, 'minute')
  const log = getLogger('useAutoLocale')
  const ctx = Sundial.extensionContext
  let latitude = ctx.globalState.get('userLatitude') as number
  let longitude = ctx.globalState.get('userLongitude') as number

  const connected = await checkConnection()
  if (connected && timeout) {
    end = now.add(5, 'minute')

    try {
      const ip = await publicIp.v4()
      const response: Response = await got(`${geoAPI}/${ip}`).json()
      latitude = response.geo.latitude
      longitude = response.geo.longitude
      ctx.globalState.update('userLatitude', latitude)
      ctx.globalState.update('userLongitude', longitude)
    } catch (error) {
      log.debug(error)
      window.showErrorMessage(
        'Oops, something went wrong collecting your geolocation! ' +
          'Maybe it is a problem with the API. Please create an issue ' +
          'on GitHub should this problem persist.'
      )
    }
  }

  if (!latitude || !longitude) {
    latitude = 0
    longitude = 0
    window.showInformationMessage(
      "It seems you have been offline since first start of VS Code, so we haven't had the chance to cache your location. Please go online or set your location manually."
    )
  }

  log.debug('Latitude:', latitude)
  log.debug('Longitude:', longitude)

  const tides = getTimes(now.toDate(), latitude, longitude)

  return {
    sunrise: dayjs(tides.sunrise),
    sunset: dayjs(tides.sunset),
  }
}

export default AutoLocale
