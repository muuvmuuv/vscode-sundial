import { workspace, window, WorkspaceConfiguration, ExtensionContext } from 'vscode';
import * as moment from 'moment';

const request = require('request-promise');
const SunCalc = require('suncalc');
const publicIp = require('public-ip');

export default class Sundial {
  WorkbenchConfig: WorkspaceConfiguration = workspace.getConfiguration('workbench');
  SundialConfig: WorkspaceConfiguration = workspace.getConfiguration('sundial');

  context: ExtensionContext;
  debug: boolean = false;

  // NOTE: check usage here: https://ipapi.com/usage
  geoAPI: string = 'http://api.ipapi.com/{IP}?access_key=aae7ba6db75c991f311debe20ec58d7e&fields=latitude,longitude';

  sunrise: string | moment.Moment;
  sunset: string | moment.Moment;

  constructor(context: ExtensionContext) {
    this.context = context;
    this.debug = this.SundialConfig.debug;

    this.sunrise = moment(<string>this.SundialConfig.sunrise, 'H:m');
    this.sunset = moment(<string>this.SundialConfig.sunset, 'H:m');

    if (this.debug) {
      console.log('(Sundial) => WorkbenchConfig:', this.WorkbenchConfig);
      console.log('(Sundial) => SundialConfig:', this.SundialConfig);
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
    console.info(`Sundial async check initialized...`);
    await this.reloadConfig();

    let now = moment();

    if (this.SundialConfig.latitude || this.SundialConfig.longitude) {
      if (!this.SundialConfig.latitude || !this.SundialConfig.longitude) {
        throw window.showErrorMessage(
          'Sundial needs both, latitude and longitude, to work!'
        );
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

      this.sunrise = times.sunrise;
      this.sunset = times.sunset;
    } else if (this.SundialConfig.autoLocale) {
      const IP = await publicIp.v4();
      let storedPublicIP = this.context.globalState.get('userPublicIP');
      let storedLatitude = this.context.globalState.get('userLatitude');
      let storedLongitude = this.context.globalState.get('userLongitude');
      if (this.debug) {
        console.log('(Sundial) => Public IP:', IP);
        console.log('(Sundial) => Stored public IP:', storedPublicIP);
        console.log('(Sundial) => Stored latitude:', storedLatitude);
        console.log('(Sundial) => Stored longitude:', storedLongitude);
      }

      if (storedPublicIP !== IP || (!storedLatitude || !storedLongitude)) {
        let url = this.geoAPI.replace('{IP}', IP);
        let ipLocationRequest = await request(url);
        console.info('(Sundial) => IPAPI Request called');
        let ipLocation = JSON.parse(ipLocationRequest);
        if (this.debug) {
          console.log('(Sundial) => IP Location:', ipLocation);
        }

        this.context.globalState.update('userPublicIP', IP);
        this.context.globalState.update('userLatitude', ipLocation.latitude);
        this.context.globalState.update('userLongitude', ipLocation.longitude);

        const times = await SunCalc.getTimes(
          now,
          ipLocation.latitude,
          ipLocation.longitude
        );

        this.sunrise = times.sunrise;
        this.sunset = times.sunset;
      }
    }

    const nowIsBeforeSunrise = now.isBefore(this.sunrise);
    const nowIsAfterSunrise = now.isAfter(this.sunrise);
    const nowIsBeforeSunset = now.isBefore(this.sunset);
    const nowIsAfterSunset = now.isAfter(this.sunset);

    if (this.debug) {
      console.log('(Sundial) => Sunrise:', this.sunrise);
      console.log('(Sundial) => Sunset:', this.sunset);
      console.log('(Sundial) => nowIsBeforeSunrise:', nowIsBeforeSunrise);
      console.log('(Sundial) => nowIsAfterSunrise:', nowIsAfterSunrise);
      console.log('(Sundial) => nowIsBeforeSunset:', nowIsBeforeSunset);
      console.log('(Sundial) => nowIsAfterSunset:', nowIsAfterSunset);
    }

    if (nowIsAfterSunrise && nowIsBeforeSunset) {
      console.info(`Applying day theme! 🌕`);
      this.changeThemeTo(this.SundialConfig.dayTheme);
    } else if (nowIsBeforeSunrise || nowIsAfterSunset) {
      console.info(`Applying night theme! 🌑`);
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
        console.error('(Sundial) => ERROR:', status);
        throw window.showErrorMessage(
          'Oops, something went wrong while changing your theme. Please set debugging to true and post an issue with the console output!'
        );
      }
    }
  }
}
