import {
	type ConfigurationChangeEvent,
	commands,
	type ExtensionContext,
	window,
	workspace,
} from "vscode"

import { TimeName } from "./editor.js"
import { outputChannel } from "./logger.js"
import { Sundial } from "./sundial.js"

const sundial = new Sundial() // Hi!

function check() {
	sundial.check()
}

function configChanged(event: ConfigurationChangeEvent) {
	if (
		event.affectsConfiguration("sundial") ||
		event.affectsConfiguration("workbench.preferredDarkColorTheme") ||
		event.affectsConfiguration("workbench.preferredDarkColorTheme")
	) {
		sundial.enableExtension()
	}
}

export function activate(context: ExtensionContext): void {
	Sundial.extensionContext = context

	outputChannel.clear()

	if (sundial.enabled) {
		sundial.enableExtension()
	}

	context.subscriptions.push(
		window.onDidChangeWindowState(check),
		window.onDidChangeActiveTextEditor(check),
		window.onDidChangeTextEditorViewColumn(check),
		workspace.onDidChangeConfiguration(configChanged),
	)

	commands.registerCommand("sundial.switchToNightTheme", () =>
		sundial.toggleTheme(TimeName.Night),
	)
	commands.registerCommand("sundial.switchToDayTheme", () =>
		sundial.toggleTheme(TimeName.Day),
	)
	commands.registerCommand("sundial.toggleDayNightTheme", () => sundial.toggleTheme())

	commands.registerCommand("sundial.enableExtension", () => sundial.enableExtension())
	commands.registerCommand("sundial.disableExtension", () => sundial.disableExtension())
}

export function deactivate(): void {
	sundial.disableExtension()
	outputChannel.dispose()
}
