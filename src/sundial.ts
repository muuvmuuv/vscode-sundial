import {
  getSundialConfiguration,
  getWorkbenchTheme,
  applyTheme,
  getTime
} from './configuration';

export class Sundial {
  public config: any;
  public defaultTheme: string;

  constructor() {
    this.config = getSundialConfiguration();
    this.defaultTheme = getWorkbenchTheme();

    this.updateTheme();
  }

  public dispose() {
    clearInterval(this.updateTheme());
  }

  private updateTheme(): NodeJS.Timer {
    return setInterval(() => {
      let theme = this.defaultTheme;
      const TIME = getTime(); // get hours of the day in 24h format (0-23)

      if (TIME < 18 && this.config.day_theme) {
        theme = this.config.day_theme;
      } else if (TIME >= 19 && this.config.night_theme) {
        theme = this.config.night_theme;
      }

      applyTheme(theme).then(status => {
        if (!status) {
          console.log(status);
        }
      });
    }, this.config.interval);
  }
}
