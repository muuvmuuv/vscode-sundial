import {
  commands,
  ConfigurationChangeEvent,
  ExtensionContext,
  window,
  workspace,
} from 'vscode'

import { TimeNames, toggleTheme as editorToggleTheme } from './editor'
import { outputChannel } from './logger'
import Sundial from './sundial'

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
    check()
  }
}

export function activate(context: ExtensionContext): void {
  Sundial.extensionContext = context

  outputChannel.clear()

  sundial.enableExtension()

  context.subscriptions.push(
    window.onDidChangeWindowState(check),
    window.onDidChangeActiveTextEditor(check),
    window.onDidChangeTextEditorViewColumn(check),
    workspace.onDidChangeConfiguration(configChanged),
  )

  commands.registerCommand('sundial.switchToNightTheme', () =>
    toggleTheme(TimeNames.NIGHT),
  )
  commands.registerCommand('sundial.switchToDayTheme', () => toggleTheme(TimeNames.DAY))
  commands.registerCommand('sundial.toggleDayNightTheme', () => toggleTheme())

  commands.registerCommand('sundial.enableExtension', () => sundial.enableExtension())
  commands.registerCommand('sundial.disableExtension', () => sundial.disableExtension())
  commands.registerCommand('sundial.pauseUntilNextCircle', () =>
    sundial.pauseUntilNextCircle(),
  )
}

export function deactivate(): void {
  sundial.disableExtension()
  outputChannel.dispose()
}
