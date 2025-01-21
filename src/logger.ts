import { window } from "vscode"

export enum LogLevel {
	Silent = 0,
	Info = 1,
	Error = 2,
	Debug = 3,
}

type AllowedTypes = string | number | boolean | object

export const loggers: Logger[] = []
export const outputChannel = window.createOutputChannel("Sundial")

export function setLogLevelAll(level: LogLevel): void {
	for (const l of loggers) {
		l.logLevel = level
	}
}

class Logger {
	readonly name: string
	logLevel: LogLevel

	constructor(name: string, logLevel = LogLevel.Info) {
		this.name = name
		this.logLevel = logLevel
	}

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
		if (this.logLevel < level) {
			return
		}
		outputChannel.appendLine(this.buildLogString(level, messages))
	}

	private buildLogString(logLevel: LogLevel, messages: AllowedTypes[]): string {
		const template: string[] = []
		template.push(`[${LogLevel[logLevel].toUpperCase()}]`, `(Sundial:${this.name})`, "=>")
		for (const message of messages) {
			template.push(message.toString())
		}
		return template.join(" ")
	}
}

export function getLogger(name: string): Logger {
	const logger = loggers.find((l) => l.name === name)
	if (logger) {
		return logger
	}
	const newLogger = new Logger(name)
	loggers.push(newLogger)
	return newLogger
}
