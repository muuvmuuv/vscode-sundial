import isOnline from "is-online"
import { getTimes } from "suncalc"
import { window } from "vscode"

import { addMinutes, isAfter } from "date-fns"
import { log } from "../logger.js"
import { Sundial, type Tides } from "../sundial.js"

interface Response {
	lat: number
	lon: number
}

let now = new Date()
let end = addMinutes(now, -1)

export async function getAutoLocale(): Promise<Tides> {
	now = new Date()

	const timeout = isAfter(now, end)
	const context = Sundial.extensionContext

	let latitude = context.globalState.get<number>("userLatitude")
	let longitude = context.globalState.get<number>("userLongitude")

	log.debug("Auto locale timeout", timeout)

	const connected = await isOnline()

	if (connected && timeout) {
		end = addMinutes(now, 5)

		try {
			const response = await fetch("http://ip-api.com/json/?fields=lat,lon")
			const { lat, lon } = (await response.json()) as Response

			latitude = lat
			longitude = lon

			context.globalState.update("userLatitude", latitude)
			context.globalState.update("userLongitude", longitude)
		} catch (error) {
			if (error instanceof Error) {
				log.error(error.message)
			}
			window.showErrorMessage("Fetching your location went wrong, please open an issue")
		}
	} else {
		log.info("Not connected, reusing existing geolocation")
	}

	if (!(latitude && longitude)) {
		latitude = 0
		longitude = 0
		window.showInformationMessage(
			"Unable to fetch or use cached location, please set manually",
		)
	}

	log.debug("Auto locale latitude", latitude)
	log.debug("Auto locale longitude", longitude)

	const tides = getTimes(now, latitude, longitude)

	return {
		sunrise: tides.sunrise,
		sunset: tides.sunset,
	}
}
