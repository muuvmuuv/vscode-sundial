// https://github.com/sindresorhus/node-dark-mode

import darkMode from 'dark-mode'
import { logger } from '../logger'

async function SystemTheme() {
  const log = logger.getLogger('SystemTheme')
  const result = await darkMode.isDark()
  log.debug('darkMode', result)
  return result
}

export default SystemTheme
