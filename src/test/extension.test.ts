import * as assert from 'node:assert'
import * as vscode from 'vscode'

suite('Extension Test Suite', () => {
	suiteSetup(async () => {
		// Wait for extension to activate
		const ext = vscode.extensions.getExtension('muuvmuuv.vscode-sundial')
		if (ext && !ext.isActive) {
			await ext.activate()
		}
	})

	test('Extension should be present', () => {
		const extension = vscode.extensions.getExtension('muuvmuuv.vscode-sundial')
		assert.ok(extension, 'Extension should be installed')
	})

	test('Extension should activate', async () => {
		const extension = vscode.extensions.getExtension('muuvmuuv.vscode-sundial')
		assert.ok(extension, 'Extension should be installed')
		assert.strictEqual(extension.isActive, true, 'Extension should be active')
	})

	test('Commands should be registered', async () => {
		const commands = await vscode.commands.getCommands(true)

		const expectedCommands = [
			'sundial.switchToNightTheme',
			'sundial.switchToDayTheme',
			'sundial.toggleDayNightTheme',
			'sundial.enableExtension',
			'sundial.disableExtension',
		]

		for (const cmd of expectedCommands) {
			assert.ok(commands.includes(cmd), `Command ${cmd} should be registered`)
		}
	})

	test('Configuration settings should be accessible', () => {
		const config = vscode.workspace.getConfiguration('sundial')

		// Verify settings are accessible (values may vary based on user config)
		assert.ok(typeof config.get('sunrise') === 'string', 'sunrise should be a string')
		assert.ok(typeof config.get('sunset') === 'string', 'sunset should be a string')
		assert.ok(typeof config.get('autoLocale') === 'boolean', 'autoLocale should be a boolean')
		assert.ok(typeof config.get('dayVariable') === 'number', 'dayVariable should be a number')
		assert.ok(typeof config.get('nightVariable') === 'number', 'nightVariable should be a number')
		assert.ok(typeof config.get('interval') === 'number', 'interval should be a number')
	})

	test('Enable/disable commands should execute without error', async () => {
		// These commands should not throw
		await vscode.commands.executeCommand('sundial.disableExtension')
		await vscode.commands.executeCommand('sundial.enableExtension')
	})
})
