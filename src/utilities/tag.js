/* eslint-disable prefer-promise-reject-errors */
const request = require('request')
const config = require('config')

module.exports = (body) => new Promise((resolve, reject) => {
    console.log('BODY', body)
  request({
    uri: config.endpoints.tag,
    method: 'POST',
    json: true,
    body: body
  }, (err, response) => {
    if (err || response.statusCode >= 400) {
      return reject({ message: response.body, status: response.statusCode })
    }

    return resolve(response.body)
  })
})
