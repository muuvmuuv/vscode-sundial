const { platform, userInfo } = require('os')
const { resolve } = require('path')
const { white, green, red } = require('kleur')
const { BannerPlugin } = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const pkg = require('./package.json')

const Banner = `${'┄'.repeat(46)}
${pkg.displayName} (${pkg.name})
${pkg.description}

@version ${pkg.version}
@license ${pkg.license}
@author ${pkg.author.name} (${pkg.author.url})
@readme ${pkg.homepage}
@pkg ${pkg.repository}
${'┄'.repeat(46)}`

module.exports = (_, argv) => {
  const platformName = platform()
  const developerName = userInfo().username
  const mode = argv.mode ? argv.mode : 'none'
  const isProd = mode === 'production'
  const isDev = mode === 'development'

  // Show general information
  console.log('whoIsMe:', white(developerName))
  console.log('whichOs:', white(platformName))
  console.log('devMode:', isDev ? green('true') : red('false'), '\n')

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
      new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: ['dist'],
      }),
      new BannerPlugin(Banner),
      new BundleAnalyzerPlugin({
        analyzerMode: argv.watch || isDev ? 'disabled' : 'server',
      }),
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
      performance: true,
      providedExports: true,
      reasons: true,
      timings: true,
    },
  }
}
