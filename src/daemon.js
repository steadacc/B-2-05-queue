const { compose, prop, path } = require('ramda')

const config = require('config')

const logger = require('pino')(config.log)
const daemon_logger = logger.child({ module: 'detect-image-daemon' })

module.exports = {
  parse_got_from_queue: (queue_result) => {
    const data = prop('data', queue_result)
    daemon_logger.info({ data, status: "parse-message" })
    
    if (!data) {
      return Promise.resolve(queue_result)
    }
    const parsed_message = compose(JSON.parse, path(['data', 'Message']))(queue_result)
    const subject = path(['data', 'MessageAttributes', 'subject', 'Value'], queue_result)
    const receipt_handle = prop('ReceiptHandle', queue_result)

    return Promise.resolve({
      receiptHandle: receipt_handle,
      Subject: subject,
      parsed_message
    })
  },
}

