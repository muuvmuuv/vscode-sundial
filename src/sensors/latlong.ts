import moment = require('moment')
import { ITides } from '../sundial'
import { getConfig } from '../editor'
import { window } from 'vscode'
import { getTimes } from 'suncalc'
import { logger } from '../logger'

async function LatLong(now: moment.Moment): Promise<ITides> {
  const log = logger.getLogger('useLatitudeLongitude')
  const config = await getConfig()

  if (!config.sundial.latitude || !config.sundial.longitude) {
    throw window.showErrorMessage(
      'Sundial needs both, latitude and longitude, to work with this configuration!'
    )
  }

  log.debug('Latitude:', config.sundial.latitude)
  log.debug('Longitude:', config.sundial.longitude)

  const tides = await getTimes(
    now.toDate(),
    Number(config.sundial.latitude),
    Number(config.sundial.longitude)
  )

  return {
    sunrise: moment(tides.sunrise),
    sunset: moment(tides.sunset),
  }
}

export default LatLong
