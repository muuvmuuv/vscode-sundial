import logger, { LogLevel, Logger } from 'loglevel'

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

// TODO: update https://github.com/pimterry/loglevel/issues/134
function setGlobalLevel(level: any) {
  const loggerList = (logger as any).getLoggers()
  if (loggerList.length <= 0) {
    return
  }
  // console.log(loggerList)
  Object.keys(loggerList).forEach((l: any) => {
    loggerList[l].setLevel(level)
  })
}

export { logger, setGlobalLevel }
