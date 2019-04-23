import loglevel from 'loglevel'

const color = {
  orange: 'color: #a06a00;',
}

const originalFactory = loglevel.methodFactory

loglevel.methodFactory = (methodName, logLevel, loggerName) => {
  const rawMethod = originalFactory(methodName, logLevel, loggerName)
  const devider = ':'
  const name = loggerName ? devider + loggerName : ''
  const prefix = `%c(Sundial${name}) => `

  return (...messages) => {
    rawMethod(prefix, color.orange, ...messages)
  }
}

loglevel.setDefaultLevel(loglevel.levels.INFO)

export = loglevel
