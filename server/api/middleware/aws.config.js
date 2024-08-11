const AWS = require('aws-sdk');
const dotenv = require('dotenv');
dotenv.config();


AWS.config.update({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_KEY,
    region: process.env.region,
});

module.exports = AWS;