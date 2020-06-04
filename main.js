#!/usr/bin/env node
const { program } = require('commander')
const inquirer = require('inquirer');
const download = require('download-git-repo');
const ora = require('ora');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const { templateUrl, updatePackageJsonFile } = require('./utils/util');
const spawn = require('child_process').spawn;

let runInstall = async function (cwd, callback, executable = 'npm', args = ['install']) {
    console.log(chalk.greenBright("正在安装项目依赖……\n"));
    // 执行executable args 对应到默认参数即 npm install 安装依赖
    await new Promise((resolve, reject) => {
        const installProcess =
            spawn(executable, args, { cwd: cwd, stdio: "inherit", shell: true });
        //文件目录， 继承父进程的输入输出【即控制台可以看到子进程输出】，开启shell 
        installProcess.on('exit', () => {
            console.log(chalk.greenBright("依赖安装完成!"));
            resolve();
        });
        installProcess.on('error', (err) => {
            console.log(chalk.red("依赖安装失败"));
            reject(err);
        })
    }).then(() => { callback(); })
        .catch((err) => { console.log(chalk.red("出现错误")); console.log(err) });
}

program
    .version('0.1.0')
    .command('init <name>')
    .description('初始化模板')
    .action((name) => {
        inquirer.prompt([{
            type: 'list',
            message: '请选中一种模版',
            name: 'template',
            choices: [
                "Vue",
                "React",
            ],
            prefix: "",
            filter: function (val) { // 使用filter将回答变为小写
                return val.toLowerCase();
            }
        }, {
            type: "checkbox",
            message: "选择要安装的依赖:",
            name: "dependent",
            choices: [
                "Axios",
                "Vuex",
                "VueRouter",
            ],
            suffix: "",
            when: function (answer) {
                if (answer.template === 'vue') {
                    return true;
                }
                return false
            }
        }, {
            type: "checkbox",
            message: "选择要安装的依赖:",
            name: "dependent",
            choices: [
                "Axios",
                "ReactRouterDom",
                "Redux",
                "Redux",
                "ReactRedux"
            ],
            suffix: "",
            when: function (answer) {
                if (answer.template === 'react') {
                    return true;
                }
                return false
            }
        }]).then((paramater) => {
            let url = templateUrl(paramater.template);
            const dependentObj = {}
            paramater.dependent.forEach(el => {
                dependentObj[el] = true
            });
            paramater = Object.assign(dependentObj, paramater);
            const targetPath = process.cwd() + '/' + name;
            const packagePath = path.join(targetPath, 'package.json');
            const spinner = ora(chalk.blueBright('等待下载模版中' + '\n'));
            spinner.start();
            download('direct:https://github.com/oniya24/simple-create-react_template.git',
                targetPath, { clone: true }, // 目标路径
                (err) => { // 回调函数
                    if (err) {
                        spinner.fail('项目模版拉取失败');
                        console.log(chalk.red(err));
                        return;
                    }
                    spinner.succeed(chalk.greenBright('下载模版完成！！！'));
                    if (fs.existsSync(packagePath)) {
                        updatePackageJsonFile(packagePath, packagePath, paramater);
                    } else {
                        spinner.fail();
                        console.log(chalk.red('模版生成失败！！！'));
                        return
                    }
                    runInstall(targetPath, () => {
                        console.log(
                            chalk.greenBright("开启项目") + '\n' +
                            chalk.greenBright("cd " + name) + '\n' +
                            chalk.greenBright("npm run dev"));
                    });

                })

        })
    })

if (fs.existsSync(process.cwd() + '/' + process.argv[3])) {
    console.log(chalk.red('项目目录已经存在，初始化失败'));
    return;
}
program.parse(process.argv) // 解析变量

