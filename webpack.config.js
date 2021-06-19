// @ts-check

const path = require('path')
const { BannerPlugin } = require('webpack')

const package_ = require('./package.json')

const banner = `${'-'.repeat(20)}
${package_.displayName} (${package_.name})
${package_.description}

@version ${package_.version}
@license ${package_.license}
@author ${package_.author.name} (${package_.author.url})
@readme ${package_.homepage}
@pkg ${package_.repository}
${'-'.repeat(20)}`

/** @type {import('webpack').Configuration} */
const config = {
  target: 'node',
  mode: 'none',
  entry: './src/extension.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2',
  },
  devtool: 'nosources-source-map',
  externals: {
    // the vscode-module is created on-the-fly and must be excluded.
    // See: https://webpack.js.org/configuration/externals/
    vscode: 'commonjs vscode',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  optimization: {
    concatenateModules: true,
    mangleExports: false,
    minimize: process.env.NODE_ENV === 'production',
  },
  plugins: [new BannerPlugin(banner)],
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

module.exports = config
