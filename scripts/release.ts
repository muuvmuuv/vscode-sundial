#!/usr/bin/env ts-node

/**
 * Creates a new release from our CHANGELOG.md with GitHub's tool Hub.
 *
 * @package https://hub.github.com/
 */

import fs from 'fs-extra'
import path from 'path'
import chalk from 'chalk'
import execa from 'execa'
import pkg from '../package.json'

const version = pkg.version
const isDraft = true

release()
async function release() {
  const changelog = await getChangelog()
  await hubInstalled()

  const hubFlags = ['release', 'create']
  if (isDraft) {
    hubFlags.push('--draft') // is a draft
  }
  hubFlags.push('--browse') // open in browser after finished
  hubFlags.push(`--message="New release v${version}"`) // title
  hubFlags.push(`--message="${changelog}"`) // message
  hubFlags.push(`v${version}`) // tag

  const { cmd } = await execa('hub', hubFlags, { shell: true })
  console.log(chalk.dim(cmd), '\n')
  console.log(chalk.green('Successfully created new release!\n'))
  process.exit(0)
}

async function hubInstalled() {
  const { stdout } = await execa('hub', ['version'])

  if (stdout.includes('hub')) {
    return true
  }
  throw new Error('Hub is not installed! Please visit `https://hub.github.com/` to install it.')
}

async function getChangelog(): Promise<string> {
  const changelogPath = path.resolve(__dirname, '../CHANGELOG.md')
  let changelog = await fs.readFile(changelogPath, 'UTF-8')

  const RM_CHANGELOG = new RegExp(`(?:##\\s\\[${version}\]\\n+)([\\d\\D]*?)(?:\\n+##)`, 'gm')
  const match = RM_CHANGELOG.exec(changelog)
  console.log(chalk.dim(RM_CHANGELOG.toString()), '\n')

  if (match) {
    console.log(chalk.yellow(`Changelog for version ${version}`))
    changelog = match[1]
    console.log(changelog, '\n')
    return changelog
  }
  return ''
}
