const awsConfig = require('../middleware/aws.config.js');
const s3 = new awsConfig.S3();
const uploadFileToS3 = (bucketName, key, body)=>{

    const params = {
      Bucket: bucketName,
      Key: key,
      Body: body,
    };

    return new Promise((resolve, reject) => {
      s3.upload(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data.Location);
        }
      });
    });
  }
  module.exports = uploadFileToS3