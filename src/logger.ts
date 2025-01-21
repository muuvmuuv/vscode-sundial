import { window } from "vscode"

enum LogLevel {
	Silent = 0,
	Info = 1,
	Error = 2,
	Debug = 3,
}

type AllowedTypes = string | number | boolean | Date

export const outputChannel = window.createOutputChannel("Sundial")

class Logger {
	info(...messages: AllowedTypes[]) {
		this.log(messages, LogLevel.Info)
	}

	error(...messages: AllowedTypes[]) {
		this.log(messages, LogLevel.Error)
	}

	debug(...messages: AllowedTypes[]) {
		this.log(messages, LogLevel.Debug)
	}

	private log(messages: AllowedTypes[], level: LogLevel = LogLevel.Silent) {
		const logMessage = `[${LogLevel[level].toUpperCase()}] ${messages.join(" ")}`
		outputChannel.appendLine(logMessage)
	}
}

export const log = new Logger()
