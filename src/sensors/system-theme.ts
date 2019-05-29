// https://github.com/sindresorhus/node-dark-mode/blob/master/index.js

import runJxa from 'run-jxa'

async function SystemTheme() {
  const result = await runJxa(
    `return Application('System Events').appearancePreferences.darkMode()`
  )
  return result
}

export default SystemTheme
