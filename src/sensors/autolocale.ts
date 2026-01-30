import { addMinutes, isAfter } from 'date-fns'
import { getTimes } from 'suncalc'
import { window } from 'vscode'

import { log } from '../logger'
import { Sundial, type Tides } from '../sundial'

interface GeoResponse {
	lat: number
	lon: number
}

export function isValidGeoResponse(data: unknown): data is GeoResponse {
	return (
		typeof data === 'object' &&
		data !== null &&
		'lat' in data &&
		'lon' in data &&
		typeof (data as GeoResponse).lat === 'number' &&
		typeof (data as GeoResponse).lon === 'number'
	)
}

let now = new Date()
let end = addMinutes(now, -1)

export async function getAutoLocale(): Promise<Tides> {
	now = new Date()

	const timeout = isAfter(now, end)
	const context = Sundial.extensionContext

	let latitude = context.globalState.get<number>('userLatitude')
	let longitude = context.globalState.get<number>('userLongitude')

	log('Auto locale timeout', timeout)

	if (timeout) {
		end = addMinutes(now, 360) // 6 hours

		try {
			const response = await fetch('http://ip-api.com/json/?fields=lat,lon') // must be http

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`)
			}

			const data: unknown = await response.json()

			if (!isValidGeoResponse(data)) {
				throw new Error('Invalid response format from geolocation API')
			}

			latitude = data.lat
			longitude = data.lon

			context.globalState.update('userLatitude', latitude)
			context.globalState.update('userLongitude', longitude)
		} catch (error) {
			if (error instanceof Error) {
				log(error.message)
			}
			window.showErrorMessage('Fetching your location went wrong, please open an issue')
		}
	} else {
		log('Not connected, reusing existing geolocation')
	}

	if (!(latitude && longitude)) {
		latitude = 0
		longitude = 0
		window.showInformationMessage('Unable to fetch or use cached location, please set manually')
	}

	log('Auto locale latitude', latitude)
	log('Auto locale longitude', longitude)

	const tides = getTimes(now, latitude, longitude)

	return {
		sunrise: tides.sunrise,
		sunset: tides.sunset,
	}
}
