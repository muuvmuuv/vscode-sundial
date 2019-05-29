<h1 align="left">
  <img align="right" src="https://raw.githubusercontent.com/muuvmuuv/vscode-sundial/master/assets/icon.jpg" width="150">
  <b>☀️ Sundial ☀️</b>
</h1>

#### Change your [VS Code](https://code.visualstudio.com/) theme and settings based on your sunset and sunrise with options!

[![Visual Studio Marketplace](https://vsmarketplacebadge.apphb.com/version-short/muuvmuuv.vscode-sundial.svg)](https://marketplace.visualstudio.com/items?itemName=muuvmuuv.vscode-sundial)
[![Visual Studio Marketplace](https://vsmarketplacebadge.apphb.com/installs-short/muuvmuuv.vscode-sundial.svg)](https://marketplace.visualstudio.com/items?itemName=muuvmuuv.vscode-sundial)
[![Visual Studio Marketplace](https://vsmarketplacebadge.apphb.com/rating-star/muuvmuuv.vscode-sundial.svg)](https://marketplace.visualstudio.com/items?itemName=muuvmuuv.vscode-sundial)
[![Maintainability](https://api.codeclimate.com/v1/badges/52f93dc5f852410ef448/maintainability)](https://codeclimate.com/github/muuvmuuv/vscode-sundial/maintainability)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/muuvmuuv/vscode-sundial.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/muuvmuuv/vscode-sundial/alerts/)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/muuvmuuv/vscode-sundial.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/muuvmuuv/vscode-sundial/context:javascript)

- [:desert_island: Installation](#desert_island-installation)
- [:keyboard: Extension Keybindings](#keyboard-extension-keybindings)
- [:bellhop_bell: Extension commands](#bellhop_bell-extension-commands)
- [:gear: Extension Settings](#gear-extension-settings)
  - [Automatically get sunrise and sunset](#automatically-get-sunrise-and-sunset)
  - [Automatically get dark mode from macOS](#automatically-get-dark-mode-from-macos)
  - [Automatically set dark mode based on ambient light](#automatically-set-dark-mode-based-on-ambient-light)
  - [Order](#order)
  - [Examples](#examples)
- [:hammer_and_wrench: Development](#hammer_and_wrench-development)
  - [Tools](#tools)
  - [Tests](#tests)

Sundial changes your theme and VS Code settings (if needed) based on your day and night cycle. It is
inspired by the [OSX Mojave dynamic backgrounds](https://www.apple.com/de/macos/mojave/) and
[Night Owl for Mac](https://nightowl.kramser.xyz/). It should _reduce eye pain_ when working in the
night or on the day. Humans should not strain their eyes too much, it's **not recommended** to have
a light theme in the night and vice versa.

Whenever you have ideas for this project, things you would like to add or you found a bug, feel free
to create an issue or start contributing! 😇

<a href="https://www.buymeacoffee.com/devmuuv" target="_blank">
  <img src="https://www.buymeacoffee.com/assets/img/custom_images/yellow_img.png" alt="Buy me a Gluten-free Bread" style="margin-bottom:20px;">
</a>

![VSCode Sundial](https://raw.githubusercontent.com/muuvmuuv/vscode-sundial/master/assets/banner.jpg)

## :desert_island: Installation

You can simply install any VS Code extension via the VS Code Marketplace:

[![Install Sundial Extension](https://img.shields.io/badge/install-vscode_extension-blue.svg?style=for-the-badge)](https://marketplace.visualstudio.com/items?itemName=muuvmuuv.vscode-sundial)

## :keyboard: Extension Keybindings

**Sundial** contributes the following keybindings:

| Platform | Keybinding            | Action                        |
| -------- | --------------------- | ----------------------------- |
| Windows  | <kbd>ctrl+alt+t</kbd> | `sundial.toggleDayNightTheme` |
| Mac      | <kbd>ctrl+cmd+t</kbd> | `sundial.toggleDayNightTheme` |

> Note that whenever you use one of this keybindings, Sundial will disable the automation process of
> changing your theme on day night basis. To continue using that feature you need to reactivate it
> with the command `sundial.continueAutomation`.

## :bellhop_bell: Extension commands

**Sundial** contributes the following commands:

| Command                                                     | Action                        | Description                          |
| ----------------------------------------------------------- | ----------------------------- | ------------------------------------ |
| _Sundial: Night Theme_                                      | `sundial.switchToNightTheme`  | Switch to your night theme.          |
| _Sundial: Day Theme_                                        | `sundial.switchToDayTheme`    | Switch to your day theme.            |
| _Sundial: Toggle Day/Night Theme_                           | `sundial.toggleDayNightTheme` | Toggle between your day/night theme. |
| _Sundial: Continue switching day/night theme automatically_ | `sundial.continueAutomation`  | Continue automation.                 |

> Note that whenever you use one of this commands, Sundial will disable the automation process of
> changing your theme on day night basis. To continue using that feature you need to reactivate it
> with `sundial.continueAutomation`.

## :gear: Extension Settings

**Sundial** contributes the following settings:

| Setting                 | Default  | Description                                                               | Example                      |
| ----------------------- | -------- | ------------------------------------------------------------------------- | ---------------------------- |
| `sundial.dayTheme`      | _Light+_ | Name of the theme of choice for your day work.                            | [Cloudy Mountain][1]         |
| `sundial.nightTheme`    | _Dark+_  | Name of the theme of choice for your night work.                          | [Atom One Dark][2]           |
| `sundial.sunrise`       | _07:00_  | Set a time when your day starts in **24 hours format**.                   | `09:42`                      |
| `sundial.sunset`        | _19:00_  | Set a time when your night starts in **24 hours format**.                 | `18:37`                      |
| `sundial.dayVariable`   | _0_      | Set a variable to change the theme **X minutes** before or after sunrise. | `-40`                        |
| `sundial.nightVariable` | _0_      | Set a variable to change the theme **X minutes** before or after sunset.  | `36`                         |
| `sundial.daySettings`   | _⊘_      | An **object** of VSCode settings applied on the day.                      | `{ "editor.fontSize": 13, }` |
| `sundial.nightSettings` | _⊘_      | An **object** of VSCode settings applied on the night.                    | `{ "editor.fontSize": 15, }` |
| `sundial.interval`      | _5_      | Set a interval in which sundial should check the time in **minutes**.     | `2`                          |

> If you set the interval to zero (0) sundial will not periodically check the time but still when VS
> Code triggers the events `ChangeWindowState`, `ChangeActiveTextEditor` and
> `ChangeTextEditorViewColumn`.

> On both `daySettings` and `nightSettings` they will override your Workbench VSCode settings.
> Please make sure both have the same properties otherwise they will not change since Sundial is not
> remembering the settings you have set before!

#### Automatically get sunrise and sunset

To get your sunrise and sunset automatically you can either set latitude and longitude or set
`autoLocale` to `true`.

If `autoLocale` is set to `true`, Sundial will get your geolocation from
[https://freegeoip.app/](https://freegeoip.app/). You can get your latitude and longitude manually
from the same page.

| Setting              | Default | Description                                      |
| -------------------- | ------- | ------------------------------------------------ |
| `sundial.autoLocale` | _false_ | Updates your location based on your geolocation. |
| `sundial.latitude`   | _⊘_     | e.g. _"50.110924"_                               |
| `sundial.longitude`  | _⊘_     | e.g. _"8.682127"_                                |

#### Automatically get dark mode from macOS

Sundial provides a method to get the current operating system appearance preference value. This
works on OSX only at the moment. To use this set `sundial.systemTheme` to `true` and Sundial will
ignore all other options.

This options works very good with [Night Owl for Mac](https://nightowl.kramser.xyz/) or
[Starlight](https://github.com/pmkary/starlight).

> Successfully tested on: MacBook Pro (15-inch, 2017) with macOS 10.14.5

#### Automatically set dark mode based on ambient light

> !!!WORK IN PROGRESS!!!

Sundial will check access to your computers ambient light sensor and will use it to determine if
dark mode is needed in your environment. To use this set `sundial.ambientLight` to `true` and
Sundial will ignore all other options.

### Order

Settings will be applied in this order (first one overrides all after):

1. `sundial.systemTheme`
2. `sundial.ambientLight` (WIP)
3. `sundial.latitude` and `sundial.longitude`
4. `sundial.autoLocale`
5. `sundial.sunrise` and `sundial.sunset`

### Examples

```json
{
  "sundial.dayTheme": "Cloudy Mountain",
  "sundial.nightTheme": "Atom One Dark",
  "sundial.interval": 20,
  "sundial.autoLocale": true
}
```

```json
{
  "sundial.dayTheme": "Cloudy Mountain",
  "sundial.nightTheme": "Atom One Dark",
  "sundial.sunrise": "05:12"
}
```

```json
{
  "sundial.dayTheme": "Cloudy Mountain",
  "sundial.nightTheme": "Atom One Dark",
  "sundial.dayVariable": 43,
  "sundial.latitude": "50.110924",
  "sundial.longitude": "8.682127",
  "sundial.daySettings": {
    "editor.fontSize": 13
  },
  "sundial.nightSettings": {
    "editor.fontSize": 15
  }
}
```

## :hammer_and_wrench: Development

We are working with [webpack](https://webpack.js.org/) to bundle Sundial to the smallest possible
size to increase the load time in VSCode.

1.  Install packages via `npm install`
2.  Set `sundial.debug` to `true` (not necessary but recommended)
3.  Run debugger => `Extension`
4.  Go into the _extensionHost_ and adjust settings to test
5.  Change a file and save it, let _webpack_ compile
6.  Reload the debugger (<kbd>⇧⌘F5</kbd>)
7.  Run tests with `npm test`
8.  Create a new [version](#tools)
9.  Add a detailed description to the [changelog](CHANGELOG.md)
10. Create a pull request

> ⚠️ Don't forget to change the [version](#tools) and include a detailed [changelog](CHANGELOG.md)
> of the changes you've made!

### Tools

- `npm run version`: Interactively create a new version (based on [semver](https://semver.org/)).
- `npm run tag`: Tag the current package.json version to the latest commit.
- `npm run release`: Create a new GitHub release draft.

### Tests

All tests that are running with `npm test`:

1. [setContext](./tests/setContext.spec.ts)
2. [updateConfig](./tests/updateConfig.spec.ts)
3. [checkConfig](./tests/checkConfig.spec.ts)
4. [useLatitudeLongitude](./tests/useLatitudeLongitude.spec.ts)
5. [useAutoLocale](./tests/useAutoLocale.spec.ts)
6. [setVariable](./tests/setVariable.spec.ts)
7. [automater](./tests/automater.spec.ts)
8. [applySettings](./tests/applySettings.spec.ts)
9. [toggleTheme](./tests/toggleTheme.spec.ts)
10. [disablePolos](./tests/disablePolos.spec.ts)

[1]: https://marketplace.visualstudio.com/items?itemName=muuvmuuv.vscode-theme-cloudy-mountain
[2]: https://marketplace.visualstudio.com/items?itemName=akamud.vscode-theme-onedark
