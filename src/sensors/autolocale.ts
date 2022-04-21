import dayjs from 'dayjs'
import got from 'got'
import isOnline from 'is-online'
import { getTimes } from 'suncalc'
import { window } from 'vscode'

import { getConfig } from '../editor'
import { getLogger, LogLevel } from '../logger'
import Sundial, { Tides } from '../sundial'

interface Response {
  lat: number
  lon: number
}

let now = dayjs()
let end = now.add(-1, 'minute')

async function AutoLocale(): Promise<Tides> {
  const log = getLogger('useAutoLocale')

  now = dayjs()

  const timeout = now.isAfter(end, 'minute')
  const context = Sundial.extensionContext

  let latitude = context.globalState.get<number>('userLatitude')
  let longitude = context.globalState.get<number>('userLongitude')

  log.debug('Timeout:', timeout)

  const config = getConfig()
  const connected = await isOnline()

  if (connected && (timeout || config.sundial.debug === LogLevel.DEBUG)) {
    end = now.add(5, 'minute')

    try {
      const { lat, lon }: Response = await got(
        `http://ip-api.com/json/?fields=lat,lon`,
      ).json()

      latitude = lat
      longitude = lon

      context.globalState.update('userLatitude', latitude)
      context.globalState.update('userLongitude', longitude)
    } catch (error) {
      log.error(error as string)
      window.showErrorMessage(
        'Oops, something went wrong collecting your geolocation! ' +
          'Maybe it is a problem with the API. Please create an issue ' +
          'on GitHub should this problem persist.',
      )
    }
  } else {
    log.info('Not connected to internet, reusing existing geolocation')
  }

  if (!latitude || !longitude) {
    latitude = 0
    longitude = 0
    window.showInformationMessage(
      "It seems you have been offline since the first start of VS Code, so we haven't had the chance to cache your location. Please go online or set your location manually.",
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
