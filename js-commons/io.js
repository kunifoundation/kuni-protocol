const fs = require('fs');

const { FOLDER_EXPORT } = require('./cf')


function toTokens(data, json) {
  let rs = "";
  if (json === 'json') {
    rs = "{\n"
    let isFirst = true
    for(const key in data) {
        if (isFirst) {
            rs += `\t"${key}": "${data[key]}"`
            isFirst = false
        } else {
            rs += `, "${key}": "${data[key]}"`
        }
    }
  } else {
    rs = 'module.exports = {\n'
    for(const key in data) {
      rs += `\t"${key}": '${data[key]}',\n`
    }
  }
  return `${rs}\n}`
}

module.exports.toTokens = toTokens

module.exports.writeToken = (data, fileName, convert, json) => {
  if (convert) {
    data = toTokens(data, json)
  }
  fs.writeFileSync(`${FOLDER_EXPORT}${fileName}`, data, { encoding: 'utf-8' })
}


module.exports.writeWithToken = (data, filename, inx = 0, extend) => {
  filename = filename.substring(filename.lastIndexOf('/')+1);
  filename = `${filename.split('.')[inx]}.${ extend || 'js' }`
  fs.writeFileSync(`${FOLDER_EXPORT}${filename}`, toTokens(data, extend), { encoding: 'utf-8' })
}