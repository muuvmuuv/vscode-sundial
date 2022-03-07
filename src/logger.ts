import { window } from 'vscode'

export enum LogLevel {
  SILENT,
  INFO,
  ERROR,
  DEBUG,
}

type AllowedTypes = string | number | boolean | object

export const loggers: Logger[] = []
export const outputChannel = window.createOutputChannel('Sundial')

export function setLogLevelAll(level: LogLevel): void {
  for (const l of loggers) {
    l.logLevel = level
  }
}

class Logger {
  name: string
  logLevel: LogLevel

  constructor(name: string, logLevel = LogLevel.INFO) {
    this.name = name
    this.logLevel = logLevel
  }

  info(...messages: AllowedTypes[]) {
    this.log(messages, LogLevel.INFO)
  }

  error(...messages: AllowedTypes[]) {
    this.log(messages, LogLevel.ERROR)
  }

  debug(...messages: AllowedTypes[]) {
    this.log(messages, LogLevel.DEBUG)
  }

  private log(messages: AllowedTypes[], level: LogLevel = LogLevel.SILENT) {
    if (this.logLevel < level) return
    const message = this.buildLogString(level, messages)
    outputChannel.appendLine(message)
  }

  private buildLogString(logLevel: LogLevel, messages: AllowedTypes[]): string {
    const template: string[] = []
    template.push(`[${LogLevel[logLevel].toUpperCase()}]`, `(Sundial:${this.name})`, `=>`)
    for (const message of messages) {
      template.push(message.toString())
    }
    return template.join(' ')
  }
}

export function getLogger(name: string): Logger {
  const logger = loggers.find((l) => l.name === name)
  if (logger) {
    return logger
  } else {
    const newLogger = new Logger(name)
    loggers.push(newLogger)
    return newLogger
  }
}
