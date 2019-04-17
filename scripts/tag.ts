#!/usr/bin/env ts-node

/**
 * Check if it is save to create a new tag.
 */

import chalk from 'chalk'
import * as execa from 'execa'

checkDiff()
async function checkDiff() {
  const { stdout } = await execa('git', ['diff', 'HEAD'])

  if (stdout) {
    console.log(
      chalk.red(
        'You have unstashed changes! Please commit your changes before tagging the latest commit or creat one manually.\n'
      )
    )
    process.exit(1)
  }
}
