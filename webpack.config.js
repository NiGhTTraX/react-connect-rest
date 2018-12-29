const path = require('path');
const { HotModuleReplacementPlugin, NoEmitOnErrorsPlugin, EnvironmentPlugin } = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.tsx',

  output: {
    filename: 'app.js',
    path: path.join(__dirname, 'app')
  },

  mode: 'production',
  devtool: 'sourcemap',

  module: {
    rules: [{
      test: /\.tsx?$/,
      exclude: /node_modules/,
      use: 'babel-loader'
    }, {
      test: /\.less$/,
      exclude: /node_modules/,
      use: ['style-loader', 'css-loader', 'less-loader']
    }, {
      test: /\.css$/,
      use: ['style-loader', 'css-loader']
    }]
  },

  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  },

  plugins: [
    new HotModuleReplacementPlugin(),
    new NoEmitOnErrorsPlugin(),
    new EnvironmentPlugin({
      BACKEND_HOST: '//localhost:4000'
    }),
    new HtmlWebpackPlugin({
      template: './index.html'
    })
  ]
};
