const os = require('os')
const path = require('path')
const chalk = require('chalk')
const { BannerPlugin } = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')
const CleanPlugin = require('clean-webpack-plugin')
const BuildNotifier = require('webpack-build-notifier')
const PACKAGE = require('./package.json')

/**
 * Console warnings:
 *
 * WARNING in ./node_modules/keyv/src/index.js 18:14-40
 * Critical dependency: the request of a dependency is an expression
 * https://github.com/lukechilds/keyv/issues/45
 *
 * WARNING in ./node_modules/got/source/request-as-event-emitter.js 72:18-25
 * Critical dependency: require function is used in a way in which dependencies
 * cannot be statically extracted
 * https://github.com/sindresorhus/got/issues/742
 */

const Banner = `${'┄'.repeat(46)}
${PACKAGE.displayName} (${PACKAGE.name})
${PACKAGE.description}

@version ${PACKAGE.version}
@license ${PACKAGE.license}
@author ${PACKAGE.author.name} (${PACKAGE.author.url})
@readme ${PACKAGE.homepage}
@package ${PACKAGE.repository}
${'┄'.repeat(46)}`

module.exports = (env, argv) => {
  const platformName = os.platform()
  const developerName = os.userInfo().username
  const mode = argv.mode ? argv.mode : 'none'
  const isProd = mode === 'production'
  const isDev = mode === 'development'

  // Show general information
  console.log('whoIsMe:', chalk.whiteBright(developerName))
  console.log('whichOs:', chalk.whiteBright(platformName))
  console.log('devMode:', isDev ? chalk.green('true') : chalk.red('false'), '\n')

  return {
    target: 'node',
    entry: path.resolve(__dirname, 'src', 'extension.ts'),
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'extension.js',
      libraryTarget: 'commonjs2',
      devtoolModuleFilenameTemplate: '../[resource-path]',
    },
    devtool: isDev ? 'cheap-module-source-map' : 'source-map',
    externals: {
      vscode: 'commonjs vscode', // the vscode-module is created on-the-fly and must be excluded. 📖 -> https://webpack.js.org/configuration/externals/
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    optimization: {
      namedModules: true,
      namedChunks: true,
      minimize: isProd,
      minimizer: [new TerserPlugin()],
    },
    plugins: [
      new BuildNotifier({
        title: 'Sundial',
        logo: path.resolve(__dirname, 'assets', 'icon.jpg'),
        onClick: () => {
          // https://github.com/RoccoC/webpack-build-notifier/issues/38
        },
      }),
      new CleanPlugin(),
      new BannerPlugin(Banner),
    ],
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'ts-loader',
            },
          ],
        },
      ],
    },
  }
}
