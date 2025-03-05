import os from "node:os"
import { log } from "./logger.js"

// TODO: replace this once VS Code offers to use Electron isOnline method

/**
 * Check if device is "online".
 *
 * Thanks to https://github.com/sindresorhus/is-online but I want to
 * remove more dependencies and it did too much checks.
 */
export async function isOnline() {
	if (
		Object.values(os.networkInterfaces())
			.flat()
			.every((inet) => inet?.internal)
	) {
		log("Offline, only internal interfaces")
		return false
	}

	try {
		const response = await fetch("https://captive.apple.com/hotspot-detect.html")
		const body = await response.text()
		const passed = body.toLowerCase().includes("success")
		log("External check", passed)
		return passed
	} catch {
		return false
	}
}
