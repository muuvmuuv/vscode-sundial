import { platform, userInfo } from 'os'
import { resolve } from 'path'
import chalk from 'chalk'
import { Configuration, BannerPlugin } from 'webpack'
import * as TerserPlugin from 'terser-webpack-plugin'
import CleanPlugin from 'clean-webpack-plugin'
import * as BuildNotifier from 'webpack-build-notifier'
import * as PACKAGE from './package.json'

// @ts-ignore
const webpackConfig = (env: any, argv: Configuration): Configuration => {
  const platformName = platform()
  const developerName = userInfo().username
  const mode = argv.mode ? argv.mode : 'none'
  const isProd = mode === 'production'
  const isDev = mode === 'development'

  let banner = '' // dist/extension.js
  banner += `${PACKAGE.displayName} (${PACKAGE.name})\n`
  banner += `${PACKAGE.description}\n\n`
  banner += `@version ${PACKAGE.version}\n`
  banner += `@license ${PACKAGE.license}\n`
  banner += `@author ${PACKAGE.author.name} (${PACKAGE.author.url})\n`
  banner += `@readme ${PACKAGE.homepage}\n`
  banner += `@package ${PACKAGE.repository}`

  // Log some general information
  console.log('wbpMode:', chalk.whiteBright(mode))
  console.log('whoIsMe:', chalk.whiteBright(developerName))
  console.log('whichOs:', chalk.whiteBright(platformName))
  console.log(
    'devMode:',
    isDev ? chalk.green('true') : chalk.red('false'),
    '\n'
  )

  return {
    target: 'node',
    entry: './src/extension.ts',
    output: {
      path: resolve(__dirname, 'dist'),
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
        logo: resolve(__dirname, 'assets/icon.jpg'),
      }),
      new CleanPlugin(),
      new BannerPlugin(banner),
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
    stats: {
      assets: true,
      builtAt: true,
      cached: false,
      cachedAssets: false,
      children: false,
      reasons: false,
      chunks: false,
      colors: true,
      errors: true,
      maxModules: 10,
      hash: true,
      moduleTrace: true,
      performance: true,
      timings: true,
      version: false,
      warnings: true,
    },
  }
}

export default webpackConfig
