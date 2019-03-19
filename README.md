<h1 align="left">
  <img align="right" src="https://raw.githubusercontent.com/muuvmuuv/vscode-sundial/master/assets/icon.jpg" width="150">
  <b>☀️ Sundial ☀️</b>
</h1>

#### Change your [VS Code](https://code.visualstudio.com/) theme based on your sunset and sunrise!

[![Visual Studio Marketplace](https://vsmarketplacebadge.apphb.com/version-short/muuvmuuv.vscode-sundial.svg)](https://marketplace.visualstudio.com/items?itemName=muuvmuuv.vscode-sundial)
[![Visual Studio Marketplace](https://vsmarketplacebadge.apphb.com/installs-short/muuvmuuv.vscode-sundial.svg)](https://marketplace.visualstudio.com/items?itemName=muuvmuuv.vscode-sundial)
[![Visual Studio Marketplace](https://vsmarketplacebadge.apphb.com/rating-star/muuvmuuv.vscode-sundial.svg)](https://marketplace.visualstudio.com/items?itemName=muuvmuuv.vscode-sundial)
[![Repository](https://david-dm.org/muuvmuuv/vscode-sundial.svg)](https://david-dm.org/muuvmuuv/vscode-sundial)
[![Maintainability](https://api.codeclimate.com/v1/badges/52f93dc5f852410ef448/maintainability)](https://codeclimate.com/github/muuvmuuv/vscode-sundial/maintainability)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/muuvmuuv/vscode-sundial.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/muuvmuuv/vscode-sundial/alerts/)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/muuvmuuv/vscode-sundial.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/muuvmuuv/vscode-sundial/context:javascript)

[Installation](#desert_island-installation) •
[Extension Keybindings](#keyboard-extension-keybindings) •
[Extension Commands](#bellhop_bell-extension-commands) •
[Extension Settings](#gear-extension-settings) •
[Automation](#automatically-get-sunrise-and-sunset) •
[Development](#hammer_and_wrench-development)

Sundial changes your theme based on your day and night cycle. It is inspired by
the [OSX Mojave dynamic backgrounds](https://www.apple.com/de/macos/mojave/) and
[Night Owl for Mac](https://nightowl.kramser.xyz/). It should _reduce eye pain_
when working in the night or on the day. Humans should not strain their eyes too
much, it's **not recommended** to have a light theme in the night and vice
versa.

Whenever you have ideas for this project, things you would like to add or you
found a bug, feel free to create an issue or start contributing! 😇

<a href="https://www.buymeacoffee.com/devmuuv" target="_blank">
  <img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee">
</a>

## ![VSCode Sundial](https://raw.githubusercontent.com/muuvmuuv/vscode-sundial/master/assets/banner.jpg)

---

## :desert_island: Installation

You can simply install any VS Code extension via the VS Code Marketplace:

[![Install Sundial Extension](https://img.shields.io/badge/install-vscode_extension-blue.svg?style=for-the-badge)](https://marketplace.visualstudio.com/items?itemName=muuvmuuv.vscode-sundial)

---

## :keyboard: Extension Keybindings

**Sundial** contributes the following keybindings:

| Platform | Keybinding            | Action                        |
| -------- | --------------------- | ----------------------------- |
| Windows  | <kbd>ctrl+alt+t</kbd> | `sundial.toggleDayNightTheme` |
| Mac      | <kbd>ctrl+cmd+t</kbd> | `sundial.toggleDayNightTheme` |

---

## :bellhop_bell: Extension commands

**Sundial** contributes the following commands:

| Command                                                     | Action                        | Description                                               |
| ----------------------------------------------------------- | ----------------------------- | --------------------------------------------------------- |
| _Sundial: Night Theme_                                      | `sundial.switchToNightTheme`  | Switch to your night theme.                               |
| _Sundial: Day Theme_                                        | `sundial.switchToDayTheme`    | Switch to your day theme.                                 |
| _Sundial: Toggle Day/Night Theme_                           | `sundial.toggleDayNightTheme` | Toggle between you day/night theme.                       |
| _Sundial: Continue switching day/night theme automatically_ | `sundial.continueAutomation`  | Continue to use the sundial configured automation script. |

> Note that whenever you use one of this commands Sundial will disable the
> automation process of changing your theme on day night basis. To continue
> using that feature you need to reactivate it with
> `sundial.continueAutomation`. If you thing you know a better implementation
> please contribute!

---

## :gear: Extension Settings

**Sundial** contributes the following settings:

| Setting              | Default  | Description                                                                      |
| -------------------- | -------- | -------------------------------------------------------------------------------- |
| `sundial.dayTheme`   | _Light+_ | Name of the theme of choice for your day work.                                   |
| `sundial.nightTheme` | _Dark+_  | Name of the theme of choice for your night work.                                 |
| `sundial.sunrise`    | _07:00_  | Set a time when your day starts in **24 hours format**.                          |
| `sundial.sunset`     | _19:00_  | Set a time when your night starts in **24 hours format**.                        |
| `sundial.interval`   | _5_      | Set a interval in which sundial should check the time.                           |
| `sundial.useHTTPS`   | _false_  | Use some services with HTTPS instead of HTTP. (Please note that this is slower!) |

> If you set the interval to zero (0) sundial will not periodically check the
> time but still when VS Code triggers the events `ChangeWindowState`,
> `ChangeActiveTextEditor` and `ChangeTextEditorViewColumn`.

### Automatically get sunrise and sunset

To get your sunrise and sunset automatically you can either set latitude and
longitude or set `autoLocale` to `true`.

On `autoLocale` set to `true` Sundial will pull you public IP Address with the
node package [public-ip](https://www.npmjs.com/package/public-ip) and then pass
it to [ipapi](https://ipapi.com/) to get you locationstring.

It is recommended to set your latitude and longitude manually for better a
stability because `autoLocale`, which uses [ipapi](https://ipapi.com/), has
limited API calls (free plan includes 10.000 requests per month). You can get
your latitude and longitude from [ipapi](https://ipapi.com/) website (the box on
the right).

| Setting              | Default | Description                                       |
| -------------------- | ------- | ------------------------------------------------- |
| `sundial.autoLocale` | _false_ | Only updates location when your public IP changes |
| `sundial.latitude`   | _⊘_     | e.g. _"50.110924"_                                |
| `sundial.longitude`  | _⊘_     | e.g. _"8.682127"_                                 |

---

## :hammer_and_wrench: Development

We are working with [webpack](https://webpack.js.org/) to bundle Sundial to the
smallest possible size to increase the load time in VSCode.

1.  Install packages via `npm install`
2.  Set `sundial.debug` to `true` (not necessary but recommended)
3.  Run debugger => `Extension`
4.  Go into the _extensionHost_ and adjust settings to test
5.  Change a file and save it, let _webpack_ compile
6.  Reload the debugger (<kbd>⇧⌘F5</kbd>)

> Please note that while `sundial.debug` is set to `true` Sundial will always
> pull your IP again. So keep that in mind before using it because we have a
> request limit.

> ⚠️ Don't forget to change the [version](package.json) and include a detailed
> [changelog](CHANGELOG.md) of the changes you made!
