const Cart = require('../models/cart.model.js')
const Product = require('../models/product.model.js')
const Tags = require('../models/tags.model.js')
const Whishlists = require('../models/whishlist.model.js')
const Expiry = require('../models/expiredproducts.model.js')
const Distribute = require('../models/distribute-order.model.js')
const uploadFileToS3 = require('../utils/fileUpload.js')
const { getNextSequentialId, checkPassword, getLastAndIncrementId, generateAndUploadBarcode, checkAutorized } = require('../utils/helper.js')
const dotenv = require('dotenv');
dotenv.config();


const createProduct = async (req, res, next) => {

    let { name, description, other_description1, other_description2, weight, unit, type, price, stock, color, size, visiblefor, discount, deliverydays, tags, isBestSelling, isFeatured,
        isTopSelling, isBranded, isOffered, purchase_price, delivery_partner, selling_price_method, zomato_service, swiggy_service, zepto_service, blinkit_service,
        zomato_service_price, swiggy_service_price, zepto_service_price, blinkit_service_price, product_type
    } = req.body;
    const adminId = req.params.adminId
    let files = req.files;
    let newTag = []
    console.log("tags", tags)

    let thumbnailimage = "";
    let otherimages = []


    try {
        if (tags) {
            if (Array.isArray(tags)) {
                newTag = newTag.concat(tags.map(ele => Number(ele)));
            } else {
                newTag.push(Number(tags));
            }
            console.log("newTag", newTag);
        }
        console.log("newTag", newTag)

        if (!name || !description || !type || !stock) {
            return res.status(400).send({
                message: 'Field is missing'
            });
        }
        if (!req.files) {
            return res.status(400).json({ error: 'Files is not selected' });
        }

        const bucketName = process.env.S3_BUCKT_NAME;
        for (let i = 0; i < files.length; i++) {
            console.log("fileBuffer", files[i])
            const fileBuffer = files[i].buffer;
            const key = files[i].originalname;
            const s3Url = await uploadFileToS3(bucketName, key, fileBuffer);
            console.log("s3Urls3Url", s3Url)
            if (i === 0) {
                thumbnailimage = s3Url;
                otherimages.push(s3Url);
            } else {
                otherimages.push(s3Url);
            }
        }

        let productId = await getNextSequentialId("PD");
        console.log("productId", productId)
        let actualpricebydiscount = undefined;
        if (discount) {
            const discountData = Number(req.body.price) * discount / 100
            console.log("actualpricebydiscountwwwwwwwww", discountData)
            actualpricebydiscount = Number(req.body.price) - discountData
        }
        let searchString = name + description + Number(req.body.price)
        const product = await Product.create({
            adminId: adminId,
            productId: productId,
            type: Number(type),
            name: name,
            description: description,
            other_description1: other_description1,
            other_description2: other_description2,
            weight: JSON.parse(req.body.weight11),
            unit: unit,
            price: Number(price),
            discount: Number(discount),
            actualpricebydiscount: Number(actualpricebydiscount),
            stock: stock,
            color: color,
            size: JSON.parse(req.body.size1),
            purchase_price: purchase_price,
            delivery_partner: delivery_partner,
            selling_price_method: selling_price_method,
            zomato_service: zomato_service,
            swiggy_service: swiggy_service,
            zepto_service: zepto_service,
            blinkit_service: blinkit_service,
            zomato_service_price: Number(zomato_service_price),
            swiggy_service_price: Number(swiggy_service_price),
            zepto_service_price: Number(zepto_service_price),
            blinkit_service_price: Number(blinkit_service_price),
            product_type: Number(product_type),
            tags: newTag,
            visiblefor: visiblefor,
            thumbnailimage: thumbnailimage,
            otherimages: otherimages,
            searchstring: searchString,
            deliverydays: deliverydays,
            isBestSelling: Boolean(isBestSelling),
            isFeatured: Boolean(isFeatured),
            isTopSelling: Boolean(isTopSelling),
            isBranded: Boolean(isBranded),
            isOffered: Boolean(isOffered),
        })

        return res.status(201).send({
            message: "Product Created",
            success: true
        })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
}

const updateProduct = async (req, res, next) => {

    let { name, description, other_description1, other_description2, weight, unit, type, color, size, visiblefor, deliverydays, tags, isBestSelling, isFeatured,
        isTopSelling, isBranded, isOffered, purchase_price, delivery_partner, product_type, transaction_id,platforms
    } = req.body;

    let selling_price_method= JSON.parse(req.body.selling_price_method1)
    platforms = JSON.parse(platforms)

    const adminId = req.params.adminId
    let token = req.headers['x-access-token'] || req.headers.authorization;
    let isCheck = await checkAutorized(token, adminId)
    if (!isCheck.success) {
        return res.status(400).send(isCheck);
    }

    const productId = req.query.productId
    let files = req.files;
    console.log("files", files)
    let newTag = []
    console.log("tags", tags)
    // let actualpricebydiscount = undefined;
    let thumbnailimage = "";
    let otherimages = []
    // console.log("req.body.price", req.body.price)
    try {
        if (tags) {
            if (Array.isArray(tags)) {
                newTag = newTag.concat(tags.map(ele => Number(ele)));
            } else {
                newTag.push(Number(tags));
            }
            console.log("newTag", newTag);
        }
        console.log("newTag", newTag)

        if (!name || !description || !type) {
            return res.status(400).send({
                message: 'Field is missing'
            });
        }
        // if (discount) {
        //     const discountData = Number(req.body.price) * discount / 100
        //     console.log("actualpricebydiscountwwwwwwwww", discountData)
        //     actualpricebydiscount = Number(req.body.price) - discountData
        // }
        let searchString = name + description + Number(req.body.price)

        let barcodeUrl = await generateAndUploadBarcode(productId);

        if (files.length > 0) {
            console.log("comming 1")
            const bucketName = process.env.S3_BUCKT_NAME;
            for (let i = 0; i < files.length; i++) {
                console.log("fileBuffer", files[i])
                const fileBuffer = files[i].buffer;
                const key = files[i].originalname;
                const s3Url = await uploadFileToS3(bucketName, key, fileBuffer);
                console.log("s3Urls3Url", s3Url)
                if (i === 0) {
                    thumbnailimage = s3Url;
                    otherimages.push(s3Url);
                } else {
                    otherimages.push(s3Url);
                }
            }

            let json = {
                adminId: adminId,
                productId: productId,
                type: Number(type),
                name: name,
                description: description,
                other_description1: other_description1,
                other_description2: other_description2,
                weight: JSON.parse(req.body.weight11),
                unit: unit,
                // // price: Number(price),
                // // discount: Number(discount),
                // // actualpricebydiscount: Number(actualpricebydiscount),
                // stock: stock,
                color: color,
                size: JSON.parse(req.body.size1),
                purchase_price: purchase_price,
                delivery_partner: delivery_partner,
                selling_price_method: selling_price_method,
                platforms:platforms,
                product_type: Number(product_type),
                tags: newTag,
                visiblefor: visiblefor,
                thumbnailimage: thumbnailimage,
                otherimages: otherimages,
                searchstring: searchString,
                deliverydays: deliverydays,
                isBestSelling: Boolean(isBestSelling),
                isFeatured: Boolean(isFeatured),
                isTopSelling: Boolean(isTopSelling),
                isBranded: Boolean(isBranded),
                isOffered: Boolean(isOffered),
                barcodeUrl: barcodeUrl
            }
            const product = await Product.updateOne({ productId: productId, type: Number(type), adminId: adminId }, { $set: json })
            const weights = JSON.parse(req.body.weight11);


            for (const weight of weights) {
                await Whishlists.updateMany(
                    { productId: productId, weight: weight.weight },
                    { $set: { price: Number(weight.price), stock: Number(weight.stock) } }
                );
                const cartItems = await Cart.find({ type: Number(type), "products.productId": productId, "products.weight": weight.weight }).exec();
                for (const cart of cartItems) {
                    for (const product of cart.products) {
                        if (product.productId === productId && product.weight === weight.weight) {
                            let totalPrice = weight.price * product.itemCount;

                            // Update Cart
                            await Cart.updateMany(
                                { type: Number(type), "products.productId": productId, "products.weight": weight.weight },
                                {
                                    $set: {
                                        "products.$[elem].price": Number(weight.price),
                                        "products.$[elem].stock": Number(weight.stock),
                                        "products.$[elem].totalPrice": Number(totalPrice)
                                    }
                                },
                                {
                                    arrayFilters: [{ "elem.productId": productId, "elem.weight": weight.weight }]
                                }
                            );
                        }
                    }
                }
            }


        } else {
            const product = await Product.updateOne({ productId: productId, type: Number(type), adminId: adminId }, {
                $set: {
                    adminId: adminId,
                    productId: productId,
                    type: Number(type),
                    name: name,
                    description: description,
                    other_description1: other_description1,
                    other_description2: other_description2,
                    weight: JSON.parse(req.body.weight11),
                    unit: unit,
                    // price: Number(price),
                    // discount: Number(discount),
                    // actualpricebydiscount: Number(actualpricebydiscount),
                    // stock: stock,
                    color: color,
                    size: JSON.parse(req.body.size1),
                    purchase_price: purchase_price,
                    delivery_partner: delivery_partner,
                    selling_price_method: selling_price_method,
                    platforms:platforms,
                    product_type: Number(product_type),
                    tags: newTag,
                    visiblefor: visiblefor,
                    searchstring: searchString,
                    deliverydays: deliverydays,
                    isBestSelling: isBestSelling,
                    isFeatured: isFeatured,
                    isTopSelling: isTopSelling,
                    isBranded: isBranded,
                    isOffered: isOffered,
                    barcodeUrl: barcodeUrl
                }
            })


            const weights = JSON.parse(req.body.weight11);

            for (const weight of weights) {
                await Whishlists.updateMany(
                    { productId: productId, weight: weight.weight },
                    { $set: { price: Number(weight.price), stock: Number(weight.stock) } }
                );
                const cartItems = await Cart.find({ type: Number(type), "products.productId": productId, "products.weight": weight.weight }).exec();
                for (const cart of cartItems) {
                    for (const product of cart.products) {
                        if (product.productId === productId && product.weight === weight.weight) {
                            let totalPrice = weight.price * product.itemCount;

                            // Update Cart
                            await Cart.updateMany(
                                { type: Number(type), "products.productId": productId, "products.weight": weight.weight },
                                {
                                    $set: {
                                        "products.$[elem].price": Number(weight.price),
                                        "products.$[elem].stock": Number(weight.stock),
                                        "products.$[elem].totalPrice": Number(totalPrice)
                                    }
                                },
                                {
                                    arrayFilters: [{ "elem.productId": productId, "elem.weight": weight.weight }]
                                }
                            );
                        }
                    }
                }
            }

            // const carts = await Cart.updateMany({ type: Number(type) },
            //     {
            //         $set: {
            //             "products.$[elem].name": name,
            //             "products.$[elem].description": description,
            //             "products.$[elem].price": Number(actualpricebydiscount),
            //             "products.$[elem].totalPrice": Number(actualpricebydiscount),
            //             "products.$[elem].discount": Number(discount)
            //         },

            //     },
            //     {
            //         arrayFilters: [{ "elem.productId": productId }]
            //     }

            // )
        }





        return res.status(201).send({
            message: "Product Updated",
            success: true
        })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
}

const avaliabilityCheck = async (req, res) => {

    let productId = req.query.productId;
    let type = Number(req.query.type);
    let adminId = req.query.adminId;
    let active = Number(req.query.active);

    try {

        let token = req.headers['x-access-token'] || req.headers.authorization;
        let isCheck = await checkAutorized(token, adminId)
        if (!isCheck.success) {
            return res.status(400).send(isCheck);
        }

        if (active == undefined || active === null) {
            return res.status(400).send({ message: "Active not send" })
        }

        const products = await Product.updateMany({ adminId: adminId, productId: productId, type: type }, { $set: { active: active } })

        const cart = await Cart.updateOne({ type: 1 },
            {
                $pull: {
                    "products": { "productId": productId } // Remove the element with productId equal to "PD000009"
                }
            }

        )
        const whishlist = await Whishlists.deleteMany({ type: type, productId: productId })

        return res.status(200).send({
            success: true,
            message: "Status Update"
        })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
}


const getAllProducts = async (req, res) => {
    const limit = Number(req.query.limit) || 10;
    const offset = Number(req.query.offset) || 0;
    const type = Number(req.query.type);
    const searchData = req.query.key;
    let tags = req.query.tags;
    const ratings = Number(req.query.ratings)
    const startPrice = Number(req.query.startprice);
    const lastPrice = Number(req.query.lastprice);
    const sort = Number(req.query.sort)

    let query;
    try {

        const latest = new Date();
        latest.setDate(latest.getDate() - 4);




        if (tags.length > 0) {
            tags = tags.split(",").map(item => Number(item));
        }

        if (tags.length > 0) {
            query = { type: type, active: 1, expired: false, selling_price_method: "offline", tags: { $in: tags }, price: { $gte: startPrice, $lte: lastPrice } };
        } else {
            query = { type: type, active: 1, expired: false, selling_price_method: "offline", price: { $gte: startPrice, $lte: lastPrice } };
        }
        if (!type) {
            return res.status(200).send({
                message: 'Type not match , Not Getting Products',
            })
        }

        if (searchData) {
            query = { ...query, price: { $gte: startPrice, $lte: lastPrice }, searchstring: { $regex: searchData, $options: 'i' } }; // Case-insensitive search by name
        }

        if (sort === 1) {
            query = { ...query, created_at: { $gte: latest } }
        } else if (sort === 2) {
            query = { ...query, isBestSelling: true }
        } else if (sort === 3) {
            query = { ...query, isTopSelling: true }
        }



        const allData = await Product.find(query).sort({ _id: -1 })
            .skip(offset)
            .limit(limit);


        const featuredData = await Product.find({ active: 1, expired: false, selling_price_method: "offline", isFeatured: true }).sort({ _id: -1 })
            .skip(offset)
            .limit(limit);

        const bestSellingData = await Product.find({ active: 1, expired: false, selling_price_method: "offline", isBestSelling: true }).sort({ _id: -1 })
            .skip(offset)
            .limit(limit);

        const brandedData = await Product.find({ active: 1, expired: false, selling_price_method: "offline", isBranded: true }).sort({ _id: -1 })
            .skip(offset)
            .limit(limit);

        const topSellingData = await Product.find({ active: 1, expired: false, selling_price_method: "offline", isTopSelling: true }).sort({ _id: -1 })
            .skip(offset)
            .limit(limit);

        const dealsData = await Product.find({ active: 1, expired: false, selling_price_method: "offline", isOffered: true }).sort({ _id: -1 })
            .skip(offset)
            .limit(limit);

        const latestProducts = await Product.find({ active: 1, expired: false, selling_price_method: "offline", created_at: { $gte: latest } }).sort({ _id: -1 })
            .skip(offset)
            .limit(limit);


        const totalProducts = await Product.find({ active: 1, expired: false, selling_price_method: "offline" })

        return res.status(200).send({
            message: "Get All Products",
            totalData: totalProducts.length,
            allData: allData,
            featuredData: featuredData,
            bestSellingData: bestSellingData,
            brandedData: brandedData,
            topSellingData: topSellingData,
            dealsData: dealsData,
            latestProducts: latestProducts
        })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
}

const getProductById = async (req, res) => {

    const productId = req.query.productId;
    const type = Number(req.query.type);
    const adminId = req.query.adminId;
    let query = undefined;
    let token = req.headers['x-access-token'] || req.headers.authorization;

    try {
        let isCheck = await checkAutorized(token, adminId)
        if (!isCheck.success) {
            return res.status(400).send(isCheck);
        }
        if (!productId || !type) {
            return res.status(400).send({
                success: false,
                message: "Fields are missing"
            })
        }

        if (adminId) {
            query = { type: type, adminId: adminId, productId: productId }
        } else {
            query = { type: type, productId: productId }
        }

        const products = await Product.find(query)
        if (products.length === 0) {
            return res.status(400).send({
                success: false,
                message: "No Product Found"
            })
        }

        return res.status(200).send({
            message: "Get Products by Id",
            success: true,
            data: products
        })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }

}



const getTotalRatings = async (eeq, res) => {

    try {

        const fivestar = await Product.find({ type: 1, ratings: 5 }).count();
        const fourtar = await Product.find({ type: 1, ratings: 4 }).count();
        const threestar = await Product.find({ type: 1, ratings: 3 }).count();
        const twostar = await Product.find({ type: 1, ratings: 2 }).count();

        return res.status(200).send({
            message: "Get All Ratings",
            fivestar: fivestar,
            fourtar: fourtar,
            threestar: threestar,
            twostar: twostar
        })


    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
}


const createTags = async (req, res) => {

    const adminId = req.params.adminId
    const { name, type } = req.body
    const file = req.file;
    let token = req.headers['x-access-token'] || req.headers.authorization;

    try {
        let isCheck = await checkAutorized(token, adminId)
        if (!isCheck.success) {
            return res.status(400).send(isCheck);
        }

        if (!name) {
            return res.status(400).send({ message: "Name is missing" })
        }
        if (!req.file) {
            return res.status(400).json({ error: 'Invalid request' });
        }

        // Access the buffer property of req.file
        const fileBuffer = file.buffer;
        const bucketName = process.env.S3_BUCKT_NAME;
        const key = file.originalname;

        // Upload the file to S3
        const s3Url = await uploadFileToS3(bucketName, key, fileBuffer);


        const tagId = await getLastAndIncrementId()
        console.log("tagId", tagId)
        const tags = Tags.create({
            tag_id: Number(tagId),
            userId: adminId,
            tag_name: name,
            type: Number(type),
            thumbnailimage: s3Url
        })

        return res.status(201).send({
            message: "Tags Created",
            success: true
        })


    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
}


const deleteTags = async (req, res) => {

    const tagsId = Number(req.query.tagId);
    const type = Number(req.query.type);
    const adminId = req.params.adminId
    let token = req.headers['x-access-token'] || req.headers.authorization;


    try {
        let isCheck = await checkAutorized(token, adminId)
        if (!isCheck.success) {
            return res.status(400).send(isCheck);
        }
        if (!tagsId) {
            return res.status(400).send({
                message: "Tag id is missing",
                success: false
            })
        }

        const response = await Tags.deleteOne({ type: type, userId: adminId, tag_id: tagsId })

        console.log("responseresponse", response)


        return res.status(200).send({
            message: "Tag deleted successfully",
            success: true
        })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }


}


const getAllTags = async (req, res) => {

    const type = Number(req.query.type);
    const limit = Number(req.query.limit) || 100
    const offset = Number(req.query.offset) || 0

    const adminId = req.query.userId;
    let tags = undefined
    try {

        if (!adminId) {
            tags = await Tags.find({ type: type }).sort({ _id: -1 })
        } else {
            // tags = await Tags.find({ type: type, userId: adminId })

            tags = await Tags.aggregate([
                {
                    $match: {
                        type: type,
                        userId: adminId
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
        }
        let result = tags[0].data.map((ele) => ({
            label: ele.tag_name,
            value: ele.tag_id,
            thumbnailImage: ele.thumbnailimage,
            topCategory: ele.topCategory
        }));
        let totalCount = tags[0]?.totalCount

        return res.status(200).send({ message: "Get all tags", totalData: totalCount, data: result })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }

}


const addToCart = async (req, res) => {
    const userId = req.query.userId;
    const productId = req.query.productId;
    const type = Number(req.query.type);

    try {
        let { name, description, price, itemCount, weight, stock, color, thumbImage, totalPrice } = req.body;

        weight = parseInt(weight)

        const user = await Cart.findOne({ userId: userId });

        if (!user) {
            return res.status(400).send({ message: "User Not Found In cart", success: false });
        }
        console.log("type userId productId color weight ", type,
            userId,
            productId,
            color,
            weight)
        const carts = await Cart.findOne({ type: type, userId: userId }, { products: { $elemMatch: { productId: productId, color: color, weight: weight } } })

        console.log("carts", carts)


        // if (carts.products.length === 0) {
        //     const addData = await Cart.updateOne({ type: type, userId: userId }, {
        //         $push: {
        //             productId: productId,
        //             name: name,
        //             description: description,
        //             weight: weight,
        //             color:color,
        //             price: Number(price),
        //             itemCount: Number(itemCount),
        //             discount: Number(discount),
        //             totalPrice: Number(totalPrice),
        //             thumbImage: thumbImage
        //         }
        //     })
        // }else{
        //     const addData = await Cart.updateOne({type:type,userId:userId,"products.productId":productId,"products.weight":weight,"products.color":color},{
        //         $set:{
        //             "products.$.name": name,
        //             "products.$.description": description,
        //             "products.$.price": Number(price),
        //             "products.$.weight": weight,
        //             "products.$.totalPrice": totalPrice,
        //             "products.$.discount": discount,
        //             "products.$.thumbImage": thumbImage
        //         }
        //     })
        // }

        let productIndex = -1;

        // Check if the product already exists in the cart
        user.products.forEach((product, index) => {
            if (product.productId === productId && product.weight === weight && product.color === color) {
                productIndex = index;
            }
        });

        if (productIndex === -1) {
            console.log("comming 1")
            // Product not found in cart, so add it
            user.products.push({
                productId: productId,
                name: name,
                weight: weight,
                stock: stock,
                description: description,
                color: color,
                price: Number(price),
                itemCount: Number(itemCount),
                // discount: Number(discount),
                totalPrice: Number(totalPrice),
                thumbImage: thumbImage
            });
        } else {
            console.log("comming 2")

            // Product found in cart, so update it
            user.products[productIndex] = {
                productId: productId,
                name: name,
                description: description,
                weight: weight,
                stock: stock,
                color: color,
                price: Number(price),
                itemCount: carts.products[0].itemCount + Number(itemCount),
                // discount: Number(discount),
                totalPrice: Number(price) * (carts.products[0].itemCount + Number(itemCount)),
                thumbImage: thumbImage

            };
        }

        // Save the updated cart
        await user.save();

        return res.status(200).send({ message: "Cart Updated" });
    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
};

const getAllCartProducts = async (req, res) => {

    const userId = req.query.userId;
    const type = Number(req.query.type)

    try {

        if (!userId) {
            return res.status(400).send({ message: "UserId Not Get", success: false }); C
        }

        const user = await Cart.findOne({ type: type, userId: userId });



        if (user === null || user.products.length === 0) {
            return res.status(400).send({ message: "No products in cart", success: false });
        }
        let totalPrice = 0;
        user.products.map((ele) => {
            totalPrice = totalPrice + ele.totalPrice
        })


        return res.status(200).send({ message: "All cart items", data: user.products, totalPrice })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }

}


const deleteCartItems = async (req, res) => {
    const userId = req.query.userId;
    const type = Number(req.query.type)
    const productId = req.body.productId;

    try {
        const data = await Cart.findOne({ userId: userId, type: type });

        if (data.products.length === 0) {
            return res.status(400).send({ message: "No Product Found" })
        }

        let unmatchedProducts = data.products.filter(product => !productId.includes(product.productId));

        await Cart.updateOne({ userId: userId }, { $set: { products: unmatchedProducts } });

        return res.status(200).send({ message: "Cart Item deleted successfully", success: true })


    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }

}

const deleteSpecificItemFromCart = async (req, res) => {
    const userId = req.query.userId;
    const productId = req.query.productId;
    const type = Number(req.query.type)

    try {
        const data = await Cart.findOne({ userId: userId, type: type });



        if (data.products.length === 0) {
            return res.status(400).send({ message: "No Product Found" })
        }

        const updateProducts = data.products.filter(ele => ele.productId !== productId);

        await Cart.updateOne({ userId: data.userId, type: type }, { $set: { products: updateProducts } });

        return res.status(200).send({ message: "Item Deleted Successfully" })

    } catch (error) {
        return res.status(400).send(error.stack)

    }
}

//get all products of admin //

const adminProducts = async (req, res) => {

    const adminId = req.query.adminId;
    const type = Number(req.query.type);
    const keyword = req.query.keyword;
    const startPrice = Number(req.query.startprice);
    const lastPrice = Number(req.query.lastprice);
    const limit = Number(req.query.limit);
    const offset = Number(req.query.offset);
    const expired = req.query.expired;
    const action = Number(req.query.action)
    const plat_type = Number(req.query.plat_type)|| ""

    let token = req.headers['x-access-token'] || req.headers.authorization;
    let isCheck = await checkAutorized(token, adminId)
    if (!isCheck.success) {
        return res.status(400).send(isCheck);
    }

    let expiremthods = [];

    if (expired === "") {
        expiremthods.push(true, false)
    } else {
        if (expired === "false") {
            expiremthods.push(false)
        } else {
            expiremthods.push(true)
        }
    }
    try {
        console.log("plat_type",plat_type)
        let query = { adminId: adminId, type: type, expired: { $in: expiremthods } }

        if(plat_type){
            query  = {...query , "platforms.value": plat_type}
        }
        console.log("query",query)
        if (action === 1) {
            query = { ...query, active: 1 }
        }
        if (!keyword && !startPrice && !lastPrice) {
            // 1. If no keyword and no startprice and lastprice, then get all products
            query = query
        } else if (keyword && !startPrice && !lastPrice) {
            // 2. If keyword present but startprice and last price missing, then get all products by matching keyword
            query = { ...query, searchstring: { $regex: keyword, $options: 'i' }, expired: { $in: expiremthods } };

        } else if (keyword && startPrice && lastPrice) {
            // 3. If keyword present and also startprice and last price present, then get all products by matching keyword and price
            query = {
                ...query,
                searchstring: { $regex: keyword, $options: 'i' },
                expired: { $in: expiremthods },
                weight: {
                    "$elemMatch": {
                        "price": {
                            "$gte": startPrice,
                            "$lte": lastPrice
                        }
                    }
                }
            }
            console.log("Getting products by keyword and price...");
        } else if (!keyword && startPrice && lastPrice) {
            // 4. If keyword not present but startprice and last price present, then get all products by matching price
            query = {
                ...query,
                expired: { $in: expiremthods },
                weight: {
                    "$elemMatch": {
                        "price": {
                            "$gte": startPrice,
                            "$lte": lastPrice
                        }
                    }
                }
            };
            console.log("Getting products by price...");
        } else if (startPrice && !lastPrice) {
            // 5. If only startprice present, then get all products with price greater than or equal to startprice
            query = {
                ...query,
                expired: { $in: expiremthods },
                weight: {
                    "$elemMatch": {
                        "price": {
                            "$gte": startPrice,
                            // "$lte": lastPrice
                        }
                    }
                }
            };
            console.log("Getting products with price greater than or equal to start price...");
        } else if (!startPrice && lastPrice) {
            // 6. If only lastprice present, then get all products with price less than or equal to lastprice
            query = {
                ...query,
                expired: { $in: expiremthods },
                weight: {
                    "$elemMatch": {
                        "price": {
                            // "$gte": startPrice,
                            "$lte": lastPrice
                        }
                    }
                }
            };
            console.log("Getting products with price less than or equal to last price...");
        } else {
            return res.status(400).send({ message: "Invalid combination of parameters." });
        }
        const products = await Product.find(query).sort({ _id: -1 }).skip(offset)
            .limit(limit);
        const totalData = await Product.find({ type: type, adminId: adminId, expired: { $in: expiremthods } }).sort({ _id: -1 }).count();


        if (products.length === 0) {
            return res.status(404).send({ message: "Get All Products", data: [] })
        }

        return res.status(200).send({ message: "Get All Products", totalData: totalData, data: products })


    } catch (error) {
        console.log(error.stack)
        return res.status(400).send(error.stack)
    }

}
//Delete Product By Admin ///


const deleteProductByAdmin = async (req, res) => {

    const adminId = req.query.adminId;
    const type = Number(req.query.type);
    const productId = req.query.productId
    let token = req.headers['x-access-token'] || req.headers.authorization;


    try {

        let isCheck = await checkAutorized(token, adminId)
        if (!isCheck.success) {
            return res.status(400).send(isCheck);
        }

        const products = await Product.deleteOne({ adminId: adminId, type: type, productId: productId })
        const cart = await Cart.updateOne({ type: 1 },
            {
                $pull: {
                    "products": { "productId": productId } // Remove the element with productId equal to "PD000009"
                }
            }

        )
        const whishlist = await Whishlists.deleteMany({ type: type, productId: productId })

        return res.status(200).send({ message: "Product Deleted Successfully", success: true })

    } catch (error) {
        return res.status(400).send(error.stack)
    }
}


const editTag = async (req, res) => {
    const adminId = req.params.adminId;
    const tagId = Number(req.params.tag_id)
    const { name, type } = req.body
    let token = req.headers['x-access-token'] || req.headers.authorization;
    const file = req.file;
    let s3Url = undefined;
    try {
        let isCheck = await checkAutorized(token, adminId)
        if (!isCheck.success) {
            return res.status(400).send(isCheck);
        }
        if (!tagId) {
            return res.status(400).send({ message: "Tag id is missing", success: false })
        }

        if (file) {
            // Access the buffer property of req.file
            const fileBuffer = file.buffer;
            const bucketName = process.env.S3_BUCKT_NAME;
            const key = file.originalname;
            s3Url = await uploadFileToS3(bucketName, key, fileBuffer);

            const response = await Tags.updateOne({ userId: adminId, type: type, tag_id: tagId }, { $set: { tag_name: name, thumbnailimage: s3Url } });
        } else {
            const response = await Tags.updateOne({ userId: adminId, type: type, tag_id: tagId }, { $set: { tag_name: name } });

        }


        // Upload the file to S3





        return res.status(201).send({ message: "Tag updated", success: true })


    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
}



const addWhishList = async (req, res) => {

    try {
        const whish = req.query.status;
        const userId = req.query.userId;
        const type = Number(req.query.type)
        const prouctId = req.query.productId

        // const { name, description, price, discount, stock, ratings, thumbnailimage, numOfReviews, totalPrice } = req.body;
        const { name, description, price, ratings, stock, weight, thumbnailimage, numOfReviews, totalPrice } = req.body;


        const whislistData = await Whishlists.findOne({ type: type, userId: userId, productId: prouctId })
        console.log("whislistData", whislistData)

        console.log("whish", whish, typeof (whish))
        if (whish === true || whish === "true") {
            if (whislistData) {
                const result = await Whishlists.updateOne({ userId: userId, productId: prouctId, type: type }, { $set: { likes: true } })
                await Product.updateOne({ type: type, productId: prouctId }, { $push: { whishListIds: userId } })
            } else {
                const result = await Whishlists.create({
                    productId: prouctId,
                    type: type,
                    userId: userId,
                    likes: true,
                    name: name,
                    description: description,
                    price: price,
                    // discount: discount,
                    stock: stock,
                    weight: Number(weight),
                    numOfReviews: numOfReviews,
                    ratings: ratings,
                    thumbnailimage: thumbnailimage
                })

                await Product.updateOne({ type: type, productId: prouctId }, { $push: { whishListIds: userId } })
            }


        } else {
            let body = {
                productId: prouctId,
                type: type,
                userId: userId,
                likes: false,
                name: name,
                description: description,
                price: price,
                weight: Number(weight),
                // discount: discount,
                numOfReviews: numOfReviews,
                stock: stock,
                ratings: ratings,
                thumbnailimage: thumbnailimage
            }
            const result = await Whishlists.updateOne({ userId: userId, productId: prouctId, type: type }, { $set: body })

            await Product.updateOne({ tyoe: type, productId: prouctId }, { $pull: { whishListIds: userId } })
        }

        return res.status(200).send({ message: "Whislist Updated" })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }

}

const getWhishListProducts = async (req, res) => {

    const userId = req.query.userId;
    const type = Number(req.query.type);


    try {

        const result = await Whishlists.find({ userId: userId, type: type, likes: true }).sort({ _id: -1 });
        if (result.length === 0) {
            return res.status(404).send({ message: "No whishlist product found", data: [] })
        }

        return res.status(200).send({ message: "All Whishlist Products", data: result })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }

}


const countUpdate = async (req, res) => {
    try {
        let userId = req.query.userId;
        let productId = req.query.productId;
        let type = Number(req.query.type);
        let count = Number(req.query.count);
        let totalPrice = Number(req.body.totalPrice)
        let weight = req.body.weight
        let color = req.body.color
        // Assuming Product is your Mongoose model



        const response = await Cart.updateOne(
            {
                userId: userId,
                type: type,
                "products.productId": productId,
                "products.color": color,
                "products.weight": weight
            },
            {
                $set: {
                    "products.$.itemCount": count,
                    "products.$.totalPrice": totalPrice
                }
            }
        );


        if (response.modifiedCount === 1) {
            return res.status(200).send({ message: "Count Updated", success: true });
        } else {
            return res.status(404).send({ message: "Product not found or count not updated", success: false });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error", error: error.message });
    }
};

const updateCategoryStatus = async (req, res) => {

    let userId = req.query.userId;
    let type = Number(req.query.type);
    let status = Number(req.query.status)
    let tag_id = Number(req.query.tag_id)

    let token = req.headers['x-access-token'] || req.headers.authorization;
    try {
        let isCheck = await checkAutorized(token, userId)
        if (!isCheck.success) {
            return res.status(400).send(isCheck);
        }

        const response = await Tags.updateOne({ tag_id: tag_id, userId: userId, type: type }, { $set: { topCategory: status } })


        return res.status(200).send({ message: "Status Updated", success: true });


    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error", error: error.message });
    }


}


const productPriceVariation = async (req, res) => {

    let { weight, productId, type } = req.query;

    weight = parseInt(weight)


    try {
        if (!weight || !productId || !type) {
            return res.status(400).send({ message: "Field Is missing", success: false })
        }

        const result = await Product.aggregate([
            { $match: { productId: productId, type: Number(type) } },
            { $unwind: '$weight' }, // Deconstruct the weight array
            { $match: { 'weight.weight': weight } }, // Filter by weight
            { $project: { _id: 0, price: '$weight.price', stock: '$weight.stock' } } // Project the price field
        ]);
        if (result.length === 0) {
            return res.status(400).send({ message: "Not Found", success: false })
        }

        let price = result[0].price;
        let stock = result[0].stock;
        return res.status(200).send({ success: true, data: { price, stock } })

    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error", error: error.message });
    }

}

const expiryproducts = async (req, res) => {

    let { adminId, shop_id, agentId, limit, offset } = req.query

    limit = parseInt(limit);
    offset = parseInt(offset);

    try {

        if (!adminId || !shop_id || !agentId) {
            return res.status(400).send({ success: false, message: "Missing Credentials" })
        }

        const result = await Expiry.find({
            agentId: agentId,
            shop_id: shop_id,
        })



        if (result.length === 0) {
            return res.status(400).send({
                success: false,
                message: "No Products Found of that Agent"
            })
        }

        let allpdids = result[0].productId.map((ele) => ele)

        const allproducts = await Product.find({ productId: { $in: allpdids } }).skip(offset)
            .limit(limit);
        const alldata = await Product.find({ productId: { $in: allpdids } })

        let totalcount = alldata.length

        let modifieddata = allproducts.map((el) => ({
            productId: el.productId,
            name: el.name,
            unit: el.unit,
            weight: el.weight,
            active: el.active,
            expired: el.expired,
            image: el.thumbnailimage,
        }))
        return res.status(200).send({
            success: true,
            message: "Get all expired products of that specific agent",
            totaldata: totalcount,
            data: modifieddata
        })
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error", error: error.message });
    }
}


const getqrProducts = async (req, res) => {

    const limit = Number(req.query.limit);
    const offset = Number(req.query.offset);
    const type = Number(req.query.type);
    const searchData = req.query.key;


    try {
        let matchQuery = { type: type, active: 1 };

        if (searchData) {
            matchQuery.searchstring = { $regex: searchData, $options: "i" };  // Case-insensitive search
        }

        const products = await Product.aggregate([
            {
                $match: matchQuery
            },
            {
                $unwind: "$weight"
            },
            {
                $group: {
                    _id: "$productId",
                    details: {
                        $push: {
                            name: "$name",
                            description: "$description",
                            image: "$thumbnailimage",
                            product_type: "$product_type",
                            ratings: "$ratings",
                            weight: "$weight.weight",
                            price: "$weight.price",
                            unit: "$unit",
                            stock: "$weight.stock"

                        }
                    },

                }
            },
            {
                $unwind: "$details"
            }, {
                $project: {
                    _id: 1,
                    name: "$details.name",
                    description: "$details.description",
                    image: "$details.image",
                    product_type: "$details.product_type",
                    ratings: "$details.ratings",
                    weight: "$details.weight",
                    price: "$details.price",
                    stock: "$details.stock",
                    unit: "$details.unit",

                }
            }, {
                $sort: { _id: -1 }
            }, {
                $skip: offset
            },
            {
                $limit: limit
            }
        ])


        return res.status(200).send({
            success: true,
            message: "Get all products",
            data: products
        })
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error", error: error.message });
    }
}


const updatePurchasePrice = async (req, res) => {
    let { productId, adminId, transaction_id, type } = req.query;
    let body = req.body;
    type = parseInt(type)

    let token = req.headers['x-access-token'] || req.headers.authorization;
    let isCheck = await checkAutorized(token, adminId)


    try {
        if (!isCheck.success) {
            return res.status(400).send(isCheck);
        }

        await Distribute.updateOne(
            { productId: productId, transaction_id: transaction_id, "products.weight": body.weight },
            [
                {
                    // Update the price in the products array
                    $set: {
                        products: {
                            $map: {
                                input: "$products",
                                as: "product",
                                in: {
                                    $cond: [
                                        {
                                            $and: [
                                                { $eq: ["$$product.productId", productId] },
                                                { $eq: ["$$product.weight", body.weight] }
                                            ]
                                        },
                                        { $mergeObjects: ["$$product", { price: body.purchase_price }] }, // Update price
                                        "$$product" // Keep product unchanged
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    // Recalculate the totalAmount based on updated products array
                    $set: {
                        totalAmount: {
                            $sum: {
                                $map: {
                                    input: "$products",
                                    as: "product",
                                    in: { $multiply: ["$$product.quantity", "$$product.price"] }
                                }
                            }
                        }
                    }

                },
                {
                    // Update balance based on new totalAmount minus pay
                    $set: {
                        balance: { $subtract: ["$totalAmount", "$pay"] }
                    }
                }
            ]
        );

        await Product.updateOne(
            { productId: productId, adminId: adminId },
            {
                $set: { "weight.$[element].purchaseprice": body.purchase_price }
            },
            {
                arrayFilters: [{ "element.weight": body.weight }]
            }

        )

        return res.status(200).send({ message: "Updated", success: true })



    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error", error: error.message });
    }


}

module.exports = {
    createProduct,
    updateProduct,
    avaliabilityCheck,
    getAllProducts,
    getProductById,
    createTags,
    getAllTags,
    getTotalRatings,
    addToCart,
    getAllCartProducts,
    deleteCartItems,
    deleteSpecificItemFromCart,
    adminProducts,
    deleteProductByAdmin,
    deleteTags,
    editTag,
    addWhishList,
    getWhishListProducts,
    countUpdate,
    updateCategoryStatus,
    productPriceVariation,
    expiryproducts,
    getqrProducts,
    updatePurchasePrice
} 
