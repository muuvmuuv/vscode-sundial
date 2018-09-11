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
    // now = moment('06:00', 'H:m'); // TEST

    // console.log(now);

    let dayStart = moment(this.config.day_start, 'H:m');
    let nightStart = moment(this.config.night_start, 'H:m');

    // console.log('beginDayTheme', dayStart);
    // console.log('beginNightTheme', nightStart);

    let nowIsBeforeDayStart = now.isBefore(dayStart);
    let nowIsAfterDayStart = now.isAfter(dayStart);
    let nowIsBeforeNightStart = now.isBefore(nightStart);
    let nowIsAfterNightStart = now.isAfter(nightStart);

    // console.log('nowIsBeforeDayStart', nowIsBeforeDayStart);
    // console.log('nowIsAfterDayStart', nowIsAfterDayStart);
    // console.log('nowIsBeforeNightStart', nowIsBeforeNightStart);
    // console.log('nowIsAfterNightStart', nowIsAfterNightStart);

    if (nowIsAfterDayStart && nowIsBeforeNightStart) {
      console.log(`Applying day theme: ${this.config.day_theme}`);
      theme = this.config.day_theme;
    } else if (nowIsBeforeDayStart || nowIsAfterNightStart) {
      console.log(`Applying night theme: ${this.config.night_theme}`);
      theme = this.config.night_theme;
    }

    applyTheme(theme).then(status => {
      if (!status) {
        throw new Error('Something went wrong');
      }
    });
  }
}
