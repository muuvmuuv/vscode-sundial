import assert from 'assert'
import { after } from 'mocha'

import vscode from 'vscode'
// import Sundial from '../../sundial'

suite('Extension Test Suite', () => {
  after(() => {
    vscode.window.showInformationMessage('All tests done!')
  })

  test('Sample test', () => {
    assert.equal(-1, [1, 2, 3].indexOf(5))
    assert.equal(-1, [1, 2, 3].indexOf(0))
  })
})
