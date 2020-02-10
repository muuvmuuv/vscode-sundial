import dayjs from 'dayjs'
import { Tides } from '../sundial'
import { getConfig } from '../editor'
import { window } from 'vscode'
import { getTimes } from 'suncalc'
import { getLogger } from '../logger'

function LatLong(): Tides {
  const now = dayjs()
  const log = getLogger('useLatitudeLongitude')
  const config = getConfig()

  if (!config.sundial.latitude || !config.sundial.longitude) {
    throw window.showErrorMessage(
      'Sundial needs both, latitude and longitude, to work with this configuration!'
    )
  }

  log.debug('Latitude:', config.sundial.latitude)
  log.debug('Longitude:', config.sundial.longitude)

  const tides = getTimes(
    now.toDate(),
    Number(config.sundial.latitude),
    Number(config.sundial.longitude)
  )

  return {
    sunrise: dayjs(tides.sunrise),
    sunset: dayjs(tides.sunset),
  }
}

export default LatLong
