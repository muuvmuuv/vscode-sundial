#!/usr/bin/env ts-node

/**
 * Increase version based on package.json version.
 *
 * Thanks to @sindresorhus and his awesome package `np`
 * @see https://github.com/sindresorhus/np
 */

import { valid, inc, ReleaseType, SemVer, lte } from 'semver'
import chalk from 'chalk'
import { prompt, Questions } from 'inquirer'
import fs from 'fs'
import path from 'path'
import pkg from '../package.json'

const SEMVER_INCREMENTS: any[] = [
  'patch',
  'minor',
  'major',
  'prepatch',
  'preminor',
  'premajor',
  'prerelease',
]

const isValidVersion = (input: SemVer | string) => Boolean(valid(input))
const isValidInput = input => SEMVER_INCREMENTS.includes(input) || isValidVersion(input)
const validate = (version: SemVer | string) => {
  if (!isValidVersion(version)) {
    throw new Error('Version should be a valid semver version.')
  }
}

const getNewVersionFrom = (input: ReleaseType) => {
  isValidVersion(pkg.version)
  if (!isValidInput(input)) {
    throw new Error(
      `Version should be either ${SEMVER_INCREMENTS.join(', ')} or a valid semver version.`
    )
  }

  return SEMVER_INCREMENTS.includes(input) ? inc(pkg.version, input) || '' : input
}

const isLowerThanOrEqualTo = otherVersion => {
  validate(pkg.version)
  validate(otherVersion)

  return lte(otherVersion, pkg.version)
}

async function createNewVersion() {
  const prompts: Questions = [
    {
      type: 'list',
      name: 'version',
      message: 'Select semver increment or specify new version',
      pageSize: SEMVER_INCREMENTS.length + 1,
      filter: (input: ReleaseType) => (isValidInput(input) ? getNewVersionFrom(input) : input),
      choices: SEMVER_INCREMENTS.map(seminc => ({
        name: `${seminc} \t${chalk.reset.dim(getNewVersionFrom(seminc))}`,
        value: seminc,
      })).concat([
        {
          name: 'Other (specify)',
          value: null,
        },
      ]),
    },
    {
      type: 'input',
      name: 'version',
      message: 'Version',
      when: answers => !answers.version,
      filter: (input: ReleaseType) => (isValidInput(input) ? getNewVersionFrom(input) : input),
      validate: input => {
        if (!isValidInput(input)) {
          return 'Please specify a valid semver, for example, `1.2.3`. See http://semver.org'
        }

        if (isLowerThanOrEqualTo(input)) {
          return `Version must be greater than ${pkg.version}`
        }

        return true
      },
    },
  ]

  const { version } = await prompt(prompts)
  console.log(`Will bump from ${chalk.cyan(pkg.version)} to ${chalk.cyan(version)}\n`)

  return Promise.resolve(version)
}

function writePkg(content) {
  return new Promise(resolve => {
    fs.writeFile(
      path.resolve(__dirname, '../package.json'),
      JSON.stringify(content, null, 2),
      err => {
        if (err) {
          throw new Error(err.message)
        }
        resolve()
      }
    )
  })
}

createNewVersion().then(version => {
  const newPkg = pkg
  newPkg.version = version
  writePkg(newPkg).then(() => {
    console.log(chalk.green('Saved new version to package.json!'))
  })
})
