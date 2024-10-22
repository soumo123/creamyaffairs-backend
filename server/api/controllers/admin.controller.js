const User = require('../models/user.model.js')
const Cart = require('../models/cart.model.js')
const Order = require('../models/order.model.js')
const Admin = require('../models/admin.model.js')
const Images = require('../models/images.model.js')
const Product = require('../models/product.model.js')
const uploadFileToS3 = require('../utils/fileUpload.js')
const { getNextSequentialId, checkPassword, getLastTypeId, checkAutorized } = require('../utils/helper.js')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Shops = require('../models/shop.model.js')
const Settings = require('../models/settings.model.js')
const Tax = require('../models/Tax.model.js')
const Notification = require('../models/notification.model.js')
const Agent = require("../models/agent.model.js");
const dotenv = require('dotenv');

dotenv.config();






const signUp = async (req, res) => {
    let { name, email, password, mobile } = req.body;
    const file = req.file;
    try {
        if (!name || !email || !password || !mobile) {
            return res.status(400).send({
                message: 'Field is missing'
            });
        }

        console.log("name, email, password, mobile", name, email, password, mobile, file)
        if (!req.file) {
            return res.status(400).json({ error: 'Invalid request' });
        }

        const emailData = await User.find({ email: email });
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
        const lastId = await getNextSequentialId("AKCUS")
        password = await bcrypt.hash(password, 10)



        const user = await User.create({
            userId: lastId, name, email, password, mobile, image: s3Url
        })

        const cart = await Cart.create({
            userId: lastId,
            type: 1,
            products: []
        })

        return res.status(200).json({ message: 'User Craeted', success: true });
    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
}


const signIn = async (req, res) => {

    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).send({ message: "Email or Password is missing", success: false });
        }
        const user = await User.findOne({ email }).select('+password')

        if (!user) {
            return res.status(400).send({ message: "Invalid email or password", success: false })
        }
        console.log("user", user)
        const isPasswordMatch = await checkPassword(password, user.password);
        console.log(isPasswordMatch);

        if (!isPasswordMatch) {
            return res.status(400).send({ message: "Invalid email Or password", success: false })
        }

        const jwtTokenObject = {
            _id: user._id,
            userId: user.userId,
            email: user.email,
            image: user.image,
            mobile: user.mobile,
            type: user.type

        }

        const jwtToken = jwt.sign(jwtTokenObject, process.env.JWT_SECRET_KEY, {
            expiresIn: process.env.JWT_EXPIRE
        })

        return res.status(200).send({
            success: true,
            message: "User Login Successfully",
            token: jwtToken,
            user: jwtTokenObject
        })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
}


const getUser = async (req, res) => {
    const userId = req.query.userId
    try {
        const user = await User.findOne({ userId })

        if (!user) {
            return res.status(400).send({ message: "User Not Found", success: false })
        }
        return res.status(200).send({ message: "Get User", success: true, data: user })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }


}





//Get Dynamic Images //


const getAllImages = async (req, res) => {

    try {
        const type = Number(req.query.type);

        const images = await Images.find({ type: type })

        if (!images) {
            return res.status(404).send({ message: 'Not Found', success: false })
        }

        return res.status(200).send({ message: 'Get All Images', data: images })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }


}

//admin //

const getuserDetailsByAdmin = async (req, res) => {

    const type = Number(req.query.type)
    const adminId = req.query.adminId;
    let token = req.headers['x-access-token'] || req.headers.authorization;

    try {
        let isCheck = await checkAutorized(token, adminId)
        if (!isCheck.success) {
            return res.status(400).send(isCheck);
        }

        const users = await User.find({ type: type });

        if (users.length === 0) {
            return res.status(404).send({ message: 'Not User Found In This Platform', success: false, data: [] })
        }

        let result = users && users.map((ele) => ({
            userId: ele.userId,
            name: ele.name,
            created_at: ele.created_at
        }));

        return res.status(200).send({ message: 'Get all users by admin', success: true, data: result })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }


}


const userSpecificDetails = async (req, res) => {

    const userId = req.query.userId;
    const type = Number(req.query.type);
    const adminId = req.query.adminId;
    let token = req.headers['x-access-token'] || req.headers.authorization;
    let orders = []
    try {
        let isCheck = await checkAutorized(token, adminId)
        if (!isCheck.success) {
            return res.status(400).send(isCheck);
        }
        //get all add to cart products //

        const carts = await Cart.find({ type: type, userId: userId })
        let result1 = carts[0].products.length === 0 ? [] : carts[0].products.map((ele) => ({
            name: ele.name,
            description: ele.description,
            price: ele.price,
            count: ele.itemCount,
            totalPrice: ele.totalPrice,
            discount: ele.discount,
            thumbImage: ele.thumbImage
        }))

        //get all orders ///
        orders = await Order.findOne({ userId: userId })
        if (!orders) {
            orders = []
        }

        return res.status(200).send({
            message: 'Get All Data',
            carts: result1,
            orders: orders
        })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }


}




//Master Dashboard Signup and Signin///

const registerAdmin = async (req, res) => {

    try {

        let { firstname, lastname, email, phone, address, password } = req.body

        const file = req.file;

        if (!firstname || !lastname || !email || !address || !password || !phone) {
            return res.status(400).send({
                message: 'Field is missing'
            });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'Invalid request' });
        }
        const emailData = await Admin.find({ email: email });
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
        const lastId = await getNextSequentialId("ADMIN")
        password = await bcrypt.hash(password, 10)

        const admin = await Admin.create({
            adminId: lastId, firstname, lastname, email, password, phone, address, image: s3Url
        })

        return res.status(200).json({ message: 'Owner Craeted Successfully', success: true });


    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }

}



const signinAdmin = async (req, res) => {

    const { email, password } = req.body;

    try {

        if (!email || !password) {
            return res.status(400).send({ message: "Email or Password is missing", success: false });
        }
        const user = await Admin.findOne({ email }).select('+password')

        if (!user) {
            return res.status(400).send({ message: "Invalid email or password", success: false })
        }
        const isPasswordMatch = await checkPassword(password, user.password);

        if (!isPasswordMatch) {
            return res.status(400).send({ message: "Invalid email Or password", success: false })
        }

        const jwtTokenObject = {
            _id: user._id,
            adminId: user.adminId,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            image: user.image,
            phone: user.mobile,

        }

        const jwtToken = jwt.sign(jwtTokenObject, process.env.JWT_SECRET_KEY, {
            expiresIn: process.env.JWT_EXPIRE
        })

        return res.status(200).send({
            success: true,
            message: "Owner Login Successfully",
            token: jwtToken,
            admin: jwtTokenObject
        })


    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }


}



const getAdmin = async (req, res) => {
    const adminId = req.query.adminId
    try {
        const user = await Admin.findOne({ adminId })

        if (!user) {
            return res.status(400).send({ message: "User Not Found", success: false })
        }
        return res.status(200).send({ message: "Get User", success: true, data: user })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }


}


const createShop = async (req, res) => {

    try {

        const { shop_name, adminId } = req.body;
        const file = req.file;

        if (!shop_name) {
            return res.status(400).send({
                message: 'Field is missing'
            });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'Invalid request' });
        }
        const fileBuffer = file.buffer;
        const bucketName = process.env.S3_BUCKT_NAME;
        const key = file.originalname;

        // Upload the file to S3
        const s3Url = await uploadFileToS3(bucketName, key, fileBuffer);
        const lastId = await getNextSequentialId("SHOP")
        const lastType = await getLastTypeId()



        const result = await Shops.create({
            adminId: adminId, shop_id: lastId, shop_name, type: Number(lastType), logo: s3Url
        })

        const settings = await Settings.create({
            adminId: adminId,
            type: Number(lastType)
        })

        const images = await Images.create({
            adminId: adminId,
            type: Number(lastType),
            staticImages: {
                logo: "https://shopcake.s3.ap-south-1.amazonaws.com/logo.png",
                banner1: "https://shopcake.s3.ap-south-1.amazonaws.com/banner-1.jpg",
                banner2: "https://shopcake.s3.ap-south-1.amazonaws.com/capsicum.png",
                banner3: "https://shopcake.s3.ap-south-1.amazonaws.com/lychee.png",
                caraousel1: "https://shopcake.s3.ap-south-1.amazonaws.com/fruits.png",
                caraousel2: "https://shopcake.s3.ap-south-1.amazonaws.com/banner3.png",
                caraousel3: "https://shopcake.s3.ap-south-1.amazonaws.com/banner2.png",
                caraousel4: "",
                category1: "https://shopcake.s3.ap-south-1.amazonaws.com/baby-care.png",
                category2: "https://shopcake.s3.ap-south-1.amazonaws.com/bakery-biscuits.png",
                category3: "https://shopcake.s3.ap-south-1.amazonaws.com/beauty-health.png",
                category4: "https://shopcake.s3.ap-south-1.amazonaws.com/breakfast.png",
                category5: "https://shopcake.s3.ap-south-1.amazonaws.com/cleaning.png",
                category6: "https://shopcake.s3.ap-south-1.amazonaws.com/coffee-drinks.png",
                category7: "",
                category8: "",
                middle_banner1: "https://shopcake.s3.ap-south-1.amazonaws.com/pago.png",
                middle_banner2: "https://shopcake.s3.ap-south-1.amazonaws.com/vegetables.png",
                middle_banner3: "https://shopcake.s3.ap-south-1.amazonaws.com/banner-2.jpg",
                middle_banner4: "https://shopcake.s3.ap-south-1.amazonaws.com/banner-3.png",
                middle_banner5: "https://shopcake.s3.ap-south-1.amazonaws.com/banner-4.jpg",
                middle_banner6: "https://shopcake.s3.ap-south-1.amazonaws.com/blog-thumb-1.jpg",
                middle_banner7: "https://shopcake.s3.ap-south-1.amazonaws.com/blog-thumb-2.jpg",
                middle_banner8: "https://shopcake.s3.ap-south-1.amazonaws.com/beef.png",
                loader: "https://shopcake.s3.ap-south-1.amazonaws.com/preloader.gif"
            }
        })

        return res.status(200).json({ message: 'Shop Craeted Successfully', success: true });

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }


}


const getAllShopsForParticularOwner = async (req, res) => {

    const adminId = req.query.adminId;

    try {

        if (!adminId) {
            return res.status(400).send({
                message: "Admin Id Missing"
            })
        }

        const result = await Shops.find({ adminId: adminId });
        if (result.length === 0) {
            return res.status(400).send({
                message: "Shops Not Found"
            })
        }

        return res.status(200).send({
            message: "Get All Shops",
            success: true,
            data: result
        })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
}



const addReview = async (req, res) => {

    let userId = req.query.userId;
    let productId = req.query.productId;
    let type = Number(req.query.type)
    try {
        const { rating, comment } = req.body;

        if (!rating || !comment) {
            return res.status(400).send({ success: false, message: "Fields are missing" })
        }

        const user = await User.findOne({ userId: userId })
        let username = user.name;
        let userImage = user.image;

        const review = await Product.findOne({ productId: productId, type: type }, { reviews: { $elemMatch: { userId: userId } } })
        const numberofreview = await Product.findOne({ productId: productId, type: type });
        let totalNumber = numberofreview.numOfReviews
        console.log("review", review)
        if (review.reviews.length > 0) {
            return res.status(404).send({ success: false, message: "Already added review" })
        }

        let response = await Product.updateOne({ productId: productId, type: type },
            {
                $push: {
                    reviews: {
                        userId: userId,
                        username: username,
                        userImage: userImage,
                        rating: rating,
                        comment: comment
                    }

                },
                $set: {
                    numOfReviews: Number(totalNumber) + 1
                }
            }
        )

        return res.status(200).send({ success: true, message: "Review Added" })
    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }


}

const getAllReviews = async (req, res) => {

    let productId = req.query.productId;
    let type = Number(req.query.type);

    try {

        const result = await Product.findOne({ productId: productId, type: type })

        let reviews = result.reviews
        if (reviews.length === 0) {
            return res.status(400).send({ success: false, message: "No Reviews", data: [] })
        }
        return res.status(200).send({ success: true, data: reviews })
    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
}


const dashboardContents = async (req, res) => {
    const shop_id = req.query.shop_id;
    const adminId = req.query.adminId;
    const type = Number(req.query.type);
    const year = req.query.year; // Assuming year is passed as a query parameter
    let token = req.headers['x-access-token'] || req.headers.authorization;


    // Initialize an object to hold the counts, revenue, and orders for each month
    const monthData = {
        "January": { totalOrders: 0, totalRevenue: 0, orders: [] },
        "February": { totalOrders: 0, totalRevenue: 0, orders: [] },
        "March": { totalOrders: 0, totalRevenue: 0, orders: [] },
        "April": { totalOrders: 0, totalRevenue: 0, orders: [] },
        "May": { totalOrders: 0, totalRevenue: 0, orders: [] },
        "June": { totalOrders: 0, totalRevenue: 0, orders: [] },
        "July": { totalOrders: 0, totalRevenue: 0, orders: [] },
        "August": { totalOrders: 0, totalRevenue: 0, orders: [] },
        "September": { totalOrders: 0, totalRevenue: 0, orders: [] },
        "October": { totalOrders: 0, totalRevenue: 0, orders: [] },
        "November": { totalOrders: 0, totalRevenue: 0, orders: [] },
        "December": { totalOrders: 0, totalRevenue: 0, orders: [] }
    };

    try {
        let isCheck = await checkAutorized(token, adminId)
        if (!isCheck.success) {
            return res.status(400).send(isCheck);
        }

        const users = await User.find({ type: type });
        const products = await Product.find({ type: type });

        let ordersQuery = { type: type, shop_id: shop_id };

        // Optionally filter by year if provided
        if (year) {
            // Assuming orders have a created_at field
            const startDate = new Date(`${year}-01-01`);
            const endDate = new Date(`${year}-12-31`);
            ordersQuery.created_at = { $gte: startDate, $lte: endDate };
        }

        const orders = await Order.find(ordersQuery);

        orders.forEach(order => {
            // Extract the month from the created_at date
            const date = new Date(order.created_at);
            const month = date.toLocaleString('default', { month: 'long' });
            const orderedPrice = order.orderedPrice || 0; // Ensure orderedPrice is valid

            // Increment the count for the month, add to total revenue, and push order to orders array
            monthData[month].totalOrders++;
            monthData[month].totalRevenue += orderedPrice;
            monthData[month].orders.push(order);
        });

        // Convert the monthData object to an array of objects
        const result = Object.keys(monthData).map(month => ({
            month,
            totalOrders: monthData[month].totalOrders,
            totalRevenue: monthData[month].totalRevenue,
        }));

        // Sort the result by month
        const monthOrder = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        result.sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));

        return res.status(200).send({
            message: "Dashboard Details",
            users: users.length,
            products: products.length,
            orders: orders.length,
            result
        });

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
};

const updateTax = async (req, res) => {

    try {
        const { cgst, sgst, cgstvalue, sgstvalue } = req.body
        const adminId = req.query.adminId

        let response = await Tax.updateOne({}, {
            $set: {
                adminId: adminId,
                cgst: Number(cgst),
                sgst: Number(sgst),
                cgstvalue: Number(cgstvalue),
                sgstvalue: Number(sgstvalue)
            }
        })

        return res.status(201).send({ message: "Tax Updated", success: true })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
}





const getTax = async (req, res) => {

    try {
        const adminId = req.query.adminId
        const tax = await Tax.findOne({})
        if (!tax) {
            return res.status(400).send({ message: "Tax Not Found", success: false })
        }
        return res.status(200).send({ message: "Get all tax", data: tax })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }

}


const adminSignin = async (req, res) => {

    const {email,password} = req.body

    try {
        if (!email || !password) {
            return res.status(400).send({ message: "Email or Password is missing", success: false });
        }
        const user = await Admin.findOne({ email }).select('+password')

        if (!user) {
            return res.status(400).send({ message: "Invalid email or password", success: false })
        }
        const isPasswordMatch = await checkPassword(password, user.password);
        console.log(isPasswordMatch);

        if (!isPasswordMatch) {
            return res.status(400).send({ message: "Invalid email Or password", success: false })
        }

        const jwtTokenObject = {
            _id: user._id,
            adminId: user.adminId,
            email: user.email,
            image: user.image,
            mobile: user.phone,

        }

        const jwtToken = jwt.sign(jwtTokenObject, process.env.JWT_SECRET_KEY, {
            expiresIn: process.env.JWT_EXPIRE
        })



        return res.status(200).send({
            success: true,
            message: "Admin Details",
            token: jwtToken,
            user: jwtTokenObject
        })





    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }

}






const getAllNotifications = async (req, res) => {

    let { adminId, type } = req.query
    let token = req.headers['x-access-token'] || req.headers.authorization;


    let mp = new Map()

    try {
        let isCheck = await checkAutorized(token, adminId)
        if (!isCheck.success) {
            return res.status(400).send(isCheck);
        }

        if (!adminId || !type) {
            return res.status(400).send({ success: false, message: "Missing Credentials" })
        }

        const agents = await Agent.find({})

        const result = await Notification.find({ checked:false,adminId: adminId, type: Number(type) }).sort({_id:-1})

        if (result.length === 0) {
            return res.status(400).send({ message: "No Notification Found", success: false })
        }

        agents.forEach(item => {
            mp.set(item.agentId, {
               ag_id:item.agentId,
               name:item.name,
               email:item.email,
               phone:item.phone
            });
        });
        let arr = result.map((ele) => ({
            _id: ele._id,
            message: ele.message,
            productId:ele.productId,
            productname:ele.productname,
            weight:ele.weight,
            stock:ele.stock,
            price:ele.price,
            purchaseprice:ele.purchaseprice,
            noti_type: ele.notification_type,
            agent_details:mp.get(ele.agentId)
        }))


        return res.status(200).send({ message: "Get all Notifications", success: true, data: arr })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }


}

const updateNotification = async (req, res) => {

    const { adminId, type } = req.query

    try {
        if (!adminId || !type) {
            return res.status(400).send({ success: false, message: "Missing Credentials" })
        }

        const result = await Notification.updateMany({ adminId: adminId, type: Number(type) }, { $set: { checked: true } })

        return res.status(200).send({ success: true })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
}

const countNotification = async (req, res) => {
    const { adminId, type } = req.query
    let token = req.headers['x-access-token'] || req.headers.authorization;


    try {
        let isCheck = await checkAutorized(token, adminId)
        if (!isCheck.success) {
            return res.status(400).send(isCheck);
        }
    
        if (!adminId || !type) {
            return res.status(400).send({ success: false, message: "Missing Credentials" })
        }
        const result = await Notification.find({ checked: false, adminId: adminId, type: Number(type) })
        if (result.length === 0) {
            return res.status(400).send({ message: "No Notification Found", success: false })
        }

        return res.status(200).send({ message: "No of notifications", success: true, data: result.length })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
}

const deleteNotification = async(req, res) => {

    let {adminId,id,type} = req.query
    type = parseInt(type)
    let query = undefined
    try {

        if(!adminId){
            return res.status(400).send({ success: false, message: "Missing Credentials" })
        }
        if(type===1){
            query = {adminId:adminId,_id:id}
        }else if(type===2){
            query = {adminId:adminId}
        }
        const deletedata = await Notification.deleteMany(query)

        return res.status(200).send({success:true,message:"Notification Deleted Successfully"})

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }

}

module.exports = { signUp, signIn, getUser, getAllImages, getuserDetailsByAdmin, userSpecificDetails, registerAdmin, signinAdmin, createShop, getAdmin, getAllShopsForParticularOwner, addReview, getAllReviews, dashboardContents, updateTax, getTax, getAllNotifications, updateNotification, countNotification, adminSignin,deleteNotification }
