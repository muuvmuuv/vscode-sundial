import logger from 'loglevel'

const color = {
  orange: 'color: #a06a00;',
}

const originalFactory = logger.methodFactory

logger.methodFactory = (methodName, logLevel, loggerName) => {
  const rawMethod = originalFactory(methodName, logLevel, loggerName)
  const devider = ':'
  const name = loggerName ? devider + loggerName : ''
  const prefix = `%c(Sundial${name}) => `

  return (...messages) => {
    rawMethod(prefix, color.orange, ...messages)
  }
}

logger.setDefaultLevel(logger.levels.INFO)

function setGlobalLevel(level: any) {
  Object.values(logger.getLoggers()).forEach(lgr => {
    lgr.setLevel(level)
  })
}

export { logger, setGlobalLevel }
