const fs = require('fs')
const path = require('path')
const { green, cyan } = require('kleur')
const { inc, lte, valid } = require('semver')
const prompts = require('prompts')
const pkg = require('../package.json')

const currentVersion = pkg.version
const SEMVER_INCREMENTS = [
  'patch',
  'minor',
  'major',
  'prepatch',
  'preminor',
  'premajor',
  'prerelease',
]

const isValidVersion = input => Boolean(valid(input))
const isValidInput = input => SEMVER_INCREMENTS.includes(input) || isValidVersion(input)
const isLowerThanOrEqualTo = version => {
  return !isValidVersion(version) || lte(version, currentVersion)
}

async function createNewVersion() {
  const questions = [
    {
      type: 'select',
      name: 'version',
      message: 'New version',
      choices: SEMVER_INCREMENTS.map(increment => ({
        title: inc(currentVersion, increment),
        value: inc(currentVersion, increment),
      })).concat([
        {
          title: 'Other (specify)',
          value: 'custom',
        },
      ]),
    },
    {
      type: prev => (prev === 'custom' ? 'text' : null),
      name: 'version',
      message: 'Version',
      validate: input => {
        if (!isValidInput(input)) {
          return 'Please specify a valid semver, for example, `1.2.3`. See http://semver.org.'
        }
        if (isLowerThanOrEqualTo(input)) {
          return `Version must be greater than ${currentVersion}`
        }
        return true
      },
    },
  ]

  const { version } = await prompts(questions)
  console.log(`\nWill bump from ${cyan(currentVersion)} to ${cyan(version)}\n`)

  return Promise.resolve(version)
}

function writePkg(content) {
  return new Promise(resolve => {
    fs.writeFile(
      path.resolve(__dirname, '../package.json'),
      JSON.stringify(content, null, 2) + '\n',
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
  pkg.version = version

  writePkg(pkg).then(() => {
    console.log(green('Saved version to package.json!'))
  })
})
