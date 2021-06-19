// @ts-check

const path = require('path')

/**
 * Webpack setup.
 *
 * @param {object} environment - environment
 * @param {object} argv - webpack arguments
 *
 * @type {import('webpack').Configuration}
 */
module.exports = (environment, argv) => {
  console.log('Env:', argv.mode)

  const isDevelopment = argv.mode === 'development' || false

  return {
    target: 'node',
    mode: 'none',
    entry: './src/extension.ts',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'extension.js',
      libraryTarget: 'commonjs2',
    },
    devtool: isDevelopment ? 'nosources-source-map' : 'hidden-source-map',
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
      minimize: !isDevelopment,
    },
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
