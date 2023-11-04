const fs = require('fs');

const { FOLDER_EXPORT } = require('./cf')


function toTokens(data) {
  let rs = 'module.exports = {\n'
  for(const key in data) {
    rs += `\t${key}: '${data[key]}',\n`
  }
  return `${rs}\n}`
}

module.exports.toTokens = toTokens


module.exports.writeToken = (data, fileName, convert) => {
  if (convert) {
    data = toTokens(data)
  }
  fs.writeFileSync(`${FOLDER_EXPORT}${fileName}`, data, { encoding: 'utf-8' })
}


module.exports.writeWithToken = (data, filename, inx = 0) => {
  filename = filename.substring(filename.lastIndexOf('/')+1);
  filename = `${filename.split('.')[inx]}.js`
  fs.writeFileSync(`${FOLDER_EXPORT}${filename}`, toTokens(data), { encoding: 'utf-8' })
}