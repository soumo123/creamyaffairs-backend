const Vendor = require('../models/vendor.model.js');
const Agent = require("../models/agent.model.js");
const Product = require("../models/product.model.js")
const Distribute = require('../models/distribute-order.model.js')
const Expire = require('../models/expiredproducts.model.js')
const RequestOrder = require('../models/requestorder.model.js')
const Notification = require('../models/notification.model.js')

const uploadFileToS3 = require('../utils/fileUpload.js');
const { getNextSequentialId, generateAndUploadBarcode } = require('../utils/helper.js');
const dotenv = require('dotenv');
dotenv.config();




const addVendor = async (req, res) => {
    try {
        let { name, email, phone } = req.body;
        const shop_id = req.query.shop_id;
        const file = req.file;

        if (!name || !email || !phone) {
            return res.status(400).send({
                message: 'Field is missing'
            });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'Invalid request' });
        }

        const emailData = await Vendor.find({ email: email });
        if (emailData.length > 0) {
            return res.status(400).send({
                message: 'Email already present'
            });
        }

        // Access the buffer property of req.file
        const fileBuffer = file.buffer;
        const bucketName = process.env.S3_BUCKT_NAME;
        const key = file.originalname;

        // Upload the file to S3
        const s3Url = await uploadFileToS3(bucketName, key, fileBuffer);
        const lastId = await getNextSequentialId("VEN")

        const vendor = await Vendor.create({
            vendorId: lastId, name, email, phone, image: s3Url, role: "2", shopId: shop_id
        })

        return res.status(201).send({ message: "Vendor Added", success: true })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }

}


const updateVendor = async(req,res)=>{

    const {vendorId,shopId} = req.query;
    const body  = req.body;
    const file = req.file;
    let json = undefined

    try {

        if(!vendorId && !body){
            return res.status(400).send({message:"Missing credentials",success:false})
        }


        if(file){
            const fileBuffer = file.buffer;
            const bucketName = process.env.S3_BUCKT_NAME;
            const key = file.originalname;
            const s3Url = await uploadFileToS3(bucketName, key, fileBuffer);

            json = {
                vendorId:vendorId,
                shopId:shopId,
                name:body.name,
                email:body.email,
                phone:body.phone,
                image:s3Url,
                role:"2",
            }
        }
        


    } catch (error) {
         console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }

}

const addAgent = async (req, res) => {
    try {
        let { name, email, phone, address } = req.body;
        const { shop_id, vendor_id } = req.query;
        const file = req.file;

        if (!name || !email || !phone || !address) {
            return res.status(400).send({
                message: 'Field is missing'
            });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'Invalid request' });
        }

        const emailData = await Agent.find({ email: email });
        if (emailData.length > 0) {
            return res.status(400).send({
                message: 'Email already present'
            });
        }

        // Access the buffer property of req.file
        const fileBuffer = file.buffer;
        const bucketName = process.env.S3_BUCKT_NAME;
        const key = file.originalname;

        // Upload the file to S3
        const s3Url = await uploadFileToS3(bucketName, key, fileBuffer);
        const lastId = await getNextSequentialId("AGENT")

        const agent = await Agent.create({
            agentId: lastId, name, email, phone, address, image: s3Url, shopId: shop_id, vendorId: vendor_id
        })
        
        const result = await Expire.create({agentId:lastId,agentname:name,shopid:shop_id})

        return res.status(201).send({ message: "Agent Added", success: true })
    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }


}


const getAllVendors = async (req, res) => {

    try {
        const shop_id = req.query.shop_id;
        const key = req.query.search;
        let queryFilter = undefined;

        if (!shop_id) {
            return res.status(400).send({ status: false, message: "Missing shop id" })
        }
        if (key) {
            queryFilter = { shopId: shop_id, name: { $regex: key, $options: 'i' } }
        } else {
            queryFilter = { shopId: shop_id }
        }
        console.log("queryFilter", queryFilter)
        let vendors = await Vendor.find(queryFilter).sort({ _id: -1 })

        vendors = vendors.map((ele) => {
            return {
                vendorId: ele.vendorId,
                vendor_name: ele.name,
                vendor_phone: ele.phone,
                vendor_image: ele.image
            }
        })


        if (vendors.length === 0) {
            return res.status(400).send({ message: "No Vendors Fouond", success: false, data: [] })
        }

        return res.status(200).send({ message: "Get All Vendors", success: true, data: vendors })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }

}

const getallAgents = async (req, res) => {

    try {
        const { shop_id, key } = req.query;
        let queryFilter = undefined;

        if (!shop_id) {
            return res.status(400).send({ status: false, message: "Missing shop id" })
        }
        if (key) {
            queryFilter = { shopId: shop_id, name: { $regex: key, $options: 'i' } }
        } else {
            queryFilter = { shopId: shop_id }
        }

        let agents = await Agent.find(queryFilter).sort({ _id: -1 })
        agents = agents.map((ele) => {
            return {
                vendorId: ele.vendorId,
                agentId: ele.agentId,
                agent_name: ele.name,
                agent_phone: ele.phone,
                agent_image: ele.image
            }
        })


        if (agents.length === 0) {
            return res.status(400).send({ message: "No Agents Fouond", success: false, data: [] })
        }

        return res.status(200).send({ message: "Get All Agents", success: true, data: agents })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
}


const addInventory = async (req, res) => {

    try {
        const { adminId, vendorId, agentId, shop_id, type } = req.query
        const body = req.body;
        console.log("body", body)
        let totalPrice = 0
        let resultArray = [];
        let json = undefined;
        if (!body) {
            return res.status(400).send({ message: "Misiing fields", success: false })
        }

        const distributerName = await Agent.findOne({ agentId: agentId })
        let transctionId = await getNextSequentialId("TRANS")

        for (let ele of body) {
            let lastId = await getNextSequentialId("PD")

            const barcodeUrl = await generateAndUploadBarcode(lastId);
            console.log("barcodeUrl",barcodeUrl)
            json = {
                productId: lastId,
                shop_id: Number(shop_id),
                type: Number(type),
                agentId:agentId,
                name: ele.productName,
                description: "",
                other_description1: "",
                other_description2: "",
                weight: ele.weights,
                unit: ele.unit,
                // price: 0,
                purchase_price: "",
                delivery_partner: distributerName.name,
                selling_price_method: "",
                zomato_service: false,
                swiggy_service: false,
                zepto_service: false,
                blinkit_service: false,
                zomato_service_price: 0,
                swiggy_service_price: 0,
                zepto_service_price: 0,
                blinkit_service_price: 0,
                product_type: 2,
                tags: [],
                isBestSelling: false,
                isFeatured: false,
                isOffered: false,
                isTopSelling: false,
                isBranded: false,
                barcodeUrl:barcodeUrl,
                // discount: 0,
                // actualpricebydiscount: 0,
                ratings: 0,
                // stock: 0,
                color: "",
                searchstring: "",
                size: [],
                adminId: adminId,
                visiblefor: 0,
                thumbnailimage: "",
                otherimages: [],
                deliverydays: 0,
                likes: 0,
                numOfReviews: 0,
                whishListIds: [],
                reviews: [],
                active: 0,
                manufacture_date:ele.manufacture_date,
                expiry_date:ele.expiry_date
            }

            await Product.create(json)

            ele.weights.forEach((uu) => {
                console.log("uu",uu)
                totalPrice += uu.purchaseprice * uu.stock
                resultArray.push({
                    productId: lastId,
                    quantity: Number(uu.stock),
                    weight: uu.weight,
                    price: Number(uu.purchaseprice)
                })
            })
        }

        json = {
            transaction_id: transctionId,
            distributorId: agentId,
            vendorId: vendorId,
            distributorName: distributerName.name,
            shopOwnerId: shop_id,
            products: resultArray,
            totalAmount: totalPrice,
            pay: 0,
            balance: Number(totalPrice)
        }
        await Distribute.create(json)

        console.log("resultArray,resultArray", resultArray, totalPrice)
        return res.status(201).send({ message: "Order added", success: true })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });

    }

}


const getTransctions = async (req, res) => {
    try {
        const { shop_id, agentId } = req.query;
        if (!shop_id || !agentId) {
            return res.status(400).send({ message: "Missing fields", success: false });
        }

        // Fetch all transactions with only the required fields, sorted by order_date
        const transactions = await Distribute.find({ shopOwnerId: shop_id, distributorId: agentId})
            .select('_id transaction_id distributorId vendorId distributorName paid totalAmount pay balance order_date')
            .sort({ order_date: -1 });

        let totalUenpaidTransaction = transactions && transactions.filter((ele)=>{
            return ele.paid===false
        })
        let totalPaidTransaction = transactions && transactions.filter((ele)=>{
            return ele.paid===true
        })


        if (transactions.length === 0) {
            return res.status(404).send({ message: "No transactions found", success: false });
        }
        const [lastTransaction, ...remainingTransactions] = transactions;
        return res.status(200).send({
            message: "Get Transaction Details",
            data: {
                lastTransaction: lastTransaction || null,
                remainingTransactions: remainingTransactions,
                totalUenpaidTransaction:totalUenpaidTransaction.length,
                totalPaidTransaction:totalPaidTransaction.length
            }
        });

    } catch (error) {
        console.error(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
};



const updateMoney = async (req, res) => {

    try {
        const { shop_id, agentId, transaction_id, pay } = req.query;
        if (!shop_id || !agentId || !transaction_id) {
            return res.status(400).send({ message: "Missing fields", success: false });
        }
        let paid = false;

        const isValid = await Distribute.findOne({ shopOwnerId: shop_id, transaction_id: transaction_id, distributorId: agentId })

        let totalAmount = isValid.totalAmount;
        let currentPay = isValid.pay +  Number(pay)
        let balance = Number(totalAmount) - Number(currentPay)
        if(totalAmount===currentPay){
            paid = true
        }

        if (!isValid) {
            return res.status(400).send({ message: "Credentials Wrong" })
        }

        await Distribute.updateOne({ shopOwnerId: shop_id, transaction_id: transaction_id, distributorId: agentId }, {
            $set: {
                pay: Number(currentPay),
                balance:Number(balance),
                paid:paid
            },
            $push: {
                paymentInfo: {
                    pay: Number(pay),
                    date: new Date().toISOString() 
                }
            }
        })

        return res.status(201).send({message:"Transction Updated", succes:true})

    } catch (error) {
        console.error(error.stack);
        return res.status(500).send({ message: "Internal Server Error", success:false,error: error.stack });
    }
}


const updateStock = async (req, res) => {

    const { shop_id, type, agentId, adminId } = req.query;
    const { savedProducts, addedProducts } = req.body;
    let totalPrice = 0
    let resultArray = [];
    let addedArray = [];
    let json = undefined;



    try {
        if (!savedProducts) {
            return res.status(400).send({ message: "Misiing fields", success: false })
        }

        const distributerName = await Agent.findOne({ agentId: agentId })
        let transctionId = await getNextSequentialId("TRANS")

        if (addedProducts.length > 0) {
            for (let ele of addedProducts) {
                let lastId = await getNextSequentialId("PD")
                const barcodeUrl = await generateAndUploadBarcode(lastId);
                json = {
                    productId: lastId,
                    shop_id: Number(shop_id),
                    type: Number(type),
                    name: ele.productName,
                    description: "",
                    other_description1: "",
                    other_description2: "",
                    weight: ele.weights,
                    unit: ele.unit,
                    price: 0,
                    purchase_price: "",
                    delivery_partner: distributerName.name,
                    selling_price_method: "",
                    zomato_service: false,
                    swiggy_service: false,
                    zepto_service: false,
                    blinkit_service: false,
                    zomato_service_price: 0,
                    swiggy_service_price: 0,
                    zepto_service_price: 0,
                    blinkit_service_price: 0,
                    product_type: 2,
                    tags: [],
                    isBestSelling: false,
                    isFeatured: false,
                    isOffered: false,
                    isTopSelling: false,
                    isBranded: false,
                    discount: 0,
                    actualpricebydiscount: 0,
                    ratings: 0,
                    stock: 0,
                    color: "",
                    searchstring: "",
                    size: [],
                    adminId: adminId,
                    visiblefor: 0,
                    thumbnailimage: "",
                    otherimages: [],
                    deliverydays: 0,
                    likes: 0,
                    numOfReviews: 0,
                    whishListIds: [],
                    reviews: [],
                    active: 0,
                    barcodeUrl:barcodeUrl,
                    manufacture_date:ele.manufacture_date,
                    expiry_date:ele.expiry_date
                }
                await Product.create(json)
                ele.weights.forEach((uu) => {
                    totalPrice += uu.purchaseprice * uu.stock
                    addedArray.push({
                        productId: lastId,
                        quantity: Number(uu.stock),
                        weight: uu.weight,
                        price: Number(uu.purchaseprice)
                    })
                })
            }

        }


        for (let ele of savedProducts) {
            let lastId = ele.productId;

            const update = await Product.updateOne({ productId: ele.productId, type: Number(type), adminId: adminId }, { $set: { weight: ele.weights ,manufacture_date:ele.manufacture_date,expiry_date:ele.expiry_date,expired:false} })

            const expiryres = await Expire.updateOne(
                { 
                    shop_id: shop_id, 
                    "productId": ele.productId
                },
                { 
                    $pull: { 
                        productId: ele.productId
                    }
                }
            
            )

            ele.weights.forEach((uu) => {
                totalPrice += uu.purchaseprice * uu.stock
                resultArray.push({
                    productId: lastId,
                    quantity: Number(uu.stock),
                    weight: uu.weight,
                    price: Number(uu.purchaseprice)
                })
            })

        }

        let concatinateArray = resultArray.concat(addedArray)

        json = {
            transaction_id: transctionId,
            distributorId: agentId,
            vendorId: "",
            distributorName: distributerName.name,
            shopOwnerId: shop_id,
            products: concatinateArray,
            totalAmount: Number(totalPrice),
            pay: 0,
            balance: Number(totalPrice)

        }
        await Distribute.create(json)



        return res.status(201).send({ message: "added", success: true })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
}


const viewTransaction = async (req, res) => {
    const { transaction_id, agentId, shop_id } = req.query;

    try {
        if (!shop_id || !agentId || !transaction_id) {
            return res.status(400).send({ message: "Missing fields", success: false });
        }

        // Find the transaction
        const result = await Distribute.findOne({
            transaction_id: transaction_id,
            distributorId: agentId,
            shopOwnerId: shop_id
        });

        if (!result) {
            return res.status(400).send({ message: "Credentials Wrong" });
        }

        // Fetch product details
        const productIds = [...new Set(result.products.map(p => p.productId))];
        const products = await Product.find({ productId: { $in: productIds } });

        // Create a map of productId to productName
        const productMap = products.reduce((acc, product) => {
            acc[product.productId] = product.name;
            acc["unit"] = product.unit;
            acc["thumbnailimage"] = product.thumbnailimage
            return acc;
        }, {});
        // Group products by productId and aggregate by weight
        const productsGroupedByProductId = result.products.reduce((acc, product) => {
            const existingProduct = acc.find(p => p.productId === product.productId);
            if (existingProduct) {
                existingProduct.weight.push({
                    quantity: Number(product.quantity),
                    weight: product.weight,
                    price: Number(product.price)
                });
            } else {
               
                acc.push({
                    productId: product.productId,
                    thumbImage:productMap.thumbnailimage || "",
                    unit: productMap.unit,
                    productName: productMap[product.productId] || 'Unknown',  // Include product name
                    weight: [{
                        quantity: Number(product.quantity),
                        weight: product.weight,
                        price: Number(product.price)
                    }]
                });
            }
            return acc;
        }, []);

        // Prepare the filtered result
        const filteredResult = {
            transaction_id: result.transaction_id,
            distributorId: result.distributorId,
            products: productsGroupedByProductId,
            paid: result.paid,
            totalAmount: result.totalAmount,
            pay: result.pay,
            balance: result.balance,
            paymentInfo: result.paymentInfo,
            order_date: result.order_date
        };

        return res.status(200).send({
            message: "Get Transactional Details",
            success: true,
            data: filteredResult
        });

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
}


const barCodeProduct = async(req,res)=>{

    const productId =  req.params.id

    try {
        const product = await Product.findOne({ productId: productId });
        

        if (!product) {
            return res.status(404).send('Product not found');
        }

        res.render('product.ejs', { product });
        
    } catch (error) {
        
    }
}

const viewVendorAgent = async(req,res)=>{

    const{agentId,vendorId,shop_id,key} = req.query
    let response = undefined;
    let json;
    try {
        if(!key){
            return res.status(400).send({success:false,message:"Missing keys"})
        }

        if(Number(key)===1){
            response = await Vendor.findOne({vendorId:vendorId,shopId:shop_id})
            console.log("response",response)
            json = {
                id:response.vendorId,
                name:response.name,
                email:response.email,
                phone:response.phone,
                image:response.image,

            }
        }else if(Number(key)===2){
            response = await Agent.findOne({vendorId:vendorId,shopId:shop_id,agentId:agentId})
            json = {
                id:response.vendorId,
                ag_id:response.agentId,
                name:response.name,
                email:response.email,
                phone:response.phone,
                image:response.image,

            }
        }   
       
        return res.status(200).send({
            success:true,
            data:json
        })
    
    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
}


const requestOrder = async(req,res)=>{

    let {adminId,shop_id,not_id} = req.query
    let body = req.body

    try {

        if(!adminId || !shop_id) {
            return res.status(400).send({success:false,message:"Missing creendentials"})
        }
        const lastId = await getNextSequentialId("REQ")

        const result = await RequestOrder.create({
            adminId:adminId,
            reqId:lastId,
            agentId:body.agentId,
            shopId:shop_id,
            quantity:body.quantity,
            agentname:body.agentname,
            email:body.email,
            phone:body.phone,
            message:body.message
        })

        const eliminatenotification = await Notification.updateOne({_id:not_id},{$set:{checked:true}})

        return res.status(201).send({success:true,message:"Request Sent"})

        
    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }

}


const getAllRequstedOrders = async(req,res)=>{

    let {adminId,limit,offset} = req.query

    limit = parseInt(limit);
    offset = parseInt(offset)

    try {
        if(!adminId) {
            return res.status(400).send({success:false,message:"Missing creendentials"})
        }

        const allorders = await RequestOrder.find({})
        const totalData = allorders.length;
        const orders = await RequestOrder.find({adminId:adminId}).sort({_id:-1}).skip(offset)
        .limit(limit)

        if(orders.length===0){
            return res.status(400).send({success:false,message:"No Requests Found"})
        }

        let arr = orders.map((ele)=>({
            _id:ele._id,
            message:ele.message,
            quantity:ele.quantity,
            agentId:ele.agentId,
            agentName:ele.agentname,
            email:ele.email,
            phone:ele.phone
        }))

        return res.status(200).send({success:true,message:"Get all requests",totaldata:totalData,data:arr})
        
    } catch (error) {
         console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
}

module.exports = {
    addVendor,
    addAgent,
    getAllVendors,
    getallAgents,
    addInventory,
    getTransctions,
    updateStock,
    updateMoney,
    viewTransaction,
    barCodeProduct,
    updateVendor,
    viewVendorAgent,
    requestOrder,
    getAllRequstedOrders
}
