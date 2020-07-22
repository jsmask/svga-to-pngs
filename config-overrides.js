const { override, fixBabelImports, addLessLoader,addWebpackAlias,addDecoratorsLegacy } = require('customize-cra');
const path = require("path");
function resolve(dir) {
  return path.join(__dirname, '.', dir);
}

const setPublicPath = () => config => {
  config.output.publicPath=process.env.NODE_ENV === 'production' ? '/svgatopngs/' : '/';
  return config;
};


module.exports = override(
  setPublicPath(),
);