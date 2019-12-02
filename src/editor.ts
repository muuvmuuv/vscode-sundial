import { workspace, window, WorkspaceConfiguration } from 'vscode'
import { SundialConfiguration } from './sundial'
import { logger } from './logger'

const log = logger.getLogger('editor')

export interface EditorConfig {
  sundial: SundialConfiguration
  workbench: WorkspaceConfiguration
}

export function getConfig(): EditorConfig {
  const sundial = <SundialConfiguration>workspace.getConfiguration('sundial')
  const workbench = workspace.getConfiguration('workbench')
  return {
    sundial,
    workbench,
  }
}

export async function applySettings(settings: object) {
  if (!settings) {
    return // no settings, nothing to do
  }
  log.debug('Changing settings to:', settings)
  const workspaceSettings = workspace.getConfiguration()
  Object.keys(settings).forEach((k) => {
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

export enum TimeNames {
  Day = 'day',
  Night = 'night',
}

export function changeToDay() {
  const { sundial } = getConfig()
  changeThemeTo(sundial.dayTheme)
  applySettings(sundial.daySettings)
}

export function changeToNight() {
  const { sundial } = getConfig()
  changeThemeTo(sundial.nightTheme)
  applySettings(sundial.nightSettings)
}

export async function changeThemeTo(newTheme: string) {
  log.debug('Changing theme to:', newTheme)
  const { workbench } = getConfig()
  if (newTheme !== workbench.colorTheme) {
    workbench.update('colorTheme', newTheme, true)
  }
}

export function toggleTheme(time?: TimeNames) {
  log.debug('Toggle theme to:', time)
  const config = getConfig()
  switch (time) {
    case TimeNames.Day:
      changeToDay()
      break
    case TimeNames.Night:
      changeToNight()
      break
    default:
      if (config.sundial.nightTheme !== config.workbench.colorTheme) {
        changeToNight()
      } else {
        changeToDay()
      }
      break
  }
}
