<h1 align="left">
  <img align="right" src="https://raw.githubusercontent.com/muuvmuuv/vscode-sundial/master/assets/icon.jpg" width="150">
  <b>☀️ Sundial ☀️</b>
</h1>

#### Change your VS Code theme/settings based on your sunset, sunrise, system appearance or other preferences!

[![Visual Studio Marketplace](https://vsmarketplacebadge.apphb.com/version-short/muuvmuuv.vscode-sundial.svg)](https://marketplace.visualstudio.com/items?itemName=muuvmuuv.vscode-sundial)
[![Visual Studio Marketplace](https://vsmarketplacebadge.apphb.com/installs-short/muuvmuuv.vscode-sundial.svg)](https://marketplace.visualstudio.com/items?itemName=muuvmuuv.vscode-sundial)
[![Visual Studio Marketplace](https://vsmarketplacebadge.apphb.com/rating-star/muuvmuuv.vscode-sundial.svg)](https://marketplace.visualstudio.com/items?itemName=muuvmuuv.vscode-sundial)
[![Maintainability](https://api.codeclimate.com/v1/badges/52f93dc5f852410ef448/maintainability)](https://codeclimate.com/github/muuvmuuv/vscode-sundial/maintainability)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/muuvmuuv/vscode-sundial.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/muuvmuuv/vscode-sundial/alerts/)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/muuvmuuv/vscode-sundial.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/muuvmuuv/vscode-sundial/context:javascript)

- [Installation](#installation)
- [Keybindings](#keybindings)
- [Commands](#commands)
- [Menus](#menus)
- [Settings](#settings)
    - [Automatically get sunrise and sunset](#automatically-get-sunrise-and-sunset)
    - [Automatically get dark mode from macOS](#automatically-get-dark-mode-from-macos)
    - [Automatically set dark mode based on ambient light](#automatically-set-dark-mode-based-on-ambient-light)
  - [Order](#order)
  - [Examples](#examples)
- [Events](#events)
- [Development](#development)
  - [Tools](#tools)

Sundial changes your theme and VS Code settings (if needed) based on your day and night cycle or
other options, you choose. It is inspired by the
[OSX Mojave dynamic backgrounds](https://www.apple.com/de/macos/mojave/) and
[Night Owl for Mac](https://nightowl.kramser.xyz/). It should _reduce eye pain_ when working in the
night or on the day. Humans should not strain their eyes too much, it's **not recommended** to have
a light theme in the night and vice versa.

Whenever you have ideas for this project, things you would like to add or you found a bug, feel free
to create an issue or start contributing! 😇

<a href="https://www.buymeacoffee.com/devmuuv" target="_blank">
  <img src="https://www.buymeacoffee.com/assets/img/custom_images/yellow_img.png" alt="Buy me a Gluten-free Bread" style="margin-bottom:20px;">
</a>

![VSCode Sundial](https://raw.githubusercontent.com/muuvmuuv/vscode-sundial/master/assets/banner.jpg)

## Installation

You can simply install any VS Code extension via the VS Code Marketplace or download the VSIX file
and
[install it manually](https://stackoverflow.com/questions/37071388/how-to-install-vscode-extensions-offline).

<div>
  <a href="https://marketplace.visualstudio.com/items?itemName=muuvmuuv.vscode-sundial">
    <img src="https://img.shields.io/badge/install-vscode_extension-blue.svg?style=for-the-badge" alt="Install VS Code extension Sundial" style="margin-right:10px;">
  </a>
  <a href="https://github.com/muuvmuuv/vscode-sundial/releases/latest">
    <img src="https://img.shields.io/badge/download-vscode_extension-blue.svg?style=for-the-badge" alt="Download VS Code extension Sundial">
  </a>
</div>

## Keybindings

**Sundial** contributes the following keybindings:

| Platform | Keybinding            | Action                        |
| -------- | --------------------- | ----------------------------- |
| Windows  | <kbd>ctrl+alt+t</kbd> | `sundial.toggleDayNightTheme` |
| Mac      | <kbd>ctrl+cmd+t</kbd> | `sundial.toggleDayNightTheme` |

> Note that whenever you use one of this keybindings, Sundial will disable the automation process of
> changing your theme on day night basis. To continue using that feature you need to reactivate it
> with the command `sundial.continueAutomation`.

## Commands

**Sundial** contributes the following commands:

| Command                                            | Action                        | Description                           |
| -------------------------------------------------- | ----------------------------- | ------------------------------------- |
| _Night Theme 🌑_                                   | `sundial.switchToNightTheme`  | Switches to your night theme.         |
| _Day Theme 🌕_                                     | `sundial.switchToDayTheme`    | Switches to your day theme.           |
| _Toggle Day/Night Theme_                           | `sundial.toggleDayNightTheme` | Toggles between your day/night theme. |
| _Continue switching day/night theme automatically_ | `sundial.continueAutomation`  | Continues automation.                 |

> Note that whenever you use one of this commands, Sundial will disable the automation process of
> changing your theme on day night basis. To continue using that feature you need to reactivate it
> with `sundial.continueAutomation`.

## Menus

**Sundial** contributes the following menu bindings:

| Menu     | Text             | Command                      | Description                   |
| -------- | ---------------- | ---------------------------- | ----------------------------- |
| TouchBar | _Night Theme 🌑_ | `sundial.switchToNightTheme` | Switches to your night theme. |
| TouchBar | _Day Theme 🌕_   | `sundial.switchToDayTheme`   | Switches to your day theme.   |

To hide the Touch Bar options copy the below snippet into your VS Code settings:

```json
"keyboard.touchbar.ignored": [
  "sundial.switchToNightTheme",
  "sundial.switchToDayTheme"
]
```

## Settings

**Sundial** contributes the following settings:

| Setting                 | Default  | Description                                                               |
| ----------------------- | -------- | ------------------------------------------------------------------------- |
| `sundial.dayTheme`      | _Light+_ | Name of the theme of choice for your day work.                            |
| `sundial.nightTheme`    | _Dark+_  | Name of the theme of choice for your night work.                          |
| `sundial.sunrise`       | _07:00_  | Set a time when your day starts in **24 hours format**.                   |
| `sundial.sunset`        | _19:00_  | Set a time when your night starts in **24 hours format**.                 |
| `sundial.dayVariable`   | _0_      | Set a variable to change the theme **X minutes** before or after sunrise. |
| `sundial.nightVariable` | _0_      | Set a variable to change the theme **X minutes** before or after sunset.  |
| `sundial.daySettings`   | _{}_     | An **object** of VSCode settings applied on the day.                      |
| `sundial.nightSettings` | _{}_     | An **object** of VSCode settings applied on the night.                    |
| `sundial.interval`      | _5_      | Set a interval in which sundial should check the time in **minutes**.     |

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
[Free IP Geolocation API](https://freegeoip.app/) and check your internet connection via
[Cloudflares 1.1.1.1 DNS-Server](https://1.1.1.1/). You can get your latitude and longitude manually
from _Free IP Geolocation API_.

| Setting              | Default | Description                                      |
| -------------------- | ------- | ------------------------------------------------ |
| `sundial.autoLocale` | _false_ | Updates your location based on your geolocation. |
| `sundial.latitude`   | _⊘_     | e.g. _"50.110924"_                               |
| `sundial.longitude`  | _⊘_     | e.g. _"8.682127"_                                |

#### Automatically get dark mode from macOS

Sundial provides a method to get the current operating system appearance preference. This works only
on macOS at the moment. To use this set `sundial.systemTheme` to `true` and Sundial will ignore all
other options.

> Successfully tested on: MacBook Pro (15-inch, 2017) with macOS >=10.14.5.

#### Automatically set dark mode based on ambient light

> !!! WORK IN PROGRESS !!!

Sundial will check access to your computers ambient light sensor and will use it to determine if
dark mode is needed in your environment. To use this set `sundial.ambientLight` to `true`.

If you don't know what the ambient light sensor is, you might know it from your smartphone where the
display gets brighter or darken depending on the light around it. Most Laptops have this nowdays so
we can take use of it.

### Order

Sundial will be activated by this order:

1. `sundial.ambientLight` (WIP)
2. `sundial.systemTheme`
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

## Events

Sundial performs checks for a few VS Code events to check in certain situations if it should change
your theme. Here is a list of events which will Sundial perform by default.

- `window.onDidChangeWindowState`
- `window.onDidChangeActiveTextEditor`
- `window.onDidChangeTextEditorViewColumn`
- `workspace.onDidChangeConfiguration`
- `Sundial.automater`

If you want to customize those, you need to add an event to one of these config keys:

```json
{
  "sundial.windowEvents": [
    "onDidChangeWindowState",
    "onDidChangeActiveTextEditor",
    "onDidChangeTextEditorViewColumn"
  ],
  "sundial.workspaceEvents": ["onDidChangeConfiguration"]
}
```

You can find a full list of available events here:

- Workspace: https://code.visualstudio.com/api/references/vscode-api#workspace
- Window: https://code.visualstudio.com/api/references/vscode-api#window

## Development

We are working with [webpack](https://webpack.js.org/) to bundle Sundial to the smallest possible
size to increase the load time in VSCode.

1.  Install packages via `npm install`
2.  Set `sundial.debug` to `1` (not necessary but recommended)
3.  Run debugger => `Launch Extension`
    - View the _Extension Host_ and adjust settings to test **or**
    - Change a file and save it, let _webpack_ compile
4.  Reload the debugger (<kbd>⇧⌘F5</kbd>)
5.  ~~Run tests with `npm test`~~ (WIP!!!)
6.  Create a new [version](#tools): `npm run version`
7.  Commit your changes with a detailed explanation
8.  Create changelogs: `npm run changelog`
9.  Create a pull request

### Tools

- `npm run version`: Interactively create a new version (based on [semver](https://semver.org/)).
- `npm run release`: Create a new GitHub release draft.
