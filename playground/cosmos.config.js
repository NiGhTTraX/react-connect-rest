module.exports = {
  rootPath: '../',

  fileMatch: ['**/fixtures/**/*.{ts,tsx}'],

  watchDirs: ['src', 'playground'],
  exclude: [/\.d\.ts$/],

  globalImports: [
    'playground/styles.less',
    'reset.css' // imported in index.tsx
  ],
  proxiesPath: 'playground/cosmos.proxies.js',
  webpackConfigPath: 'webpack.config.dev.js',

  hostname: '0.0.0.0',
  port: 8989
};
