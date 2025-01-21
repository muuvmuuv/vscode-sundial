import { getTimes } from "suncalc"
import { window } from "vscode"

import { getConfig } from "../editor.js"
import { log } from "../logger.js"
import type { Tides } from "../sundial.js"

export function getLatLong(): Tides {
	const config = getConfig()

	if (!(config.sundial.latitude && config.sundial.longitude)) {
		throw window.showErrorMessage("Sundial needs both, latitude and longitude")
	}

	log.debug("Config latitude", config.sundial.latitude)
	log.debug("Config longitude", config.sundial.longitude)

	const tides = getTimes(
		new Date(),
		Number(config.sundial.latitude),
		Number(config.sundial.longitude),
	)

	return {
		sunrise: tides.sunrise,
		sunset: tides.sunset,
	}
}
