import {
  commands,
  ConfigurationChangeEvent,
  ExtensionContext,
  window,
  workspace,
} from 'vscode'

import { TimeNames } from './editor'
import { outputChannel } from './logger'
import Sundial from './sundial'

const sundial = new Sundial() // Hi!

function check() {
  sundial.check()
}

function configChanged(event: ConfigurationChangeEvent) {
  if (
    event.affectsConfiguration('sundial') ||
    event.affectsConfiguration('workbench.preferredDarkColorTheme') ||
    event.affectsConfiguration('workbench.preferredDarkColorTheme')
  ) {
    check()
  }
}

export function activate(context: ExtensionContext): void {
  Sundial.extensionContext = context

  outputChannel.clear()

  if (sundial.enabled) {
    sundial.enableExtension()
  }

  context.subscriptions.push(
    window.onDidChangeWindowState(check),
    window.onDidChangeActiveTextEditor(check),
    window.onDidChangeTextEditorViewColumn(check),
    workspace.onDidChangeConfiguration(configChanged),
  )

  commands.registerCommand('sundial.switchToNightTheme', () =>
    sundial.toggleTheme(TimeNames.NIGHT),
  )
  commands.registerCommand('sundial.switchToDayTheme', () =>
    sundial.toggleTheme(TimeNames.DAY),
  )
  commands.registerCommand('sundial.toggleDayNightTheme', () => sundial.toggleTheme())

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
