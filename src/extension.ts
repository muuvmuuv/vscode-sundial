'use strict'

import { window, ExtensionContext, commands, workspace } from 'vscode'
import Sundial from './sundial'
import * as editor from './editor'

const sundial = new Sundial() // Hi!

export function activate(context: ExtensionContext) {
  const config = editor.getConfig()

  Sundial.extensionContext = context
  sundial.enableExtension()

  config.sundial.windowEvents.forEach((event) => {
    context.subscriptions.push(window[event](check))
  })

  config.sundial.workspaceEvents.forEach((event) => {
    context.subscriptions.push(workspace[event](check))
  })

  commands.registerCommand('sundial.switchToNightTheme', () => toggleTheme(editor.TimeNames.Night))
  commands.registerCommand('sundial.switchToDayTheme', () => toggleTheme(editor.TimeNames.Day))
  commands.registerCommand('sundial.toggleDayNightTheme', () => toggleTheme())
  commands.registerCommand('sundial.continueAutomation', () => sundial.enableExtension())
}

export function deactivate() {
  sundial.disableExtension()
}

function check() {
  sundial.check()
}

async function toggleTheme(time?: editor.TimeNames) {
  sundial.disableExtension()
  editor.toggleTheme(time)
}
