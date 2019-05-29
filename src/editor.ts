import { workspace, window, WorkspaceConfiguration } from 'vscode'
import { SundialConfiguration } from './sundial'

interface IConfig {
  sundial: SundialConfiguration
  workbench: WorkspaceConfiguration
}

export function getConfig(): IConfig {
  const sundial = <SundialConfiguration>workspace.getConfiguration('sundial')
  const workbench = workspace.getConfiguration('workbench')
  return {
    sundial,
    workbench,
  }
}

export function changeToDay() {
  const config = getConfig()
  changeThemeTo(config.sundial.dayTheme)
  applySettings(config.sundial.daySettings)
}

export function changeToNight() {
  const config = getConfig()
  changeThemeTo(config.sundial.nightTheme)
  applySettings(config.sundial.nightSettings)
}

export async function changeThemeTo(newTheme: string) {
  const config = getConfig()
  if (newTheme !== config.workbench.colorTheme) {
    config.workbench.update('colorTheme', newTheme, true)
  }
}

export async function applySettings(settings: object) {
  if (!settings) {
    return // no settings, nothing to do
  }
  const workspaceSettings = workspace.getConfiguration()
  Object.keys(settings).forEach(k => {
    if (k === 'workbench.colorTheme') {
      return // do not override `workbench.colorTheme`
    }
    workspaceSettings.update(k, settings[k], true).then(undefined, (reason: string) => {
      console.error(reason)
      window.showErrorMessage(
        `You tried to apply \`${k}: ${settings[k]}\` but this is not a valid VS Code settings
          key/value pair. Please make sure all settings that you give to Sundial are valid
          inside VS Code settings!`
      )
    })
  })
}

export function toggleTheme(time?: string) {
  const config = getConfig()
  switch (time) {
    case 'day':
      changeToDay()
      break
    case 'night':
      changeToNight()
      break
    default:
      if (config.sundial.nightTheme === config.workbench.colorTheme) {
        changeToNight()
      } else {
        changeToDay()
      }
      break
  }
}
