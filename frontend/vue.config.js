"use strict";

// https://cli.vuejs.org/config/
module.exports = {
  pages: {
    index: {
      entry: 'src/main.js',
      title: 'Hodler',
    },
  },
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
    name: "Hodler",
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
