const { detect_image, drop_object_s3 } = require('./aws')
const create = require('./tag')
const filter_label_over_50_perc = (labels) => labels.filter((label) => {
  if (label.Confidence > 50) {
    return true
  } else {
    return false
  }
})

const labels_under_50 = (labels) => labels.filter((label) => {
  if (label.Confidence <= 50) {
    return true
  } else {
    return false
  }
})

const sort_label = (labels) => {
  return labels.sort(function (a, b) {
    return a.Confidence - b.Confidence
  })
}
// OGGETTO S3 DA PASSARE A REKOGNITION
const detect_obj = (result_queue) => {
  const obj_s3 = { Bucket: result_queue.parsed_message.Bucket, Name: result_queue.parsed_message.key }
  return detect_image(obj_s3)
    .then((rekognition_res) => {
      console.log(rekognition_res)
      return Promise.all(labels_under_50(rekognition_res.Labels).map((label) => send_to_topic(obj_s3, 'delete_image')))
        .then(() => filter_label_over_50_perc(rekognition_res.Labels))
    })
    .then((labels) => {
      labels = sort_label(labels)
      console.log('#### REKOGNITIONN ####', labels)
      // creazione

      const create_tag = labels.map((label) => create({ file_name: obj_s3.Name, tags: { name: label.Name, perc: label.Confidence } }))
      return Promise.all(create_tag)
        .then(() => result_queue)
    })
}

module.exports = {
  detect_obj,
}
