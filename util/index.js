const fs = require('fs');
const Handlebars = require('handlebars');
const chalk = require('chalk');
const spawn = require('child_process').spawn;

const templateUrl = (type) => {
  let url = '';
  switch (type) {
    case 'vue':
      url = '/src/template/vue';
      break;
    case 'react':
      url = '/src/template/react';
    default:
      break;
  }
  return url
}

const updatePackageJsonFile = (temp, target, paramater) => {
  const content = fs.readFileSync(temp).toString();
  const template = Handlebars.compile(content);
  const result = template(paramater);
  fs.writeFileSync(target, result);
}
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

let promptList = [{
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
}]
module.exports = {
  templateUrl,
  updatePackageJsonFile,
  promptList,
  runInstall
}