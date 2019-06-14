import { platform, userInfo } from 'os'
import { resolve } from 'path'
import chalk from 'chalk'
import { Configuration, BannerPlugin } from 'webpack'
import TerserPlugin from 'terser-webpack-plugin'
import CleanPlugin from 'clean-webpack-plugin'
import WebpackBuildNotifierPlugin from 'webpack-build-notifier'
import pkg from './package.json'

/**
 * Known console warnings:
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
${pkg.displayName} (${pkg.name})
${pkg.description}

@version ${pkg.version}
@license ${pkg.license}
@author ${pkg.author.name} (${pkg.author.url})
@readme ${pkg.homepage}
@pkg ${pkg.repository}
${'┄'.repeat(46)}`

export default (_, argv: Configuration): Configuration => {
  const platformName = platform()
  const developerName = userInfo().username
  const mode = argv.mode ? argv.mode : 'none'
  const isProd = mode === 'production'
  const isDev = mode === 'development'

  // Show general information
  console.log('whoIsMe:', chalk.whiteBright(developerName))
  console.log('whichOs:', chalk.whiteBright(platformName))
  console.log('devMode:', isDev ? chalk.green('true') : chalk.red('false'), '\n')

  return {
    target: 'node',
    entry: resolve(__dirname, 'src', 'extension.ts'),
    output: {
      path: resolve(__dirname, 'dist'),
      filename: 'extension.js',
      libraryTarget: 'commonjs2',
      devtoolModuleFilenameTemplate: '../[resource-path]',
    },
    devtool: isDev ? 'cheap-module-source-map' : 'source-map',
    externals: {
      // the vscode-module is created on-the-fly and must be excluded.
      // See: https://webpack.js.org/configuration/externals/
      vscode: 'commonjs vscode',
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
      new WebpackBuildNotifierPlugin({
        title: 'Sundial',
        logo: resolve(__dirname, 'assets', 'icon.jpg'),
      }),
      // new CleanPlugin({
      //   cleanOnceBeforeBuildPatterns: ['dist'],
      // }),
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
