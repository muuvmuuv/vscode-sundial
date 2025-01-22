<h1 align="left">
  <img align="right" src="https://raw.githubusercontent.com/muuvmuuv/vscode-sundial/main/assets/icon.png" width="150">
  <b>🌚 Sundial 🌝</b>
</h1>

#### Change your VS Code theme/settings based on your sunset, sunrise, system appearance or other preferences!

[![Visual Studio Marketplace Rating](https://img.shields.io/visual-studio-marketplace/stars/muuvmuuv.vscode-sundial)](https://marketplace.visualstudio.com/items?itemName=muuvmuuv.vscode-sundial)
[![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/muuvmuuv.vscode-sundial)
](https://marketplace.visualstudio.com/items?itemName=muuvmuuv.vscode-sundial)
![Visual Studio Marketplace Downloads](https://api.codeclimate.com/v1/badges/52f93dc5f852410ef448/maintainability)

- [Installation](#installation)
- [Keybindings](#keybindings)
- [Commands](#commands)
- [Settings](#settings)
    - [Automatically set by current location](#automatically-set-by-current-location)
    - [Automatically set by latitude and longitude](#automatically-set-by-latitude-and-longitude)
    - [Automatically set by OS appearance](#automatically-set-by-os-appearance)
  - [VS Code Settings](#vs-code-settings)
  - [Execution order](#execution-order)
  - [Status bar icon](#status-bar-icon)
  - [Examples](#examples)
- [Development](#development)
  - [Deployment](#deployment)
    - [Pre-release](#pre-release)
  - [Commits](#commits)

Sundial changes your theme and VS Code settings (if needed) based on your day and night
cycle or other options, you choose. It is inspired by the
[OSX Mojave dynamic backgrounds](https://www.apple.com/de/macos/mojave/) and
[Night Owl for Mac](https://nightowl.kramser.xyz/). It should _reduce eye pain_ when
working in the night or on the day. Humans should not strain their eyes too much, it's
**not recommended** to have a light theme in the night and vice versa.

Whenever you have ideas for this project, things you would like to add or you found a bug,
feel free to create an issue or start contributing! 😇

> The minimum supported VS Code version is
> [1.74.3](https://github.com/microsoft/vscode/tree/1.74.3)

<p>
  <a href="https://www.buymeacoffee.com/devmuuv" target="_blank">
    <img src="https://www.buymeacoffee.com/assets/img/custom_images/yellow_img.png" alt="Buy me a Gluten-free Bread" />
  </a>
</p>

![VSCode Sundial](https://raw.githubusercontent.com/muuvmuuv/vscode-sundial/main/assets/banner.jpg)

## Installation

You can simply install any VS Code extension via the VS Code Marketplace. Just click the
banner below:

<p>
  <a href="https://marketplace.visualstudio.com/items?itemName=muuvmuuv.vscode-sundial">
    <img src="https://img.shields.io/badge/install-vscode_extension-blue.svg?style=for-the-badge" alt="Install VS Code extension Sundial">
  </a>
</p>

> ⚠️ IMPORTANT: Since VS Code 1.42.0 automatically changing the theme based on OS
> appearance is build in, if you want to use this plugin anyway you must disable this
> options with `"window.autoDetectColorScheme": false`

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

> Note: Whenever you use one of the first three commands, Sundial will disable its
> automatic checks.

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
| `sundial.statusBarItemPriority`      | _100_            | Set the status bar icon position (higher mean more left).                 |
| `sundial.interval`                   | _5_              | Set a interval in which sundial should check the time in **minutes**.     |

> ⚠️ Don't forget to set `"window.autoDetectColorScheme": false`

> If you set the interval to zero (0) sundial will not periodically check the time but
> still when VS Code triggers some editor events.

> Any changes to sundial or VS Code settings will re-enable Sundial.

> On both `daySettings` and `nightSettings` they will override your Workbench VSCode
> settings. Please make sure both have the same properties otherwise they will not change
> since Sundial is not remembering the settings you have set before!

#### Automatically set by current location

Sundial will fetch your geolocation from [ip-api](https://ip-api.com/).

| Setting              | Default | Description                                      |
| -------------------- | ------- | ------------------------------------------------ |
| `sundial.autoLocale` | _false_ | Updates your location based on your geolocation. |

#### Automatically set by latitude and longitude

You can get your geolocation from [ip-api](https://ip-api.com/) or any other map service.

| Setting             | Default | Description        |
| ------------------- | ------- | ------------------ |
| `sundial.latitude`  | _⊘_     | e.g. _"50.110924"_ |
| `sundial.longitude` | _⊘_     | e.g. _"8.682127"_  |

#### Automatically set by OS appearance

Since VS Code version 1.42.0 it is now build in so you don't need this extension for this
options.

```json
{
  "window.autoDetectColorScheme": true
}
```

Read more about the implementation here:

- https://github.com/microsoft/vscode/issues/61519
- https://github.com/microsoft/vscode/pull/86600
- https://github.com/microsoft/vscode/pull/87405

### VS Code Settings

You can change your VS Code settings depending on your circle, this comes pretty handy if
you have issues ready a font size of 12 in the night.

```jsonc
{
  "sundial.daySettings": {
    "editor.fontSize": 12
  },
  "sundial.nightSettings": {
    "editor.fontSize": 14
  }
}
```

### Execution order

Sundial will check your settings in the following order and if one setting is present the
next coming will be ignored.

1. `sundial.latitude` and `sundial.longitude`
2. `sundial.autoLocale`
3. `sundial.sunrise` and `sundial.sunset`

### Status bar icon

![Status bar icon](https://raw.githubusercontent.com/muuvmuuv/vscode-sundial/main/assets/status-bar-icon.png)

Sundial will show a status bar icon that will toggle the current theme on click. This will
also disable all sundial automated checks.

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

I am working with [**esbuild**](https://esbuild.github.io/) to bundle Sundial to the
smallest possible size to increase the load time in VS Code _for you_.

> The minimum supported VS Code version is
> [1.74.3](https://github.com/microsoft/vscode/tree/1.74.3)

1.  Install packages via npm: `npm run install` (_pnpm_ does not work due to
    [this VSCE Issue](https://github.com/microsoft/vscode-vsce/issues/421))
2.  Run debugger => `Launch Extension`
    - View the _Extension Host_ and adjust settings to test **or**
    - Change a file and save it, let it compile
3.  Commit your changes with a detailed explanation
4.  Create a pull request

> Package size: 279.8kb

### Deployment

We use `release-it` to create a new release. This will automatically create a tag, release
and new changelog for us.

```
pnpm release-it --help
```

Sundial is deployed on VS Code Marketplace and Open VSX.

- VS Code Marketplace:
  - `vsce publish`
- Open VSX:
  - `vsce package`
  - `npx ovsx publish *.vsix -p TOKEN`

#### Pre-release

We update our version with release-it, so we must use some additional flags for `vsce`.
The version must be without pre-release identifier, because VS Code Marketplace does not
allow those.

```
pnpm vsce publish --pre-release --no-git-tag-version --no-update-package-json <pre_release_version>
```

### Commits

Sundial follows the `config-conventional` spec.
