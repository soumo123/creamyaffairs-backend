const AWS = require('aws-sdk');
const dotenv = require('dotenv');
dotenv.config();


AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.region,
});

module.exports = AWS;