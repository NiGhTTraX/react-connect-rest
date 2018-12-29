const baseConfig = require('./webpack.config.js');

module.exports = Object.assign({}, baseConfig, {
  mode: 'development',
  devtool: 'cheap-module-eval-source-map',

  devServer: {
    host: '0.0.0.0',
    port: 3000,
    disableHostCheck: true,
    hot: true,
    stats: 'errors-only'
  }
});
