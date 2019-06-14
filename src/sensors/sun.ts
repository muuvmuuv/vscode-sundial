import moment = require('moment')
import { ITides } from '../sundial'
import got from 'got'
import { window, ExtensionContext } from 'vscode'
import { getTimes } from 'suncalc'
import { logger } from '../logger'

interface IResponse {
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

async function Sun(ctx: ExtensionContext, now: moment.Moment): Promise<ITides> {
  const log = logger.getLogger('useAutoLocale')
  let latitude: number = 0
  let longitude: number = 0

  try {
    const gotResponse = await got(geoAPI)
    const response: IResponse = JSON.parse(gotResponse.body)
    if ((!response.geo.latitude && !response.geo.longitude) || gotResponse.statusCode !== 200) {
      throw new Error(`[${gotResponse.statusCode}]: ${gotResponse.statusMessage}`)
    }
    log.debug('Response:', response)
    latitude = response.geo.latitude
    longitude = response.geo.longitude
    ctx.globalState.update('userLatitude', latitude)
    ctx.globalState.update('userLongitude', longitude)
  } catch (error) {
    log.error(error)
    window.showErrorMessage(
      'Oops, something went wrong collecting your geolocation! ' +
        'Maybe it is a problem with the API. Please create an issue ' +
        'on GitHub should this problem persist.'
    )
  }

  const tides = await getTimes(now.toDate(), latitude, longitude)
  return {
    sunrise: moment(tides.sunrise),
    sunset: moment(tides.sunset),
  }
}

export default Sun
