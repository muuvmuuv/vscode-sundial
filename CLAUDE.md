# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sundial is a VS Code extension that automatically changes themes and settings based on sunrise/sunset times, system appearance, or manual time preferences. It helps reduce eye strain by switching between light and dark themes at appropriate times.

## Development Commands

**Important**: This project uses **npm** (not pnpm or yarn) because vsce (VS Code Extension CLI) does not natively support other package managers. See [vsce issue #421](https://github.com/microsoft/vscode-vsce/issues/421).

### Build & Development
- `npm install` - Install dependencies
- `npm run dev` - Watch mode compilation using esbuild (runs `compile.sh --watch`)
- `npm run compile` - One-time compilation
- `npm run package` - Minified production build (runs before publishing)

### Code Quality
- `npm run check` - Run Biome linter/formatter checks
- `npm run format` - Auto-fix formatting and linting issues with Biome

### Testing & Debugging
- Use VS Code's debugger with "Launch Extension" configuration to test the extension in a new Extension Host window
- Make changes to source files and they will auto-compile in dev mode

### Releasing
- `npm run release` - Uses release-it to create tags, releases, and changelog
- Extension is published to both VS Code Marketplace (`vsce publish`) and Open VSX
- Follows conventional commits specification (validated via commitlint)

## Architecture

### Core Components

**extension.ts** (Entry Point)
- Exports `activate()` and `deactivate()` lifecycle hooks
- Registers VS Code commands for manual theme switching
- Sets up event listeners (window state changes, editor changes, config changes)
- Creates a singleton `Sundial` instance

**sundial.ts** (Main Controller)
- `Sundial` class manages the entire extension lifecycle
- Stores enabled state in VS Code's global state (`sundial.enabled`)
- Runs interval-based checks to determine if theme should change
- Creates status bar icon for manual toggling
- Core method: `check()` - determines current time (day/night) and applies appropriate theme

**editor.ts** (Theme & Settings Manager)
- `changeToDay()` / `changeToNight()` - Apply theme and settings for each time period
- Uses VS Code's `workbench.preferredLightColorTheme` and `workbench.preferredDarkColorTheme`
- `applySettings()` - Applies custom VS Code settings for day/night from `sundial.daySettings` and `sundial.nightSettings`
- `toggleTheme()` - Manual toggle between themes (disables automation)

**sensors/** (Time Detection)
- `latlong.ts` - Uses `suncalc` library with manual latitude/longitude settings
- `autolocale.ts` - Fetches geolocation via ip-api.com and calculates sunrise/sunset
- Both return `Tides` interface with sunrise/sunset Date objects

### Settings Priority Order

The extension checks settings in this order (first match wins):
1. `sundial.latitude` + `sundial.longitude` → uses suncalc
2. `sundial.autoLocale` → fetches location from ip-api.com
3. `sundial.sunrise` + `sundial.sunset` → manual 24h time strings

### Key Behaviors

- **Automation disable**: Using any manual command (toggle, switch to day/night) disables automatic checks until settings change or extension is re-enabled
- **Interval checking**: Extension checks time every X minutes (configured via `sundial.interval`, default 5 minutes)
- **Variable offsets**: `sundial.dayVariable` and `sundial.nightVariable` allow shifting theme changes X minutes before/after sunrise/sunset
- **Event-based checks**: Also checks on window state changes, editor changes, and view column changes
- **Status bar**: Shows `$(color-mode)` icon that toggles theme on click (also disables automation)

### Extension Context

The `Sundial` class uses a static `extensionContext` property set during `activate()` to access VS Code's global state for persistence across sessions.

## Build System

Uses **esbuild** via `compile.sh` for fast bundling:
- Bundles all TypeScript into single `dist/extension.js` file
- Targets ES2020 with CommonJS format
- External: vscode module (provided by VS Code runtime)
- Banner with extension metadata injected from package.json

## Code Style

- Uses **Biome** for formatting and linting (configured in `biome.json`)
- Tab indentation (width: 2)
- Semicolons: as needed (not required)
- Line width: 90 characters
- Git hooks via **lefthook** run Biome on pre-commit

## Important Notes

- Minimum VS Code version: 1.91.1
- Users must set `"window.autoDetectColorScheme": false` to avoid conflicts with VS Code's built-in theme switching
- Extension activates on `onStartupFinished` event
- Package size target: ~42KB
- Settings applied via `sundial.daySettings` and `sundial.nightSettings` must mirror properties or they won't properly toggle back and forth
