import * as vscode from 'vscode';

const WORKBENCH_COLOR_THEME = 'workbench.colorTheme';

export function getSundialConfiguration(): any {
  return vscode.workspace.getConfiguration('sundial');
}

export function hasNoThemesSelected(): boolean {
  const config = getSundialConfiguration();
  return config.day_theme && config.night_theme ? false : true;
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
