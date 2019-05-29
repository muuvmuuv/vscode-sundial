# Changelog

All notable changes to **vscode-sundial** will be documented in this file.

[[1.8.0]](#180) ← [[1.7.2]](#172) ← [[1.7.1]](#171) ← [[1.7.0]](#170) ← [[1.6.0]](#160) ←
[[1.5.1]](#151) ← [[1.5.0]](#150) ← [[1.4.0]](#140) ← [[1.3.3]](#133) ← [[1.3.2]](#132) ←
[[1.3.0]](#130) ← [[1.2.2]](#122) ← [[1.2.1]](#121) ← [[1.2.0]](#120) ← [[1.1.21]](#1121) ←
[[1.1.2]](#112) ← [[1.1.1]](#111) ← [[1.1.0]](#110) ← [[1.0.3]](#103) ← [[1.0.2]](#102) ←
[[1.0.1]](#101) ← [[1.0.0]](#100) ← [[0.2.1]](#021) ← [[0.2.0]](#020) ← [[0.1.0]](#010) ←
[[0.0.3]](#003) ← [[0.0.2]](#002) ← [[Unreleased]](#unreleased)

## [1.8.0]

- (WIP) set up tests
- Added offline support
- Enhanced logging
- Refactor main script in separate scripts
- Add new sensor macOS Appearance

## [1.7.2]

- Typo
- Added examples to README

## [1.7.1]

- Check after calling `Continue automation`.
- Fixed little issues with applying settings
- Fixed a bug [#3](https://github.com/muuvmuuv/vscode-sundial/issues/3#issuecomment-486259188)

## [1.7.0]

- Added support for having two different VSCode settings, one for the day and one for the night.

## [1.6.0]

- Removed `useHTTPS`, on by default now
- Removed ipapi as our geoIP provider and replace it with https://freegeoip.app
- Removed package `public-ip` because _freegeopip_ does not need a IP
- Added `dayVariable` and `nightVariable` to the README
- Some typo
- Renamed function `changeTheme`
- Added offline support 🏖 #10 (just a fallback to defaults)
- Added advanced logging

## [1.5.1]

- Added script to easier create a new release
- Allow ES module interprop

## [1.5.0]

- Added support for day/night time variable, so a user can set minutes where the theme should change
  before/after sunset/sunrise
- Fixes a bug with automater, where it has never called the check

## [1.4.0]

- Added scripts to interactively create version
- Added script to faster push a new tag
- Fixed issue of webpack build notifier
- Fix: #26 and typo

## [1.3.3]

- Fixes #13
- Added check breaker to prevent to many calls in a row or simultaneously

## [1.3.2]

- Updated dependencies
- Ported webpack conf to JS version 'cause of an issue with webpack-build-notifier
- Adjusted the vscode [launch.json](.vscode/launch.json) and [tasks.json](.vscode/tasks.json)
- CC-Fix: exceeds 25 allowed
- CC-Fix: Exceeds 25 allowed
- CC-Fix: Similar blocks of code found
- Increased print width
- Removed no longer needed typings
- Updated markdown files print width
- Updated lgtm link

## [1.3.0]

- Added webpack to bundle and minify the extension (Closes #8)
- Adjusted the vscode [launch.json](.vscode/launch.json) and [tasks.json](.vscode/tasks.json)
- More typings
- Transformed webpack to typescript with types :heart:
- Edited the [README Development-Section](README.md#hammer_and_wrench-development) Adjusted the
  package.json file and made some improvements
- Added extension recommendations
- Added error response for ipapi + request limit message
- Added HTTPS support for parts (ipapi requires a subscription plan)

## [1.2.2]

- Typos
- Reformatted files with prettier
- New style (no semi)
- Fixed issue #4

## [1.2.1]

- Fixed a problem where sundial catched the wrong date after leaving the editor open for longer then
  a day (currently in testing stage)

## [1.2.0]

- Added VS Code commands to switch the theme by hand
- Added explanation for the new commands feature to README.md
- Updated the README.md a little bit to improve reading

## [1.1.21]

- Removed test console.log

## [1.1.2]

- #2: Workbench config fix

## [1.1.1]

- Refactored functions
- Some typo
- Changed default settings

## [1.1.0]

- Fixed a bug where autoLocale could not access the API server because the provider is down
- Sundial will check for lat/long first before `autoLocale`
- `autoLocale` will now store the public up and lat/long into VS Code state to avoid much api calls
  to the new provider
- Some typo and text optimization
- Sunrise and sunset are set on start up to avoid conflicts when nothing could grab the location
- Some styling and formating
- Added some more debug output and type checking
- Removed config check (no need because we have defaults)

## [1.0.3]

- Updated README
- Moved pre-push to .git

## [1.0.2]

- Added pre-push event to
  - detect when version has not been updated
  - detect when no changes has been made to CHANGELOG

## [1.0.1]

- Updated packages
- Updated README
- Fixed a issue with the subscription events

## [1.0.0]

- Rebuild the program
- Added new options
- Added auto get locale through ip to get sunset and sunrise
- Added better debugging

## [0.2.1]

- Fixed a problem with `vscode:prepublish`
- Added `moment` to _peerDependencies_
- Updated node modules
- Started with tests

## [0.2.0]

- Changed option `day_range` to `day_start`
- Changed option `night_range` to `night_start`
- Optimization

## [0.1.0]

- Added option `day_range`
- Added option `night_range`
- Added the ability to select a range of time where the theme should be changed

## [0.0.3]

- Removed changelog in README and edited CHANGELOG file

## [0.0.2]

- Removed log in applyTheme
- Grammar in README
- Added banner to README

## [Unreleased]

- Initial release
