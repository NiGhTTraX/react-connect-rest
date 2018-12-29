const config = require('../.babelrc');

if (process.env.COVERAGE) {
  config.plugins.push('istanbul');
}

if (process.env.NODE_ENV !== 'production') {
  config.plugins.push('react-hot-loader/babel');
}

module.exports = config;
