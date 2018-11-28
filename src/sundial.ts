import {
  workspace,
  window,
  WorkspaceConfiguration,
  ExtensionContext
} from "vscode";
import * as moment from "moment";

const request = require("request-promise");
const SunCalc = require("suncalc");
const publicIp = require("public-ip");

interface ITides {
  sunrise: string | moment.Moment;
  sunset: string | moment.Moment;
}

export default class Sundial {
  readonly extensionName: string = "Sundial";
  readonly extensionAlias: string = "sundial";

  SundialConfig!: WorkspaceConfiguration;
  WorkbenchConfig!: WorkspaceConfiguration;
  extensionContext!: ExtensionContext;

  debug: boolean = false;
  geoAPI: string =
    "http://api.ipapi.com/{IP}?access_key=aae7ba6db75c991f311debe20ec58d7e&fields=latitude,longitude"; // https://ipapi.com/usage
  tides: ITides;
  polos: boolean = true; // mount/dismount the polos from the sundial
  interval!: NodeJS.Timer;

  constructor() {
    this.updateConfig();
    this.checkConfig();

    this.tides = {
      sunrise: moment(this.SundialConfig.sunrise, "H:m", true),
      sunset: moment(this.SundialConfig.sunset, "H:m", true)
    };

    if (this.SundialConfig.debug) {
      console.log("(Sundial) => WorkbenchConfig:", this.WorkbenchConfig);
      console.log("(Sundial) => SundialConfig:", this.SundialConfig);
    }
  }

  set context(context: ExtensionContext) {
    this.extensionContext = context;
  }

  automater() {
    console.info(
      `Sundial will automatically run every ${
        this.SundialConfig.interval
      } minutes.`
    );

    this.interval = setInterval(
      this.check,
      1000 * 60 * this.SundialConfig.interval
    );
  }

  async check() {
    if (!this.polos) {
      return; // Just mute it here, info would be disturbing
    }
    console.info(`Sundial check initialized...`);
    await this.updateConfig();
    await this.checkConfig();

    let now = moment();

    if (this.SundialConfig.latitude || this.SundialConfig.longitude) {
      console.info("Sundial will now use your configurated location");
      this.tides = await this.useLatitudeLongitude(now);
    } else if (this.SundialConfig.autoLocale) {
      console.info("Sundial will now detecting your location automatically");
      this.tides = await this.useAutoLocale(now);
    }

    const nowIsBeforeSunrise = now.isBefore(this.tides.sunrise);
    const nowIsAfterSunrise = now.isAfter(this.tides.sunrise);
    const nowIsBeforeSunset = now.isBefore(this.tides.sunset);
    const nowIsAfterSunset = now.isAfter(this.tides.sunset);

    if (this.SundialConfig.debug) {
      console.log("(Sundial) => Sunrise:", this.tides.sunrise);
      console.log("(Sundial) => Sunset:", this.tides.sunset);
      console.log("(Sundial) => nowIsBeforeSunrise:", nowIsBeforeSunrise);
      console.log("(Sundial) => nowIsAfterSunrise:", nowIsAfterSunrise);
      console.log("(Sundial) => nowIsBeforeSunset:", nowIsBeforeSunset);
      console.log("(Sundial) => nowIsAfterSunset:", nowIsAfterSunset);
    }

    if (nowIsAfterSunrise && nowIsBeforeSunset) {
      console.info(`Sundial applied your day theme! 🌕`);
      this.changeThemeTo(this.SundialConfig.dayTheme);
    } else if (nowIsBeforeSunrise || nowIsAfterSunset) {
      console.info(`Sundial applied your night theme! 🌑`);
      this.changeThemeTo(this.SundialConfig.nightTheme);
    }
  }

  private async useLatitudeLongitude(now: moment.Moment) {
    if (!this.SundialConfig.latitude || !this.SundialConfig.longitude) {
      throw window.showErrorMessage(
        "Sundial needs both, latitude and longitude, to work with this configuration!"
      );
    }
    if (this.SundialConfig.debug) {
      console.log("(Sundial) => Latitude:", this.SundialConfig.latitude);
      console.log("(Sundial) => Longitude:", this.SundialConfig.longitude);
    }
    const tides = await SunCalc.getTimes(
      now,
      this.SundialConfig.latitude,
      this.SundialConfig.longitude
    );
    return <ITides>{
      sunrise: tides.sunrise,
      sunset: tides.sunset
    };
  }

  private async useAutoLocale(now: moment.Moment) {
    const IP = await publicIp.v4();
    let storedPublicIP = this.context.globalState.get("userPublicIP");
    let latitude = this.context.globalState.get("userLatitude");
    let longitude = this.context.globalState.get("userLongitude");
    if (this.SundialConfig.debug) {
      console.log("(Sundial) => Public IP:", IP);
      console.log("(Sundial) => Stored public IP:", storedPublicIP);
      console.log("(Sundial) => Stored latitude:", latitude);
      console.log("(Sundial) => Stored longitude:", longitude);
    }

    // only pull new location data if the location has really changed
    if (storedPublicIP !== IP || (!latitude || !longitude)) {
      console.info(
        "Sundial detected a location change and will search for your location again"
      );
      let url = this.geoAPI.replace("{IP}", IP);
      let ipLocationRequest = await request(url);
      console.info("(Sundial) => IPAPI Request called");
      let ipLocation = JSON.parse(ipLocationRequest);
      if (this.SundialConfig.debug) {
        console.log("(Sundial) => IP Location:", ipLocation);
      }
      latitude = ipLocation.latitude;
      longitude = ipLocation.longitude;
      this.context.globalState.update("userPublicIP", IP);
      this.context.globalState.update("userLatitude", ipLocation.latitude);
      this.context.globalState.update("userLongitude", ipLocation.longitude);
    }

    console.info("Sundial will use your cached location");
    const tides = await SunCalc.getTimes(now, latitude, longitude);
    return <ITides>{
      sunrise: tides.sunrise,
      sunset: tides.sunset
    };
  }

  checkConfig() {
    const configSunrise = moment(this.SundialConfig.sunrise, "H:m", true);
    const configSunset = moment(this.SundialConfig.sunset, "H:m", true);

    if (
      (!configSunrise.isValid() || !configSunset.isValid()) &&
      (!this.SundialConfig.latitude ||
        !this.SundialConfig.longitude ||
        !this.SundialConfig.autoLocale)
    ) {
      window.showErrorMessage(
        "It looks like sundial.sunrise or sundial.sunset are no real dates and you have not set any other specifications to determine your sunset and sunrise. Please correct this by following the documentation."
      );
    }
  }

  updateConfig() {
    this.SundialConfig = workspace.getConfiguration("sundial");
    this.WorkbenchConfig = workspace.getConfiguration("workbench");
    if (this.SundialConfig.debug) {
      console.log("(SundialConfig) =>", this.SundialConfig);
      console.log("(WorkbenchConfig) =>", this.WorkbenchConfig);
    }
  }

  disablePolos() {
    console.info(`Removing the polos from the sundial...`);
    this.polos = false;
    clearInterval(this.interval);
  }

  changeThemeTo(newTheme: string) {
    if (newTheme !== this.WorkbenchConfig.colorTheme) {
      const status: any = this.WorkbenchConfig.update(
        "colorTheme",
        <string>newTheme,
        true
      );

      if (status._hasError) {
        console.error("(Sundial) => ERROR:", status);
        throw window.showErrorMessage(
          "Oops, something went wrong while changing your theme. Please set debugging to true and post an issue with the console output!"
        );
      }
    }
  }
}
