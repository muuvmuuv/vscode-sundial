import { getTimes } from 'suncalc'
import { window } from 'vscode'

import { getConfig } from '../editor'
import { log } from '../logger'
import type { Tides } from '../sundial'

export function getLatLong(): Tides {
	const config = getConfig()

	if (!(config.sundial.latitude && config.sundial.longitude)) {
		throw window.showErrorMessage('Sundial needs both, latitude and longitude')
	}

	log('Config latitude', config.sundial.latitude)
	log('Config longitude', config.sundial.longitude)

	const tides = getTimes(
		new Date(),
		Number(config.sundial.latitude),
		Number(config.sundial.longitude),
	)

	// suncalc v2 returns null at polar latitudes where the sun never crosses the
	// horizon; fall back to an invalid date so evaluateTides resolves to night.
	return {
		sunrise: tides.sunrise ?? new Date(Number.NaN),
		sunset: tides.sunset ?? new Date(Number.NaN),
	}
}
