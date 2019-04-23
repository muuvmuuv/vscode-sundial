'use strict'

import { window, ExtensionContext, commands } from 'vscode'
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
    sundial.automater()
  })

  sundial.automater()
  logger.info('Sundial is now active! ☀️')
}

function check() {
  sundial.check()
}

function toggleTheme(time?: string) {
  sundial.disablePolos()
  sundial.toggleTheme(time)
}
