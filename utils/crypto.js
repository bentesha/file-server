const crypto = require('crypto')

exports.hashObject = function (object) {
  const hash = crypto.createHash('md5')
  hash.update(JSON.stringify(object || {}))
  return hash.digest().toString('hex')
}
