const Settings = require('../models/settings.model.js')
const Images = require('../models/images.model.js')
const Sale = require('../models/sale.model.js')
const Template = require('../models/template.model.js')
const uploadFileToS3 = require('../utils/fileUpload.js');
const AWS = require('aws-sdk');

const lambda = new AWS.Lambda();
const dotenv = require('dotenv');
const { checkAutorized, getNextSequentialId } = require('../utils/helper.js');
dotenv.config();


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


const setSale = async (req, res) => {

    let { adminId, shop_id } = req.query
    const body = req.body;
    let token = req.headers['x-access-token'] || req.headers.authorization;
    let query;

    try {

        if (!adminId || !shop_id || !body.temp_id) {
            return res.status(400).send({ success: false, message: "Missing credentials" })
        }

        let isCheck = await checkAutorized(token, adminId)
        if (!isCheck.success) {
            return res.status(400).send(isCheck);
        }

        if (body.products === true) {
            query = {
                active_sale: true,
                products: true,
            };
        } else {
            query = {
                active_sale: true,
                products: { $in: body.products },
            };
        }

        let gettemplates = await Sale.find(query)

        if (gettemplates.length === 0) {
            query = {
                active_sale: true,
                temp_id: body.temp_id,
            };
            gettemplates = await Sale.find(query);
        }
        if (gettemplates.length > 0){
            return res.status(400).send({ success: false, message: "Already Products are on Sale or same template you use, Select differenet products or category" });
        }
        const result = await Sale.create({
            shop_id: shop_id,
            adminId: adminId,
            caption: body.caption,
            category: body.category,
            start_date: body.start_date,
            end_date: body.end_date,
            discount: body.discount,
            active_sale: true,
            products: body.products,
            temp_id: body.temp_id
        })

        return res.status(201).send({ success: true, message: "Sale added" })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }

}


const getSaleItems = async (req, res) => {

    let { shop_id, adminId, limit, offset } = req.query;
    limit = parseInt(limit) || 10;
    offset = parseInt(offset) || 0;
    let token = req.headers['x-access-token'] || req.headers.authorization;

    try {
        if (!adminId || !shop_id) {
            return res.status(400).send({ success: false, message: "Missing credentials" })
        }

        let isCheck = await checkAutorized(token, adminId)
        if (!isCheck.success) {
            return res.status(400).send(isCheck);
        }

        let result = await Sale.aggregate([
            {
                $match: {
                    shop_id: shop_id,
                    adminId: adminId
                }
            },
            {
                $facet: {
                    totalCount: [
                        { $count: "count" }
                    ],
                    data: [
                        { $sort: { _id: -1 } },
                        { $skip: offset },
                        { $limit: limit },
                    ]
                }
            },
            {
                $project: {
                    totalCount: { $arrayElemAt: ["$totalCount.count", 0] },
                    data: 1
                }
            }
        ])
        let totalCount = result[0]?.totalCount

        result = result[0].data.map((ele) => ({
            caption: ele.caption,
            category: ele.category,
            start_date: ele.start_date,
            end_date: ele.end_date,
            products: ele.products,
            active_sale: ele.active_sale,
            temp_id:ele.temp_id
        }));
        return res.status(200).send({ message: "Get all sales data", totalData: totalCount, data: result })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
}


const createTemplate = async (req, res) => {

    const { adminId, shop_id } = req.query
    const file = req.file;
    let token = req.headers['x-access-token'] || req.headers.authorization;
    try {
        let isCheck = await checkAutorized(token, adminId)
        if (!isCheck.success) {
            return res.status(400).send(isCheck);
        }

        if (!file) {
            return res.status(400).send({ message: "Template missing", success: false });
        }
        if (!adminId || !shop_id) {
            return res.status(400).send({ message: "Misiing Credentials", success: false });

        }

        const templteId = await getNextSequentialId("TEMP")
        const fileBuffer = file.buffer;
        const key = "temlates/" + file.originalname;

        const bucketName = process.env.S3_BUCKT_NAME;

        const s3Url = await uploadFileToS3(bucketName, key, fileBuffer);

        const response = await Template.create({
            shop_id: shop_id,
            adminId: adminId,
            temp_id: templteId,
            template_url: s3Url
        })

        return res.status(201).send({ message: "Template Craeted", success: true })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }


}

const getTemplates = async (req, res) => {
    let { adminId, shop_id, limit, offset } = req.query
    limit = parseInt(limit) || 10
    offset = parseInt(offset) || 0
    let response = [];

    let token = req.headers['x-access-token'] || req.headers.authorization;
    try {
        let isCheck = await checkAutorized(token, adminId)
        if (!isCheck.success) {
            return res.status(400).send(isCheck);
        }
        if (!adminId || !shop_id) {
            return res.status(400).send({ message: "Misiing Credentials", success: false });
        }

        const result = await Template.aggregate([
            {
                $match: {
                    shop_id: shop_id,
                    // adminId: adminId
                }
            },
            {
                $facet: {
                    totalCount: [
                        { $count: "count" }
                    ],
                    data: [
                        { $sort: { _id: -1 } },
                        { $skip: offset },
                        { $limit: limit },
                    ]
                }
            },
            {
                $project: {
                    totalCount: { $arrayElemAt: ["$totalCount.count", 0] },
                    data: 1
                }
            }
        ])
        result[0].data.map((ele) => {
            response.push({
                temp_id: ele.temp_id,
                temp_url: ele.template_url,
                active: ele.active,
                date: ele.created_at
            })
        })
        let totalCount = result[0]?.totalCount
        return res.status(200).send({ success: true, message: "Get all templates", totalData: totalCount, data: response })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
}

const updateSale = async (req, res) => {
    let { adminId, shop_id, temp_id, active } = req.query
    let token = req.headers['x-access-token'] || req.headers.authorization;
    active = Number(active)
    try {
        let isCheck = await checkAutorized(token, adminId)
        if (!isCheck.success) {
            return res.status(400).send(isCheck);
        }
        if (!adminId || !shop_id) {
            return res.status(400).send({ message: "Misiing Credentials", success: false });
        }

        if(active===0){
            active=false
        }else{
            active=true
        }
        console.log("activee",active)
        const updateTemplate = await Sale.updateOne({ temp_id: temp_id }, { $set: { active_sale: active } })
        return res.status(200).send({ message: "Template updated", success: true })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
}

const updateTemplate = async (req, res) => {
    let { adminId, shop_id, temp_id, active } = req.query
    let token = req.headers['x-access-token'] || req.headers.authorization;
    active = Number(active)
    try {
        let isCheck = await checkAutorized(token, adminId)
        if (!isCheck.success) {
            return res.status(400).send(isCheck);
        }
        if (!adminId || !shop_id) {
            return res.status(400).send({ message: "Misiing Credentials", success: false });
        }
        console.log("activee",active)
        const updateTemplate = await Template.updateOne({ temp_id: temp_id }, { $set: { active: active } })
        return res.status(200).send({ message: "Template updated", success: true })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
}


const getTemplatesofShop = async (req, res) => {
    let { adminId, shop_id, limit, offset } = req.query
    limit = parseInt(limit) || 10
    offset = parseInt(offset) || 0
    let response = [];
    let tempIds = []
    let shopMap = new Map()
    // let token = req.headers['x-access-token'] || req.headers.authorization;
    try {
        // let isCheck = await checkAutorized(token, adminId)
        // if (!isCheck.success) {
        //     return res.status(400).send(isCheck);
        // }
        if (!shop_id) {
            return res.status(400).send({ message: "Misiing Credentials", success: false });
        }

        const shops = await Sale.find({shop_id:shop_id,active_sale:true})

        shops.forEach((ele) => {
            if (!shopMap.has(ele.temp_id)) {
                shopMap.set(ele.temp_id,{
                    caption:ele.caption,
                    discount:ele.discount,
                    category:ele.category,
                    start_date:ele.start_date,
                    end_date:ele.end_date
                });
            }
            tempIds.push(ele.temp_id);
        });
        const result = await Template.aggregate([
            {
                $match: {
                    shop_id: shop_id,
                    active:1,
                    temp_id:{$in:tempIds}
                    // adminId: adminId
                }
            },
            {
                $facet: {
                    totalCount: [
                        { $count: "count" }
                    ],
                    data: [
                        { $sort: { _id: -1 } },
                        { $skip: offset },
                        { $limit: limit },
                    ]
                }
            },
            {
                $project: {
                    totalCount: { $arrayElemAt: ["$totalCount.count", 0] },
                    data: 1
                }
            }
        ])
        result[0].data.map((ele) => {
            response.push({
                temp_id: ele.temp_id,
                temp_url: ele.template_url,
                active_sale:ele.active_sale,
                caption:shopMap.get(ele.temp_id).caption,
                start_date:shopMap.get(ele.temp_id).start_date,
                end_date:shopMap.get(ele.temp_id).end_date,
                category:shopMap.get(ele.temp_id).category,


            })
        })
        let totalCount = result[0]?.totalCount
        return res.status(200).send({ success: true, message: "Get all templates", totalData: totalCount, data: response })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
}

module.exports = { updateSettings, getAllSettingRule, adminImageUpload, setSale, getSaleItems, createTemplate, getTemplates, updateTemplate ,updateSale ,getTemplatesofShop}