<h1 align="left">
  <img align="right" src="https://raw.githubusercontent.com/muuvmuuv/vscode-sundial/master/assets/icon.jpg" width="150">
  <b>☀️ Sundial ☀️</b>
</h1>

#### Change your [VS Code](https://code.visualstudio.com/) theme based on your sunset and sunrise!

[![Visual Studio Marketplace](https://img.shields.io/vscode-marketplace/d/muuvmuuv.vscode-sundial.svg?style=flat)](https://marketplace.visualstudio.com/items?itemName=muuvmuuv.vscode-sundial)
[![Visual Studio Marketplace](https://img.shields.io/vscode-marketplace/r/muuvmuuv.vscode-sundial.svg?style=flat)](https://marketplace.visualstudio.com/items?itemName=muuvmuuv.vscode-sundial)
[![Visual Studio Marketplace](https://img.shields.io/vscode-marketplace/v/muuvmuuv.vscode-sundial.svg?style=flat)](https://marketplace.visualstudio.com/items?itemName=muuvmuuv.vscode-sundial)
[![Repository](https://david-dm.org/muuvmuuv/vscode-sundial.svg)](https://david-dm.org/muuvmuuv/vscode-sundial)
[![Maintainability](https://api.codeclimate.com/v1/badges/52f93dc5f852410ef448/maintainability)](https://codeclimate.com/github/muuvmuuv/vscode-sundial/maintainability)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/muuvmuuv/vscode-sundial.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/muuvmuuv/vscode-sundial/alerts/)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/muuvmuuv/vscode-sundial.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/muuvmuuv/vscode-sundial/context:javascript)

[Installation](#desert_island-installation) •
[Extension Settings](#gear-extension-settings) •
[Automation](#automatically-get-sunrise-and-sunset) •
[Development](#hammer_and_wrench-development)

Sundial changes your theme based on your day and night cycle. It is inspired by
the [OSX Mojave dynamic backgrounds](https://www.apple.com/de/macos/mojave/) and
[Nigth Owl for Mac](https://nightowl.kramser.xyz/). It should _reduce eye pain_
when working in the night or on the day. Humans should not strain their eyes too
much, it's **not recommended** to have a light theme in the night and vice
versa.

Whenever you have ideas for this project, things you would like to add or you
found a bug, feel free to create an issue or start contributing! 😇

<a href="https://www.buymeacoffee.com/devmuuv" target="_blank">
  <img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee">
</a>

![VSCode Sundial](https://raw.githubusercontent.com/muuvmuuv/vscode-sundial/master/assets/banner.jpg)

## :desert_island: Installation

You can simply install any VS Code extension via the VS Code Marketplace:

[![Install Sundial Extension](https://img.shields.io/badge/install-vscode_extension-blue.svg?style=for-the-badge)](https://marketplace.visualstudio.com/items?itemName=muuvmuuv.vscode-sundial)

## :gear: Extension Settings

**Sundial** contributes the following settings:

- `sundial.dayTheme`: name of the theme of choice for your day work. (default:
  `Default Light+`)
- `sundial.nightTheme`: name of the theme of choice for your night work.
  (default: `Default Dark+`)
- `sundial.sunrise`: set a time when your day starts in _24 hours format_.
  (default: `07:00`)
- `sundial.sunset`: set a time when your night starts in _24 hours format_.
  (default: `19:00`)
- `sundial.interval`: set a interval in which sundial should check the time.
  (default: `5`)

> If you set the interval to zero (0) sundial will not periodically check the
> time but still when you `ChangeWindowState`, `ChangeActiveTextEditor` and
> `ChangeTextEditorViewColumn`.

### Automatically get sunrise and sunset

To get your sunrise and sunset automatically you can either set latitude and
longitude or set `autoLocale` to `true`.

It is recommended to set your latitude and longitude manually for better
performance because `autoLocale` uses an external provider with limited API
calls (free plan includes 10.000 requests per month). You can get your latitude
and logitude from [ipapi](https://ipapi.com/) (the box on the right).

- `sundial.autoLocale`: default `false` (only updates location when your public
  IP changes)
- `sundial.latitude`: latitude (e.g.: `50.110924`)
- `sundial.longitude`: longitude (e.g.: `8.682127`)

## :hammer_and_wrench: Development

1.  Install packages via `npm install`
2.  Set `sundial.debug` to `true` (prints more info to the debug console)
3.  Run debugger => `Extension`
