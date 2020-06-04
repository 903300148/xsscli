const buildModule = require('./webpack.base');
let finalModule = {};
let ENV = process.env.NODE_ENV;     //此处变量可由命令行传入
switch (ENV) {
  case 'build':
    finalModule = devModule;
    break;
  default:
    break;
}
console.log(finalModule);

module.exports = finalModule;
