'use strict'

import {
  window,
  ExtensionContext,
  commands,
  workspace,
  ConfigurationChangeEvent,
} from 'vscode'
import Sundial from './sundial'
import { outputChannel } from './logger'
import { toggleTheme as editorToggleTheme, TimeNames } from './editor'

const sundial = new Sundial() // Hi!

function check() {
  sundial.check()
}

function toggleTheme(time?: TimeNames) {
  sundial.disableExtension()
  editorToggleTheme(time)
}

function configChanged(event: ConfigurationChangeEvent) {
  const sundialConfig = event.affectsConfiguration('sundial')
  const darkColorTheme = event.affectsConfiguration('workbench.preferredDarkColorTheme')
  const lightColorTheme = event.affectsConfiguration('workbench.preferredDarkColorTheme')

  if (sundialConfig || darkColorTheme || lightColorTheme) {
    sundial.check()
  }
}

export function activate(context: ExtensionContext) {
  Sundial.extensionContext = context
  outputChannel.clear()

  sundial.enableExtension()

  context.subscriptions.push(window.onDidChangeWindowState(check))
  context.subscriptions.push(window.onDidChangeActiveTextEditor(check))
  context.subscriptions.push(window.onDidChangeTextEditorViewColumn(check))

  context.subscriptions.push(workspace.onDidChangeConfiguration(configChanged))

  commands.registerCommand('sundial.switchToNightTheme', () =>
    toggleTheme(TimeNames.Night)
  )
  commands.registerCommand('sundial.switchToDayTheme', () => toggleTheme(TimeNames.Day))
  commands.registerCommand('sundial.toggleDayNightTheme', () => toggleTheme())
  commands.registerCommand('sundial.continueAutomation', () => sundial.enableExtension())
}

export function deactivate() {
  sundial.disableExtension()
  outputChannel.dispose()
}
