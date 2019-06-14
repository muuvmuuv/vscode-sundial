import fs from 'fs-extra'
import path from 'path'
import chalk from 'chalk'
import release from 'release-it'
import pkg from '../package.json'

/**
 * Check if VSIX file is created for this version.
 */
const vsix = path.resolve(__dirname, `../vscode-sundial-${pkg.version}.vsix`)
if (!fs.pathExistsSync(vsix)) {
  console.log(chalk.red(`No .vsix file found for v${pkg.version}`))
  process.exit(1)
}
console.log(`Found .vsix file for v${pkg.version}`)

/**
 * Create a new release with release-it
 */
console.log('Initialize release...')
release({
  increment: pkg.version,
  // verbose: true,
  'non-interactive': true,
  // 'dry-run': true,
  git: {
    requireCleanWorkingDir: false,
    commit: false,
    push: false,
    tag: true,
    tagName: 'v${version}',
    tagAnnotation: 'Release v${version}',
    changelog:
      'npm run changelog -- --stdout --commit-limit false --unreleased --template scripts/release.hbs',
  },
  npm: {
    publish: false,
  },
  github: {
    release: true,
    releaseName: 'Release v${version}',
    // releaseNotes: 'git log --pretty=format:"* %s (%h)" HEAD',
    // releaseNotes: changelogSectionVersion,
    preRelease: false,
    draft: true,
    tokenRef: 'GITHUB_TOKEN',
    assets: null,
    host: null,
    timeout: 0,
    proxy: null,
  },
  scripts: {
    beforeStart: ['npm run lint', 'npm test'],
    afterRelease: 'echo Successfully released ${name} v${version}!',
  },
})
  .then(({ version, latestVersion, name, releaseNote }) => {
    console.log(version)
    console.log(latestVersion)
    console.log(name)
    console.log(releaseNote)
  })
  .catch(e => {
    throw new Error(e)
  })
