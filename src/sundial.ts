import { addMinutes, isAfter, isBefore, parse } from "date-fns"
import {
	type ExtensionContext,
	StatusBarAlignment,
	type StatusBarItem,
	type WorkspaceConfiguration,
	window,
} from "vscode"

import { changeToDay, changeToNight, getConfig, TimeName, toggleTheme } from "./editor.js"
import { log } from "./logger.js"
import { getAutoLocale } from "./sensors/autolocale.js"
import { getLatLong } from "./sensors/latlong.js"

const STATE_ENABLED = "sundial.enabled"

export interface Tides {
	sunrise: Date
	sunset: Date
}

export interface SundialConfiguration extends WorkspaceConfiguration {
	sunrise: string
	sunset: string
	latitude: string
	longitude: string
	autoLocale: boolean
	dayVariable: number
	nightVariable: number
	daySettings: WorkspaceConfiguration
	nightSettings: WorkspaceConfiguration
	statusBarItemPriority: number
	interval: number
}

export class Sundial {
	static readonly extensionName = "Sundial"
	static readonly extensionAlias = "sundial"

	static extensionContext: ExtensionContext

	private isRunning = false
	private checkInterval!: NodeJS.Timeout
	private statusBarItem?: StatusBarItem

	get enabled(): boolean {
		return Sundial.extensionContext.globalState.get(STATE_ENABLED, true)
	}

	/**
	 * Enable the automation and checks.
	 */
	enableExtension(): void {
		log("Enabling Sundial")

		Sundial.extensionContext.globalState.update(STATE_ENABLED, true)

		this.automator()
		this.check()

		if (!this.statusBarItem) {
			this.createStatusBarIcon()
		} else {
			this.statusBarItem.show()
		}
	}

	/**
	 * Disable the extension automation and checks.
	 */
	disableExtension(): void {
		log("Disabling Sundial")
		Sundial.extensionContext.globalState.update(STATE_ENABLED, false)
		this.killAutomator()
	}

	/**
	 * Create and start the automator interval.
	 */
	automator(): void {
		if (!this.enabled) {
			this.killAutomator()
			return
		}

		const { sundial } = getConfig()
		if (sundial.interval === 0) {
			log("Automator offline")
			return
		}
		log("Automator online")

		const interval = 1000 * 60 * sundial.interval
		this.checkInterval = setInterval(() => {
			log("Run autocheck")
			this.check()
		}, interval)
	}

	/**
	 * Kill the automator interval.
	 */
	killAutomator(): void {
		clearInterval(this.checkInterval)
	}

	/**
	 * Main check. Will change theme if needed.
	 */
	async check(): Promise<void> {
		if (!this.enabled || this.isRunning) {
			return // disabled or already running
		}

		log("Check initialized")

		this.isRunning = true
		this.killAutomator()

		const currentTimeName = await this.getCurrentTime()
		log(`Current time is ${currentTimeName}`)

		if (currentTimeName === TimeName.Day) {
			log("Will apply your day theme")
			changeToDay()
		} else {
			log("Will apply your night theme")
			changeToNight()
		}

		this.isRunning = false
		this.automator()
	}

	/**
	 * Toggle the theme and disable the extension. So no automation
	 * will be done until you enable it again.
	 *
	 * @see toggleTheme
	 */
	toggleTheme(time?: TimeName): void {
		this.disableExtension()
		toggleTheme(time)
	}

	/**
	 * Set the status bar icon to toggle the theme.
	 */
	private createStatusBarIcon(): void {
		const { sundial } = getConfig()

		this.statusBarItem = window.createStatusBarItem(
			StatusBarAlignment.Right,
			sundial.statusBarItemPriority,
		)
		this.statusBarItem.accessibilityInformation = {
			label: "Toggle day/night theme",
			role: "button",
		}
		this.statusBarItem.command = "sundial.toggleDayNightTheme"
		this.statusBarItem.text = "$(color-mode)"
		this.statusBarItem.tooltip = "Toggle day/night theme"

		Sundial.extensionContext.subscriptions.push(this.statusBarItem)

		this.statusBarItem.show()
	}

	/**
	 * Get current time name based on sunrise and sunset.
	 */
	private async getCurrentTime(): Promise<TimeName> {
		const tides = await this.getTides()

		const { nowIsBeforeSunrise, nowIsAfterSunrise, nowIsBeforeSunset, nowIsAfterSunset } =
			this.evaluateTides(tides)

		if (nowIsAfterSunrise && nowIsBeforeSunset) {
			log("It is", TimeName.Day)
			return TimeName.Day
		}

		if (nowIsBeforeSunrise || nowIsAfterSunset) {
			log("It is", TimeName.Night)
			return TimeName.Night
		}

		return TimeName.Night // always return something
	}

	/**
	 * Get sunrise and sunset based on user settings.
	 */
	private async getTides(): Promise<Tides> {
		const { sundial } = getConfig()

		if (sundial.latitude && sundial.longitude) {
			log("Will use your latitude and longitude")
			return getLatLong()
		}

		if (sundial.autoLocale) {
			log("Will now try to detect your location")
			return await getAutoLocale()
		}

		log("Will use your time settings")

		return {
			sunrise: parse(sundial.sunrise, "HH:mm", new Date()),
			sunset: parse(sundial.sunset, "HH:mm", new Date()),
		}
	}

	/**
	 * Set the time variables based on tides.
	 */
	private evaluateTides(tides: Tides) {
		const { sundial } = getConfig()

		let { sunrise, sunset } = tides
		if (sundial.dayVariable) {
			sunrise = addMinutes(sunrise, sundial.dayVariable)
			log(`Adjusted ${sundial.dayVariable} minutes from day`)
		}
		if (sundial.nightVariable) {
			sunset = addMinutes(sunset, sundial.nightVariable)
			log(`Adjusted ${sundial.nightVariable} minutes from night`)
		}

		const now = Date.now()

		const nowIsBeforeSunrise = isBefore(now, sunrise)
		const nowIsAfterSunrise = isAfter(now, sunrise)
		const nowIsBeforeSunset = isBefore(now, sunset)
		const nowIsAfterSunset = isAfter(now, sunset)

		log("Now:", now)
		log("Sunrise:", sunrise)
		log("Sunset:", sunset)
		log("nowIsBeforeSunrise:", nowIsBeforeSunrise)
		log("nowIsAfterSunrise:", nowIsAfterSunrise)
		log("nowIsBeforeSunset:", nowIsBeforeSunset)
		log("nowIsAfterSunset:", nowIsAfterSunset)

		return {
			nowIsBeforeSunrise,
			nowIsAfterSunrise,
			nowIsBeforeSunset,
			nowIsAfterSunset,
		}
	}
}
