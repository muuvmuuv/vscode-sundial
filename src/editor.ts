import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { window, workspace, WorkspaceConfiguration } from 'vscode'

import { getLogger } from './logger'
import { SundialConfiguration } from './sundial'

const log = getLogger('editor')

dayjs.extend(customParseFormat)

export function getConfig() {
  return {
    sundial: workspace.getConfiguration('sundial') as SundialConfiguration,
    workbench: workspace.getConfiguration('workbench'),
  }
}

export function applySettings(settings: WorkspaceConfiguration): void {
  if (!settings) {
    return // no settings, nothing to do
  }

  log.debug('Changing settings to:', JSON.stringify(settings, undefined, 2))

  const workspaceSettings = workspace.getConfiguration()

  for (const k of Object.keys(settings)) {
    if (k === 'workbench.colorTheme') {
      continue // do not override `workbench.colorTheme`
    }

    const configString = settings[k] as string

    workspaceSettings.update(k, configString, true).then(undefined, (error: string) => {
      log.error(error)
      window.showErrorMessage(
        `You tried to apply \`${k}: ${configString}\` but this is not a valid` +
          ' VS Code settings key/value pair. Please make sure all settings that' +
          ' you give to Sundial are valid inside VS Code settings!',
      )
    })
  }
}

export enum TimeNames {
  DAY = 'day',
  NIGHT = 'night',
}

export function changeThemeTo(newTheme: string): void {
  log.debug('Changing theme to:', newTheme)
  const { workbench } = getConfig()
  if (newTheme !== workbench.colorTheme) {
    workbench.update('colorTheme', newTheme, true)
  }
}

export function changeToDay(): void {
  const { sundial, workbench } = getConfig()
  changeThemeTo(workbench.preferredLightColorTheme)
  applySettings(sundial.daySettings)
}

export function changeToNight(): void {
  const { sundial, workbench } = getConfig()
  changeThemeTo(workbench.preferredDarkColorTheme)
  applySettings(sundial.nightSettings)
}

export function toggleTheme(time?: TimeNames): void {
  log.debug('Toggle theme to:', time || 'toggle')
  const config = getConfig()
  switch (time) {
    case TimeNames.DAY: {
      changeToDay()
      break
    }
    case TimeNames.NIGHT: {
      changeToNight()
      break
    }
    default: {
      if (config.workbench.preferredDarkColorTheme === config.workbench.colorTheme) {
        changeToDay()
      } else {
        changeToNight()
      }
      break
    }
  }
}
