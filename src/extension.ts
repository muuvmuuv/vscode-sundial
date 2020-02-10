'use strict'

import { window, ExtensionContext, commands, workspace } from 'vscode'
import Sundial from './sundial'
import { outputChannel } from './logger'
import * as editor from './editor'

const sundial = new Sundial() // Hi!

function check() {
  sundial.check()
}

function toggleTheme(time?: editor.TimeNames) {
  sundial.disableExtension()
  editor.toggleTheme(time)
}

export function activate(context: ExtensionContext) {
  Sundial.extensionContext = context
  outputChannel.clear()

  sundial.enableExtension()

  context.subscriptions.push(window['onDidChangeWindowState'](check))
  context.subscriptions.push(window['onDidChangeActiveTextEditor'](check))
  context.subscriptions.push(window['onDidChangeTextEditorViewColumn'](check))
  context.subscriptions.push(workspace['onDidChangeConfiguration'](check))

  commands.registerCommand('sundial.switchToNightTheme', () =>
    toggleTheme(editor.TimeNames.Night)
  )
  commands.registerCommand('sundial.switchToDayTheme', () =>
    toggleTheme(editor.TimeNames.Day)
  )
  commands.registerCommand('sundial.toggleDayNightTheme', () => toggleTheme())
  commands.registerCommand('sundial.continueAutomation', () => sundial.enableExtension())
}

export function deactivate() {
  sundial.disableExtension()
  outputChannel.dispose()
}
