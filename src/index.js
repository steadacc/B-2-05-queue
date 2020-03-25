const config = require('config')
const logger = require('pino')(config.log)
const { tap } = require('ramda')
const daemon = require('./daemon')
const { get_message_from_queue, drop_message } = require('./utilities/aws')
const daemon_logger = logger.child({ module: 'skel-daemon' })
const { detect_obj } = require('./utilities')
const get_from_queue = () => {
  return get_message_from_queue()
    .then(daemon.parse_got_from_queue)//RITORNA UN OGGETTO CON CHIAVI (receiptHandle, Subject, parsed_message)
    // .then(tap(console.log))
    .then(detect_obj) // CONTROLLA SE L'IMMAGINE NON CONTIENE CONTENUTI INAPPROPIATI NEL CASO ELIMINA L'IMMAGINE DA S3
    .then(drop_message)
    .catch(err => {
      daemon_logger.error({ err })
    })
    .finally(() => {
      setImmediate(get_from_queue)
    })
}

get_from_queue()
// {"level":30,"time":1585068090859,"env":"dev","name":"app","module":"detect-image-daemon",
// "data":{"ETag":"\"62e63657cdd1bfbf2cca37d491a4db9a\"","Location":"https://test201908.s3.amazonaws.com/Schermata%20da%202019-11-09%2009-58-03.png",
// "key":"Schermata da 2019-11-09 09-58-03.png","Key":"Schermata da 2019-11-09 09-58-03.png","Bucket":"test201908",
// "url":"https://test201908.s3.eu-central-1.amazonaws.com/Schermata%20da%202019-11-09%2009-58-03.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIAWV2KW4PW4EEA5LGL%2F20200324%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20200324T164130Z&X-Amz-Expires=900&X-Amz-Security-Token=FwoGZXIvYXdzEHoaDAw8LrGIAhmY8cI08yKdAiQE%2F86sQ2PGznmF6W6fnMl4Jk1%2BJ5Er9fXXNN1jxf9nvsjD7BHVAEsTrDKgh0UzwsKI0DHCuZPV9dN2MPTArlvJKilqFrpRbE3x%2BWVMAKczPjkhfVpJcVfllnG1DoGEvC86QHRQCSUYnjfSWBdkhLDVMMzHcYxRaE71F28cm3YoxGhNSicRL7zKQYGFsKgahf0Na3kNomhHnLadae1Xibdg%2FejJefnyA3n2JNS2FvM5%2BapNeCUqzF%2FpBl0MTpYda2Ldlmva3RdgoTsgekfc1hZgg%2FVCHYAUkWmOXUwzohFSh84s3plcDPit%2FnG4l15a7cg9H37sL0M%2B%2FWhpSyhsbjfbUaIjxI45dSHhstPLCrCJZtVQU7ZIHTE7DvsfMyjE7ujzBTIqpATqx6IqIscRnvyYsNxeMxVemB%2FahFrNQDSqpUgf7XTU6vBDlSS1MUV0&X-Amz-Signature=d0d8f7c6b079dd15ef272a1dd1b0609d3d7188f5d845f1f2ea42dbf5acd18636&X-Amz-SignedHeaders=host","name":"Schermata da 2019-11-09 09-58-03.png","acl":"private","mimetype":"image/png"},
// "status":"parse-message","v":1}
