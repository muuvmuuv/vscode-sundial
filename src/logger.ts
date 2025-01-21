import { window } from "vscode"

type AllowedTypes = string | number | boolean | Date

export const outputChannel = window.createOutputChannel("Sundial")

export function log(...messages: AllowedTypes[]) {
	outputChannel.appendLine(messages.join(" "))
}
