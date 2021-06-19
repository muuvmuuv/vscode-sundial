<h1 align="left">
  <img align="right" src="https://raw.githubusercontent.com/muuvmuuv/vscode-sundial/main/assets/icon.png" width="150">
  <b>🌚 Sundial 🌝</b>
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
- [Settings](#settings)
    - [Automatically set by current location](#automatically-set-by-current-location)
    - [Automatically set by latitude and longitude](#automatically-set-by-latitude-and-longitude)
    - [Automatically set by OS appearance](#automatically-set-by-os-appearance)
  - [Execution order](#execution-order)
  - [Examples](#examples)
- [Development](#development)
  - [Deploy](#deploy)
  - [Commits](#commits)
  - [Releases](#releases)

Sundial changes your theme and VS Code settings (if needed) based on your day and night cycle or
other options, you choose. It is inspired by the
[OSX Mojave dynamic backgrounds](https://www.apple.com/de/macos/mojave/) and
[Night Owl for Mac](https://nightowl.kramser.xyz/). It should _reduce eye pain_ when working in the
night or on the day. Humans should not strain their eyes too much, it's **not recommended** to have
a light theme in the night and vice versa.

Whenever you have ideas for this project, things you would like to add or you found a bug, feel free
to create an issue or start contributing! 😇

<p>
  <a href="https://www.buymeacoffee.com/devmuuv" target="_blank">
    <img src="https://www.buymeacoffee.com/assets/img/custom_images/yellow_img.png" alt="Buy me a Gluten-free Bread" />
  </a>
</p>

![VSCode Sundial](https://raw.githubusercontent.com/muuvmuuv/vscode-sundial/main/assets/banner.jpg)

## Installation

You can simply install any VS Code extension via the VS Code Marketplace. Just click the banner
below:

<p>
  <a href="https://marketplace.visualstudio.com/items?itemName=muuvmuuv.vscode-sundial">
    <img src="https://img.shields.io/badge/install-vscode_extension-blue.svg?style=for-the-badge" alt="Install VS Code extension Sundial">
  </a>
</p>

> ⚠️ IMPORTANT: Since VS Code 1.42.0 automatically changing the theme based on OS appearance is
> build in, if you want to use this plugin anyway you must disable this options with
> `"window.autoDetectColorScheme": false`

## Keybindings

**Sundial** contributes the following keybindings:

| Platform | Keybinding            | Description                           |
| -------- | --------------------- | ------------------------------------- |
| Windows  | <kbd>ctrl+alt+t</kbd> | Toggles between your day/night theme. |
| Mac      | <kbd>ctrl+cmd+t</kbd> | Toggles between your day/night theme. |

> Note: Whenever you use one of these keybindings, Sundial will be disabled.

## Commands

**Sundial** contributes the following commands:

| Command                           | Description                                 |
| --------------------------------- | ------------------------------------------- |
| Sundial: Switch to night theme 🌑 | Switches to your night theme.               |
| Sundial: Switch to day theme 🌕   | Switches to your day theme.                 |
| Sundial: Toggle Day/Night Theme   | Toggles between your day/night theme.       |
| Sundial: Enable extension         | Continues automation and enables extension. |
| Sundial: Disable extension        | Disables extension.                         |
| Sundial: Pause until next circle  | Pause until next day/night circle.          |

> Note: Whenever you use one of the first three commands, Sundial will be disabled.

## Settings

**Sundial** contributes the following settings:

| Setting                              | Default          | Description                                                               |
| ------------------------------------ | ---------------- | ------------------------------------------------------------------------- |
| `workbench.preferredLightColorTheme` | _Default Light+_ | Name of the theme of choice for your day work.                            |
| `workbench.preferredDarkColorTheme`  | _Default Dark+_  | Name of the theme of choice for your night work.                          |
| `sundial.sunrise`                    | _07:00_          | Set a time when your day starts in **24 hours format**.                   |
| `sundial.sunset`                     | _19:00_          | Set a time when your night starts in **24 hours format**.                 |
| `sundial.dayVariable`                | _0_              | Set a variable to change the theme **X minutes** before or after sunrise. |
| `sundial.nightVariable`              | _0_              | Set a variable to change the theme **X minutes** before or after sunset.  |
| `sundial.daySettings`                | _{}_             | An **object** of VSCode settings applied on the day.                      |
| `sundial.nightSettings`              | _{}_             | An **object** of VSCode settings applied on the night.                    |
| `sundial.interval`                   | _5_              | Set a interval in which sundial should check the time in **minutes**.     |

> ⚠️ Don't forget to set `"window.autoDetectColorScheme": false`

> If you set the interval to zero (0) sundial will not periodically check the time but still when VS
> Code triggers some editor events.

> On both `daySettings` and `nightSettings` they will override your Workbench VSCode settings.
> Please make sure both have the same properties otherwise they will not change since Sundial is not
> remembering the settings you have set before!

#### Automatically set by current location

Sundial will get your geolocation from [Free IP Geolocation API](https://freegeoip.app/) and check
your internet connection via [Cloudflares 1.1.1.1 DNS-Server](https://1.1.1.1/).

| Setting              | Default | Description                                      |
| -------------------- | ------- | ------------------------------------------------ |
| `sundial.autoLocale` | _false_ | Updates your location based on your geolocation. |

#### Automatically set by latitude and longitude

You can get your geolocation here: [Free IP Geolocation API](https://freegeoip.app/)

| Setting             | Default | Description        |
| ------------------- | ------- | ------------------ |
| `sundial.latitude`  | _⊘_     | e.g. _"50.110924"_ |
| `sundial.longitude` | _⊘_     | e.g. _"8.682127"_  |

#### Automatically set by OS appearance

Since VS Code version 1.42.0 it is now build in so you don't need this extension for this options.

```json
{
  "window.autoDetectColorScheme": true
}
```

Read more about the implementation here:

- https://github.com/microsoft/vscode/issues/61519
- https://github.com/microsoft/vscode/pull/86600
- https://github.com/microsoft/vscode/pull/87405

### Execution order

Sundial will check your settings in the following order and if one setting is present the next
coming will be ignored.

1. `sundial.latitude` and `sundial.longitude`
2. `sundial.autoLocale`
3. `sundial.sunrise` and `sundial.sunset`

### Examples

```jsonc
{
  "window.autoDetectColorScheme": false, // required!
  "workbench.preferredLightColorTheme": "Default Light+",
  "workbench.preferredDarkColorTheme": "Default Dark+",
  "sundial.interval": 20,
  "sundial.autoLocale": true
}
```

```jsonc
{
  "window.autoDetectColorScheme": false, // required!
  "workbench.preferredLightColorTheme": "Default Light+",
  "workbench.preferredDarkColorTheme": "Default Dark+",
  "sundial.sunrise": "05:12"
}
```

```jsonc
{
  "window.autoDetectColorScheme": false, // required!
  "workbench.preferredLightColorTheme": "Default Light+",
  "workbench.preferredDarkColorTheme": "Default Dark+",
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

## Development

We are working with [webpack](https://webpack.js.org/) to bundle Sundial to the smallest possible
size to increase the load time in VSCode.

1.  Install packages via (your preferred package manager) `npm run install`
2.  Set `sundial.debug` to `2`
3.  Run debugger => `Launch Extension`
    - View the _Extension Host_ and adjust settings to test **or**
    - Change a file and save it, let _webpack_ compile
4.  Commit your changes with a detailed explanation
5.  Create a pull request

### Deploy

Sundial is deployed on VS Code Marketplace and Open VSX.

- VS Code Marketplace: `vsce publish`
- Open VSX: `npm run publish-ovsx`

### Commits

Sundial follows the `config-conventional` spec.

### Releases

Run the below to create a new release. This will increase the version based on your changes and
create a new CHANGELOG.md section.

```shell
npm run run release
```
