const Settings = require('../models/settings.model.js')
const Images = require('../models/images.model.js')
const uploadFileToS3 = require('../utils/fileUpload.js');
const AWS = require('aws-sdk');

const lambda = new AWS.Lambda();


const updateSettings = async (req, res) => {

    const body = req.body;
    const adminId = req.query.adminId;
    const type = Number(req.query.type);

    try {

        if (!body) {
            return res.status(400).send({ message: "Missing Body", success: false })
        }
        console.log("bodyddd", body)
        const result = await Settings.updateOne({ adminId: adminId, type: type }, { $set: body })

        return res.status(200).send({
            message: "Updates",
            success: true
        })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
}

const getAllSettingRule = async (req, res) => {

    const type = Number(req.query.type);
    const adminId = req.query.adminId;
    let result = undefined;
    try {
        if (!adminId) {
            result = await Settings.findOne({ type: type });

        } else {
            result = await Settings.findOne({ type: type, adminId: adminId });
        }

        
        if (result.length === 0) {
            return res.status(400).send({ message: "Not Found" })
        }
        return res.status(200).send({ message: "Setting Rules", data: result })


    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }

}


const adminImageUpload = async (req, res) => {


    try {
        const adminId = req.query.adminId;
        const type = Number(req.query.type);
        const file = req.file;
        const name = req.query.name;
        const height = req.query.height;
        const width = req.query.width;

        const fileBuffer = file.buffer;
        const bucketName = process.env.S3_BUCKT_NAME;
        const key = file.originalname;


        console.log("filefilefile", file)
        // const resizedImageBuffer = await invokeResizeLambda(fileBuffer, { width, height });
        // Upload the file to S3
        const s3Url = await uploadFileToS3(bucketName, key, fileBuffer);

        console.log("s3url", s3Url)

        const result = await Images.updateOne(
            { adminId: adminId, type: type },
            { $set: { [`staticImages.${name}`]: s3Url } } // Using dynamic key with template literal
        );

        return res.status(200).send({ message: "File updated", success: true });

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }


}

module.exports = { updateSettings, getAllSettingRule, adminImageUpload }