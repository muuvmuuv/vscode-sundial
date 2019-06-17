'use strict'

import { window, ExtensionContext, commands, workspace } from 'vscode'
import Sundial from './sundial'
import { logger } from './logger'
import * as editor from './editor'

const sundial = new Sundial() // hi!

/**
 * Activate extension.
 *
 * @param context Extension utilities
 */
export function activate(context: ExtensionContext) {
  sundial.context = context
  sundial.check() // first check

  sundial.SundialConfig.windowEvents.forEach(event => {
    context.subscriptions.push(window[event](check))
  })

  sundial.SundialConfig.workspaceEvents.forEach(event => {
    context.subscriptions.push(workspace[event](check))
  })

  commands.registerCommand('sundial.switchToNightTheme', () => toggleTheme('night'))
  commands.registerCommand('sundial.switchToDayTheme', () => toggleTheme('day'))
  commands.registerCommand('sundial.toggleDayNightTheme', () => toggleTheme())
  commands.registerCommand('sundial.continueAutomation', async () => {
    logger.info('Attaching the polos to the sundial again...')
    await sundial.updateConfig()
    sundial.polos = true
    sundial.check()
  })

  sundial.automater()
  logger.info('Sundial is now active! ☀️')
}

function check() {
  sundial.check()
}

async function toggleTheme(time?: string) {
  await sundial.updateConfig()
  sundial.disablePolos()
  editor.toggleTheme(time)
}
