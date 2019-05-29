//
// PLEASE DO NOT MODIFY / DELETE UNLESS YOU KNOW WHAT YOU ARE DOING
//

import * as testRunner from 'vscode/lib/testrunner'

/**
 * Mocha options.
 *
 * @see https://github.com/mochajs/mocha/wiki/Using-mocha-programmatically#set-options
 */
testRunner.configure({
  ui: 'tdd', // the TDD UI is being used in extension.test.ts (suite, test, etc.)
  useColors: true, // colored output from test results
})

module.exports = testRunner
