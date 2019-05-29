import vscode from 'vscode'

suite('Commands', () => {
  test('Should toggle the theme', async () => {
    await vscode.commands.executeCommand('sundial.toggleDayNightTheme')
  })
})
