import { window } from 'vscode'

export enum LogLevel {
  SILENT,
  INFO,
  DEBUG,
}

type AllowedTypes = string | number | boolean

export const loggers: Logger[] = []
export const outputChannel = window.createOutputChannel('Sundial')

export function setLogLevelAll(level: LogLevel) {
  loggers.forEach((l) => {
    l.logLevel = level
  })
}

class Logger {
  name: string
  logLevel: LogLevel

  constructor(name: string, logLevel = LogLevel.INFO) {
    this.name = name
    this.logLevel = logLevel
  }

  debug(...messages: AllowedTypes[]) {
    if (this.logLevel !== LogLevel.DEBUG) return
    const message = this.buildLogString(LogLevel.DEBUG, messages)
    outputChannel.appendLine(message)
  }

  info(...messages: AllowedTypes[]) {
    if (this.logLevel !== LogLevel.INFO) return
    const message = this.buildLogString(LogLevel.INFO, messages)
    outputChannel.appendLine(message)
  }

  private buildLogString(logLevel: LogLevel, messages: AllowedTypes[]): string {
    const template: string[] = []
    template.push(`[${LogLevel[logLevel].toUpperCase()}]`)
    template.push(`(Sundial:${this.name})`)
    template.push(`=>`)
    messages.forEach((msg) => {
      template.push(msg.toString())
    })
    return template.join(' ')
  }
}

export function getLogger(name: string) {
  const logger = loggers.find((l) => l.name === name)
  if (logger) {
    return logger
  } else {
    const newLogger = new Logger(name)
    loggers.push(newLogger)
    return newLogger
  }
}
