import { workspace, window, WorkspaceConfiguration } from 'vscode';
import * as moment from 'moment';

const request = require('request-promise');
const SunCalc = require('suncalc');
const publicIp = require('public-ip');

export default class Sundial {
  WorkbenchConfig: WorkspaceConfiguration = workspace.getConfiguration('workbench');
  SundialConfig: WorkspaceConfiguration = workspace.getConfiguration('sundial');

  debug: boolean = false;
  geoAPI: string = 'http://geoip.nekudo.com/api/';

  constructor() {
    this.checkConfig();

    this.debug = this.SundialConfig.debug;

    if (this.debug) {
      console.log('(Sundial) => WorkbenchConfig:', this.WorkbenchConfig);
      console.log('(Sundial) => SundialConfig:', this.SundialConfig);
    }
  }

  checkConfig() {
    if (!this.SundialConfig.dayTheme || !this.SundialConfig.nightTheme) {
      throw window.showErrorMessage('Please set a theme for the day and the night.');
    }
  }

  reloadConfig() {
    this.WorkbenchConfig = workspace.getConfiguration('workbench');
    this.SundialConfig = workspace.getConfiguration('sundial');
  }

  automater(): NodeJS.Timer {
    console.info(
      `Sundial will automatically run every ${this.SundialConfig.interval} minutes.`
    );

    return setInterval(this.check, 1000 * 60 * this.SundialConfig.interval);
  }

  async check() {
    console.log(`Sundial check initialized...`);
    this.reloadConfig();

    let now = moment();
    let sunrise;
    let sunset;

    if (this.SundialConfig.autoLocale) {
      const IP = await publicIp.v4();
      if (this.debug) {
        console.log('(Sundial) => Public IP:', IP);
      }

      let url = this.geoAPI + IP;
      let ipLocation = await request(url);
      ipLocation = JSON.parse(ipLocation).location;

      const times = await SunCalc.getTimes(
        now,
        ipLocation.latitude,
        ipLocation.longitude
      );

      sunrise = times.sunrise;
      sunset = times.sunset;
    } else if (this.SundialConfig.latitude || this.SundialConfig.longitude) {
      if (!this.SundialConfig.latitude && !this.SundialConfig.longitude) {
        throw window.showErrorMessage('Please set both, latitude and longitude!');
      }
      if (this.debug) {
        console.log('(Sundial) => Latitude:', this.SundialConfig.latitude);
        console.log('(Sundial) => Longitude:', this.SundialConfig.longitude);
      }

      const times = await SunCalc.getTimes(
        now,
        this.SundialConfig.latitude,
        this.SundialConfig.longitude
      );

      sunrise = times.sunrise;
      sunset = times.sunset;
    } else {
      sunrise = await moment(<string>this.SundialConfig.sunrise, 'H:m');
      sunset = await moment(<string>this.SundialConfig.sunset, 'H:m');
    }

    const nowIsBeforeSunrise = now.isBefore(sunrise);
    const nowIsAfterSunrise = now.isAfter(sunrise);
    const nowIsBeforeSunset = now.isBefore(sunset);
    const nowIsAfterSunset = now.isAfter(sunset);

    if (this.debug) {
      console.log('(Sundial) => Sunrise:', sunrise);
      console.log('(Sundial) => Sunset:', sunset);
      console.log('(Sundial) => nowIsBeforeSunrise:', nowIsBeforeSunrise);
      console.log('(Sundial) => nowIsAfterSunrise:', nowIsAfterSunrise);
      console.log('(Sundial) => nowIsBeforeSunset:', nowIsBeforeSunset);
      console.log('(Sundial) => nowIsAfterSunset:', nowIsAfterSunset);
    }

    if (nowIsAfterSunrise && nowIsBeforeSunset) {
      console.log(`Applying day theme! 🌕`);
      this.changeThemeTo(this.SundialConfig.dayTheme);
    } else if (nowIsBeforeSunrise || nowIsAfterSunset) {
      console.log(`Applying night theme! 🌑`);
      this.changeThemeTo(this.SundialConfig.nightTheme);
    }
  }

  changeThemeTo(newTheme: string) {
    if (newTheme !== this.WorkbenchConfig.theme) {
      const status: any = this.WorkbenchConfig.update(
        'colorTheme',
        <string>newTheme,
        true
      );

      if (status._hasError) {
        console.error('(Sundial) => Status:', status);
        throw window.showErrorMessage(
          'Oops, something went wrong while changeing your theme.'
        );
      }
    }
  }
}
