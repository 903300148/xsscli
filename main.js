#!/usr/bin/env node
const { program } = require('commander')
const inquirer = require('inquirer');
const download = require('download-git-repo');
const ora = require('ora');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const { templateUrl, updatePackageJsonFile, runInstall } = require('./util/index');
const { promptList } = require('./util/index');


let targetPath = '';
let cliFilePath = path.join(__dirname);
function copyFolder(from, to) {
  let files = [];
  // 判断是否完成复制
  let t = false;
  if (fs.existsSync(to)) {           // 文件是否存在 如果不存在则创建
    files = fs.readdirSync(from);
    files.forEach(function (file, index) {
      var targetPath = from + "/" + file;
      var toPath = to + '/' + file;
      if (fs.statSync(targetPath).isDirectory()) { // 复制文件夹
        copyFolder(targetPath, toPath);
      } else {                                    // 拷贝文件
        fs.copyFileSync(targetPath, toPath);
      }
    });
  } else {
    fs.mkdirSync(to);
    copyFolder(from, to, cb);
  }
}



program
  .version('0.1.0')
  .command('init <name>')
  .description('初始化模板')
  .action((name) => {
    inquirer.prompt(promptList).then((paramater) => {
      let url = templateUrl(paramater.template);
      const dependentObj = {}
      paramater.dependent.forEach(el => {
        dependentObj[el] = true
      });
      paramater = Object.assign(dependentObj, paramater);
      targetPath = process.cwd() + '/' + name;
      const packagePath = path.join(targetPath, 'package.json');
      cliFilePath += url
      const spinner = ora(chalk.blueBright('等待下载模版中' + '\n'));
      spinner.start();
      // copyFolder(cliFilePath, targetPath)
      download('direct:https://github.com/oniya24/simple-create-react_template.git',
        targetPath, { clone: true }, // 目标路径
        (err) => { // 回调函数
          if (err) {
            spinner.fail('项目模版拉取失败');
            console.log(chalk.red(err));
            return;
          }
          spinner.succeed(chalk.greenBright('下载模版完成！！！'));
          console.log(
            chalk.greenBright("安装依赖") + '\n' +
            chalk.greenBright("cd " + name) + '\n' +
            chalk.greenBright("xscli install"));
          if (fs.existsSync(packagePath)) {
            updatePackageJsonFile(packagePath, packagePath, paramater);
          } else {
            spinner.fail();
            console.log(chalk.red('模版生成失败！！！'));
            return
          }
        })
    })
  })
program
  .command('install')
  .description('安装依赖')
  .action((name) => {
    runInstall(process.cwd(), () => {
      console.log(
        chalk.greenBright("npm run dev"));
    });
  })
if (fs.existsSync(process.cwd() + '/' + process.argv[3])) {
  console.log(chalk.red('项目目录已经存在，初始化失败'));
  return;
}
program.parse(process.argv) // 解析变量

