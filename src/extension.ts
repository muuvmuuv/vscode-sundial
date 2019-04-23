'use strict'

import {
  window,
  ExtensionContext,
  commands,
  TextEditorViewColumnChangeEvent,
  TextEditor,
  WindowState,
} from 'vscode'
import Sundial from './sundial'
import logger from './utils/logger'

const sundial = new Sundial()

/**
 * Activate extension.
 *
 * @param context Extension utilities
 */
export function activate(context: ExtensionContext) {
  sundial.context = context
  sundial.check() // first check

  context.subscriptions.push(window.onDidChangeWindowState(check))
  context.subscriptions.push(window.onDidChangeActiveTextEditor(check))
  context.subscriptions.push(window.onDidChangeTextEditorViewColumn(check))

  commands.registerCommand('sundial.switchToNightTheme', () => toggleTheme('night'))
  commands.registerCommand('sundial.switchToDayTheme', () => toggleTheme('day'))
  commands.registerCommand('sundial.toggleDayNightTheme', () => toggleTheme())
  commands.registerCommand('sundial.continueAutomation', async () => {
    logger.info('Attaching the polos to the sundial again...')
    await sundial.updateConfig()
    sundial.polos = true
    automater()
  })

  automater()
  logger.info('Sundial is now active! ☀️')
}

/**
 * Init the Sundial automater.
 */
function automater() {
  if (sundial.SundialConfig.interval !== 0) {
    logger.info(`Sundial will automatically run every ${sundial.SundialConfig.interval} minute/s.`)
    sundial.automater()
  }
}

/**
 * Run sundial check.
 *
 * @param state Represents an event describing the change of a text editor's view column
 */
function check(state: TextEditorViewColumnChangeEvent | TextEditor | WindowState | undefined) {
  // logger.debug('check.State', state)
  sundial.check()
}

/**
 * Change theme.
 *
 * @param which Day or night theme
 */
async function toggleTheme(which?: string) {
  await sundial.updateConfig()
  await sundial.disablePolos()

  switch (which) {
    case 'day':
      sundial.changeThemeTo(sundial.SundialConfig.dayTheme)
      break
    case 'night':
      sundial.changeThemeTo(sundial.SundialConfig.nightTheme)
      break
    default:
      const currentTheme = sundial.WorkbenchConfig.colorTheme
      if (currentTheme === sundial.SundialConfig.dayTheme) {
        sundial.changeThemeTo(sundial.SundialConfig.nightTheme)
      } else {
        sundial.changeThemeTo(sundial.SundialConfig.dayTheme)
      }
      break
  }
}
