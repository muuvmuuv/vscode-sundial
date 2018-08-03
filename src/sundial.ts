import * as moment from 'moment';
import * as vscode from 'vscode';
import {
  getSundialConfiguration,
  getWorkbenchTheme,
  applyTheme,
  hasNoThemesSelected
} from './configuration';

export class Sundial {
  private timer: NodeJS.Timer;
  public config: any;
  public defaultTheme: string;

  constructor() {
    if (hasNoThemesSelected()) {
      throw vscode.window.showErrorMessage(
        'Please add a theme for day and night.\nOtherwise the plugin will not work.'
      );
    }

    this.config = getSundialConfiguration();
    this.defaultTheme = getWorkbenchTheme();

    this.timer = this.activate();
  }

  public dispose() {
    clearInterval(this.timer);
  }

  public activate(): NodeJS.Timer {
    this.updateTheme(); // update theme on start up

    return setInterval(() => {
      this.updateTheme();
    }, this.config.interval);
  }

  private updateTheme() {
    let theme = this.defaultTheme;
    let now = moment();

    // now = moment('06:01', 'H:m');

    let timesDay: string[] = this.config.day_range
      .split('-')
      .map((time: string[number]) => time.trim());
    let timesNight: string[] = this.config.night_range
      .split('-')
      .map((time: string[number]) => time.trim());

    let beginDayTheme = moment(timesDay[0], 'H:m');
    let endDayTheme = moment(timesDay[1], 'H:m');
    let beginDayThemeIsBefore = beginDayTheme.isBefore(now);
    let endDayThemeIsAfter = endDayTheme.isAfter(now);

    let beginNightTheme = moment(timesNight[0], 'H:m');
    let endNightTheme = moment(timesNight[1], 'H:m');
    let beginNightThemeIsBefore = beginNightTheme.isAfter(now);
    let endNightThemeIsAfter = endNightTheme.isBefore(now);

    if (beginDayThemeIsBefore && endDayThemeIsAfter) {
      console.log(`Applying day theme: ${this.config.day_theme}`);
      theme = this.config.day_theme;
    } else if (beginNightThemeIsBefore || endNightThemeIsAfter) {
      console.log(`Applying night theme: ${this.config.night_theme}`);
      theme = this.config.night_theme;
    }

    applyTheme(theme).then(status => {
      if (!status) {
        console.log(status);
      }
    });
  }
}
