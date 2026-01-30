const { defineConfig } = require('@vscode/test-cli')

module.exports = defineConfig({
	files: 'dist/test/**/*.test.js',
	workspaceFolder: './testProject',
	mocha: {
		ui: 'tdd',
		timeout: 20000,
	},
	launchArgs: [
		'--disable-extensions',
		'--disable-gpu',
		'--disable-telemetry',
		'--disable-workspace-trust',
		'--sync=off',
	],
	env: {
		// Disable MCP registry
		VSCODE_MCP_DISABLE: '1',
		VSCODE_DISABLE_MCP: '1',
		// Disable accounts/auth
		VSCODE_DISABLE_ACCOUNTS: '1',
		// Disable git
		VSCODE_GIT_DISABLE: '1',
	},
})
