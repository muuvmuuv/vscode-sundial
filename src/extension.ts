'use strict'

import { window, ExtensionContext, commands } from 'vscode'
import Sundial from './sundial'

export function activate(context: ExtensionContext) {
  const sundial = new Sundial()

  sundial.context = context
  sundial.check() // first check

  context.subscriptions.push(window.onDidChangeWindowState(check))
  context.subscriptions.push(window.onDidChangeActiveTextEditor(check))
  context.subscriptions.push(window.onDidChangeTextEditorViewColumn(check))

  commands.registerCommand('sundial.switchToNightTheme', async () => {
    console.info('Switching to your night theme...')
    await sundial.updateConfig()
    await sundial.disablePolos()
    sundial.changeThemeTo(sundial.SundialConfig.nightTheme)
  })

  commands.registerCommand('sundial.switchToDayTheme', async () => {
    console.info('Switching to your day theme...')
    await sundial.updateConfig()
    await sundial.disablePolos()
    sundial.changeThemeTo(sundial.SundialConfig.dayTheme)
  })

  commands.registerCommand('sundial.toggleDayNightTheme', async () => {
    console.info('Toggling your theme now...')
    await sundial.updateConfig()
    await sundial.disablePolos()
    const currentTheme = sundial.WorkbenchConfig.colorTheme
    if (currentTheme === sundial.SundialConfig.dayTheme) {
      sundial.changeThemeTo(sundial.SundialConfig.nightTheme)
    } else if (currentTheme === sundial.SundialConfig.nightTheme) {
      sundial.changeThemeTo(sundial.SundialConfig.dayTheme)
    } else {
      window.showInformationMessage(
        'Toggling not working, please set your theme to one of your configurated sundial themes!'
      )
    }
  })

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

  // Helper for change events
  function check(state: any) {
    if (sundial.SundialConfig.debug) {
      console.log(state)
    }
    sundial.check()
  }
}
