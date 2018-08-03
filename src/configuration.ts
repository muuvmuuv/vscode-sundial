import * as vscode from 'vscode';
import * as moment from 'moment';

const DAY_THEME_PARAMETER_NAME = 'sundial.dayTheme';
const NIGHT_THEME_PARAMETER_NAME = 'sundial.nightTheme';
const UPDATE_INTERVAL = 'sundial.interval';

const WORKBENCH_COLOR_THEME = 'workbench.colorTheme';

export function getTime(): number {
  return moment().hour();
}

export function hasSundialConfiguration(): any {
  return {
    day_theme: vscode.workspace.getConfiguration().has(DAY_THEME_PARAMETER_NAME),
    night_theme: vscode.workspace.getConfiguration().has(NIGHT_THEME_PARAMETER_NAME),
    interval: vscode.workspace.getConfiguration().has(UPDATE_INTERVAL)
  };
}

export function getSundialConfiguration(): any {
  return {
    day_theme: vscode.workspace.getConfiguration().get(DAY_THEME_PARAMETER_NAME),
    night_theme: vscode.workspace.getConfiguration().get(NIGHT_THEME_PARAMETER_NAME),
    interval: vscode.workspace.getConfiguration().get(UPDATE_INTERVAL) || 3600000 // 3600000 = 1h
  };
}

export function getWorkbenchTheme(): any {
  const workbenchTheme = vscode.workspace
    .getConfiguration()
    .get(WORKBENCH_COLOR_THEME);
  return workbenchTheme ? workbenchTheme : 'Visual Studio Dark';
}

export function applyTheme(theme: string) {
  return new Promise((resolve, reject) => {
    if (theme !== getWorkbenchTheme()) {
      const status = vscode.workspace
        .getConfiguration()
        .update(WORKBENCH_COLOR_THEME, theme, true);

      console.log(status);

      if (status) {
        resolve(status);
      } else {
        reject(false);
      }
    } else {
      reject(false);
    }
  });
}

export function listThemes(): string[] {
  const extensions = vscode.extensions.all;
  const themeLabels: string[] = [];

  extensions.forEach(e => {
    const contributes = e.packageJSON.contributes;
    if (contributes) {
      const contributedThemes = contributes.themes;
      if (contributedThemes) {
        contributedThemes.forEach((theme: any) =>
          themeLabels.push(theme.id || theme.label)
        );
      }
    }
  });

  return themeLabels.sort();
}
