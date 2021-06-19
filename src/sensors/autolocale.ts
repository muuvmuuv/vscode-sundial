import { window } from 'vscode'

import dayjs from 'dayjs'
import got from 'got'
import publicIp from 'public-ip'
import { getTimes } from 'suncalc'

import { getLogger } from '../logger'
import Sundial, { Tides } from '../sundial'
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
  const log = getLogger('useAutoLocale')

  now = dayjs()

  const timeout = now.isAfter(end, 'minute')
  const context = Sundial.extensionContext

  let latitude = context.globalState.get('userLatitude') as number
  let longitude = context.globalState.get('userLongitude') as number

  log.debug(timeout)

  const connected = await checkConnection()

  if (connected && timeout) {
    end = now.add(5, 'minute')

    try {
      const ip = await publicIp.v4()
      log.debug('Public ip:', ip)

      const response: Response = await got(`${geoAPI}/${ip}`, {
        timeout: 2000,
        retry: 0,
        followRedirect: false,
        methodRewriting: false,
      }).json()
      log.debug('Response:', JSON.stringify(response.geo, undefined, 2))

      latitude = response.geo.latitude
      longitude = response.geo.longitude

      void context.globalState.update('userLatitude', latitude)
      void context.globalState.update('userLongitude', longitude)
    } catch (error) {
      log.error(error)
      void window.showErrorMessage(
        'Oops, something went wrong collecting your geolocation! ' +
          'Maybe it is a problem with the API. Please create an issue ' +
          'on GitHub should this problem persist.'
      )
    }
  } else {
    log.info('Not connected to internet, reusing existing geolocation')
  }

  if (!latitude || !longitude) {
    latitude = 0
    longitude = 0
    void window.showInformationMessage(
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
