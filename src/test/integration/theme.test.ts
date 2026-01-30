import * as assert from 'node:assert'
import * as vscode from 'vscode'

suite('Theme Switching Test Suite', () => {
	suiteSetup(async () => {
		// Wait for extension to activate
		const ext = vscode.extensions.getExtension('muuvmuuv.vscode-sundial')
		if (ext && !ext.isActive) {
			await ext.activate()
		}
	})

	test('Should have preferred theme settings available', () => {
		const workbenchConfig = vscode.workspace.getConfiguration('workbench')

		// These settings should exist in VS Code
		const lightTheme = workbenchConfig.get('preferredLightColorTheme')
		const darkTheme = workbenchConfig.get('preferredDarkColorTheme')

		// They might be undefined if not set, but the setting should be accessible
		assert.ok(
			lightTheme !== undefined || workbenchConfig.has('preferredLightColorTheme'),
			'preferredLightColorTheme setting should be accessible',
		)
		assert.ok(
			darkTheme !== undefined || workbenchConfig.has('preferredDarkColorTheme'),
			'preferredDarkColorTheme setting should be accessible',
		)
	})

	test('Toggle command should execute without error', async () => {
		// First disable to have a known state
		await vscode.commands.executeCommand('sundial.disableExtension')

		// Toggle should work
		await vscode.commands.executeCommand('sundial.toggleDayNightTheme')

		// Re-enable for other tests
		await vscode.commands.executeCommand('sundial.enableExtension')
	})

	test('Switch to day theme command should execute', async () => {
		await vscode.commands.executeCommand('sundial.switchToDayTheme')
		// Command disables automation, so re-enable
		await vscode.commands.executeCommand('sundial.enableExtension')
	})

	test('Switch to night theme command should execute', async () => {
		await vscode.commands.executeCommand('sundial.switchToNightTheme')
		// Command disables automation, so re-enable
		await vscode.commands.executeCommand('sundial.enableExtension')
	})

	test('Configuration sunrise/sunset should accept valid time formats', async () => {
		const config = vscode.workspace.getConfiguration('sundial')

		try {
			// Update to new values - use workspace target for test isolation
			await config.update('sunrise', '06:30', vscode.ConfigurationTarget.Workspace)
			await config.update('sunset', '20:00', vscode.ConfigurationTarget.Workspace)

			// Verify update - need to get fresh config
			const updatedConfig = vscode.workspace.getConfiguration('sundial')
			assert.strictEqual(updatedConfig.get('sunrise'), '06:30')
			assert.strictEqual(updatedConfig.get('sunset'), '20:00')
		} finally {
			// Restore by removing workspace override
			await config.update('sunrise', undefined, vscode.ConfigurationTarget.Workspace)
			await config.update('sunset', undefined, vscode.ConfigurationTarget.Workspace)
		}
	})

	test('Configuration interval should accept valid number', async () => {
		const config = vscode.workspace.getConfiguration('sundial')

		try {
			await config.update('interval', 10, vscode.ConfigurationTarget.Workspace)

			const updatedConfig = vscode.workspace.getConfiguration('sundial')
			assert.strictEqual(updatedConfig.get('interval'), 10)
		} finally {
			await config.update('interval', undefined, vscode.ConfigurationTarget.Workspace)
		}
	})

	test('Configuration dayVariable and nightVariable should accept positive and negative numbers', async () => {
		const config = vscode.workspace.getConfiguration('sundial')

		try {
			// Test positive and negative offsets
			await config.update('dayVariable', 30, vscode.ConfigurationTarget.Workspace)
			await config.update('nightVariable', -15, vscode.ConfigurationTarget.Workspace)

			const updatedConfig = vscode.workspace.getConfiguration('sundial')
			assert.strictEqual(updatedConfig.get('dayVariable'), 30)
			assert.strictEqual(updatedConfig.get('nightVariable'), -15)
		} finally {
			await config.update('dayVariable', undefined, vscode.ConfigurationTarget.Workspace)
			await config.update('nightVariable', undefined, vscode.ConfigurationTarget.Workspace)
		}
	})

	test('Configuration dayVariable and nightVariable should accept positive and negative numbers', async () => {
		const config = vscode.workspace.getConfiguration('sundial')
		const originalDayVar = config.get('dayVariable')
		const originalNightVar = config.get('nightVariable')

		try {
			// Test positive offset
			await config.update('dayVariable', 30, vscode.ConfigurationTarget.Global)
			await config.update('nightVariable', -15, vscode.ConfigurationTarget.Global)

			const updatedConfig = vscode.workspace.getConfiguration('sundial')
			assert.strictEqual(updatedConfig.get('dayVariable'), 30)
			assert.strictEqual(updatedConfig.get('nightVariable'), -15)
		} finally {
			await config.update('dayVariable', originalDayVar, vscode.ConfigurationTarget.Global)
			await config.update('nightVariable', originalNightVar, vscode.ConfigurationTarget.Global)
		}
	})
})
