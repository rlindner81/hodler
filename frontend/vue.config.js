"use strict";

// https://cli.vuejs.org/config/
module.exports = {
  devServer: {
    contentBase: './public',
    proxy: {
      '/api': {
        target: 'http://0.0.0.0:4040',
        changeOrigin: true
      }
    }
  },
  pwa: {
    workboxOptions: {
      skipWaiting: true,
      clientsClaim: true
    }
  },
  // chainWebpack: config => {
  //   config.module.rule('eslint').use('eslint-loader').options({
  //     fix: true
  //   });
  // }
};
