import { type WorkspaceConfiguration, window, workspace } from "vscode"

import { log } from "./logger.js"
import type { SundialConfiguration } from "./sundial.js"

// Config cache - invalidated on config changes
let configCache: {
	sundial: SundialConfiguration
	workbench: WorkspaceConfiguration
} | null = null

export function getConfig(force?: boolean) {
	if (!configCache || force) {
		configCache = {
			sundial: workspace.getConfiguration("sundial") as SundialConfiguration,
			workbench: workspace.getConfiguration("workbench"),
		}
	}
	return configCache
}

// Call this when config changes to invalidate cache
export function invalidateConfigCache(): void {
	configCache = null
}

export function applySettings(settings: WorkspaceConfiguration): void {
	if (!settings) {
		return // no settings, nothing to do
	}

	// log("NEW", JSON.stringify(settings, undefined, 2))

	const workspaceSettings = workspace.getConfiguration()

	for (const k of Object.keys(settings)) {
		if (k === "workbench.colorTheme") {
			continue // do not override `workbench.colorTheme`
		}

		const configString = settings[k] as string

		workspaceSettings.update(k, configString, true).then(undefined, (error) => {
			log(error)
			window.showErrorMessage(
				`You tried to apply \`${k}: ${configString}\` but this is not a valid VS Code settings key/value pair. Please make sure all settings that you give to Sundial are valid inside VS Code settings!`,
			)
		})
	}
}

export const TimeName = {
	Day: "day",
	Night: "night",
}

export type TimeName = (typeof TimeName)[keyof typeof TimeName]

export function changeThemeTo(newTheme: string): void {
	log("Changing theme to", newTheme)
	const { workbench } = getConfig(true)
	if (newTheme !== workbench.colorTheme) {
		workbench.update("colorTheme", newTheme, true)
	}
}

export function changeToDay(): void {
	const { sundial, workbench } = getConfig()
	changeThemeTo(workbench.preferredLightColorTheme)
	applySettings(sundial.daySettings)
}

export function changeToNight(): void {
	const { sundial, workbench } = getConfig()
	changeThemeTo(workbench.preferredDarkColorTheme)
	applySettings(sundial.nightSettings)
}

export function toggleTheme(time?: TimeName): void {
	log("Toggle theme to", time || "toggle")

	if (time === TimeName.Day) {
		changeToDay()
		return
	}

	if (time === TimeName.Night) {
		changeToNight()
		return
	}

	const config = getConfig(true)
	if (config.workbench.preferredDarkColorTheme === config.workbench.colorTheme) {
		changeToDay()
	} else {
		changeToNight()
	}
}
