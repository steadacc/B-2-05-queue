const { isNil, prop, path, lens, compose, over, assoc, pick } = require('ramda')

const AWS = require('aws-sdk')
const config = require('config')

const sqs = new AWS.SQS({
  apiVersion: '2012-11-05',
  region: config.sqs.region
})

const rekognition = new AWS.Rekognition({apiVersion: '2016-06-27', region: config.rekognition.region})

const s3 = new AWS.S3({ signatureVersion: 'v4', region: config.s3.region })

module.exports = {
  get_message_from_queue: () => {
    return sqs.receiveMessage({
      QueueUrl: config.sqs.queue_url,
      MaxNumberOfMessages: 1,
      VisibilityTimeout: 300,
      WaitTimeSeconds: 20,
    })
    .promise()
    .then(message => {
      const xLens = lens(path(['Messages', 0 , 'Body']), assoc('data'))
      const assoc_receipt_handle = (msg) => {
        return assoc('ReceiptHandle', path(['Messages', 0 , 'ReceiptHandle'], msg), msg)
      }
      const pick_fields = pick(['data', 'ReceiptHandle'])
      return compose(pick_fields, assoc_receipt_handle, over(xLens, JSON.parse))(message)
      
    })
  },
  drop_message: (resolvedCreation) => {
    const receipt_handle = prop('receiptHandle', resolvedCreation)
    if(isNil(receipt_handle)){
      return Promise.resolve();
    }
    return sqs.deleteMessage({
      QueueUrl: config.sqs.queue_url,
      ReceiptHandle: resolvedCreation.receiptHandle,
    }).promise()
  },
  drop_object_s3: (bucket, key) => {
    var params = {
      Bucket: bucket,
      Key: key,
    }

    return s3.deleteObject(params).promise()
  },
  detect_image: (obj_s3, confidence) => {
    let params = {
      Image: {
        S3Object: obj_s3
      },
      MinConfidence: confidence
    }
    return rekognition.detectLabels(params).promise()
  },
  send_to_topic: (subject, payload) => {
    return sns
      .publish({
        Subject: subject,
        Message: JSON.stringify(payload),
        TopicArn: config.sns.topic_arn,
        MessageAttributes: {
          subject: {
            DataType: 'String',
            StringValue: config.sns.filter_subject,
          },
        },
      })
      .promise()
      .then((r) => {
        console.log('SEND TO TOPIC', r)
        return r
      })
      .then(response => Promise.resolve({ payload, response }))
      .catch(err => {
        console.log('SEND TO TOPIC', err)
        // aws_logger.info({ err: err, status: 'ERROR' }, 'Error in send_to_topic')
        return Promise.resolve({ payload, err })
      })
  }
}
