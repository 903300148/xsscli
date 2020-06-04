const fs = require('fs');
const Handlebars = require('handlebars');

const templateUrl = (type) => {
  let url = '';
  switch (type) {
    case 'vue':
      url = 'vue 仓库地址';
      break;
    case 'react':
      url = 'direct:https://github.com/oniya24/simple-create-react_template.git';
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
module.exports = {
  templateUrl,
  updatePackageJsonFile
}