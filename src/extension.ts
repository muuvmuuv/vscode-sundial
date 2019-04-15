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

  commands.registerCommand('sundial.switchToNightTheme', () => changeTheme('night'))
  commands.registerCommand('sundial.switchToDayTheme', () => changeTheme('day'))
  commands.registerCommand('sundial.toggleDayNightTheme', () => changeTheme())
  commands.registerCommand('sundial.continueAutomation', async () => {
    console.info('Attaching the polos to the sundial again...')
    await sundial.updateConfig()
    sundial.automater()
    sundial.polos = true
  })

  if (sundial.SundialConfig.interval !== 0) {
    sundial.automater()
  }

  console.info('Sundial is now active! ☀️')
}

/**
 * Run sundial check.
 *
 * @param state Represents an event describing the change of a text editor's view column
 */
function check(state: TextEditorViewColumnChangeEvent | TextEditor | WindowState | undefined) {
  if (sundial.SundialConfig.debug) {
    console.log(state)
  }
  sundial.check()
}

/**
 * Change theme.
 *
 * @param which Day or night theme
 */
async function changeTheme(which?: string) {
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
