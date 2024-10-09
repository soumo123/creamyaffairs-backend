const Order = require('../models/order.model.js');
const ManualOrder = require('../models/manualorder.model.js')
const Cart = require("../models/cart.model.js")
const Product = require('../models/product.model.js')
const Whishlists = require('../models/whishlist.model.js')
const { getNextSequentialId } = require('../utils/helper.js');


const createOrder = async (req, res) => {

    try {

        const { receivedData, cgst, sgst, initialDeposit, orderedPrice, username, extrathings, extraprice, notes, discount, status, paid, order_method, deliver_date, phone ,paymentmethod} = req.body
        const { userId, type, shop_id, adminId, tokenId } = req.query
        let orderId = await getNextSequentialId("ORDER");

        const order = await Order.create({
            orderId: orderId,
            adminId: adminId || "",
            username: username || "",
            extrathings: extrathings || "",
            extraprice: extraprice || 0,
            notes: notes || "",
            discount: discount || 0,
            userId,
            shopId: shop_id,
            type,
            products: receivedData,
            cgst: Number(cgst),
            sgst: Number(sgst),
            status: status || 0,
            initialDeposit: initialDeposit,
            orderedPrice: orderedPrice,
            paid: paid || false,
            order_method: order_method,
            paymentmethod:paymentmethod || "offline",
            deliver_date: deliver_date,
            phone: Number(phone)
        })

        for (const item of receivedData) {
            const { productId, weight, itemCount } = item;
            await Product.updateOne(
                {
                    productId: productId,
                    'weight.weight': weight
                },
                {
                    $inc: { 'weight.$.stock': -itemCount }
                }
            );

            // Check if the stock of the product's specific weight is 4, then update process
            const product = await Product.findOne(
                {
                    productId: productId,
                    'weight.weight': weight,
                    'weight.stock': 4
                }
            );

            if (product) {
                await Product.updateOne(
                    {
                        productId: productId
                    },
                    {
                        $set: { process: 0 }
                    }
                );
            }


            await Whishlists.updateOne(
                {
                    productId: productId,
                    weight: weight
                },
                {
                    $inc: { stock: -itemCount }
                }
            )


            const cartItems = await Cart.find({ type: Number(type), "products.productId": productId, "products.weight": weight }).exec();
            for (const cart of cartItems) {
                for (const product of cart.products) {
                    if (product.productId === productId && product.weight === weight) {

                        // Update Cart
                        await Cart.updateMany(
                            { type: Number(type), "products.productId": productId, "products.weight": weight },
                            {
                                $inc: {
                                    "products.$[elem].stock": -itemCount,
                                }
                            },
                            {
                                arrayFilters: [{ "elem.productId": productId, "elem.weight": weight }]
                            }
                        );
                    }
                }
            }


        }


        const updateManualOrder = await ManualOrder.updateOne({ tokenId: tokenId }, { $set: { status: 1 } })


        // const removeCart = await Cart.updateOne({ userId: userId }, { $set: { products: [] } })

        return res.status(201).send({
            success: true,
            message: "Order Created Successfully"
        })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }

}


const getAllOrders = async (req, res) => {

    try {
        let orders = undefined;
        let ordermethod = [];
        let { status, shopId, type, key, userId, limit, offset, ordertype } = req.query;
        limit = parseInt(limit)
        offset = parseInt(offset)

        if (ordertype === "") {
            ordermethod = ["direct", "ordered"]
        } else {
            ordermethod.push(ordertype)
        }

        if (status) {
            orders = await Order.find({ shop_id: shopId, type: type, order_method: { $in: ordermethod }, status: { $in: [0, -1, 1, 2, 3, 4] }, orderId: { $regex: key, $options: 'i' } }).sort({ _id: -1 })
                .skip(offset)
                .limit(limit);
        } else {
            orders = await Order.find({ shop_id: shopId, type: Number(type), userId: userId, orderId: { $regex: key, $options: 'i' } }).sort({ _id: -1 })
                .skip(offset)
                .limit(limit);
        }

        let totalData = await Order.find({ shop_id: shopId, type: type, order_method: { $in: ordermethod } }).count()

        const reqorders = await ManualOrder.find({ type: type, status: 0 }).count()

        return res.status(200).send({ success: true, totalData: totalData, totalReqorders: reqorders, data: orders })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }

}

const getSingleOrder = async (req, res) => {

    try {

        const orderId = req.params.orderId;

        const orders = await Order.findOne({ orderId: orderId })

        if (!orders) {
            return res.status(400).send({ success: false, message: "No Order Found" })
        }

        return res.status(200).send({ success: true, message: "Get Single Order", data: orders })
    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
}


const updateOrder = async (req, res) => {
    try {

        const { orderId, shopId, type, status } = req.query;
        let response = undefined;
        console.log("orderId,shopId,type,status", orderId, shopId, type, status)
        if (!status) {
            return res.status(400).send({ message: "Status missing", success: false })
        }
        if (Number(status) === 4) {
            response = await Order.updateOne({ orderId: orderId, shopId: shopId, type: Number(type) }, { $set: { status: Number(status), paid: true, updated_at: new Date() } })
        } else {
            response = await Order.updateOne({ orderId: orderId, shopId: shopId, type: Number(type) }, { $set: { status: Number(status) } })
        }

        if (response.modifiedCount === 1) {
            return res.status(200).send({ success: true, message: "Status updated" })
        } else {
            return res.status(400).send({ success: false, message: "Status Not Updated" })
        }

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
}


const cancelOrder = async (req, res) => {

    try {

        const { orderId, userId, productId, check } = req.query;
        if (Number(check) === 0) {
            const removeOrder = await Order.deleteOne({ userId: userId, orderId: orderId })
        } else {
            const removeOrder = await Order.updateOne(
                { userId: userId, orderId: orderId },
                [
                    {
                        $set: {
                            products: {
                                $filter: {
                                    input: "$products",
                                    as: "product",
                                    cond: { $ne: ["$$product.productId", productId] }
                                }
                            },
                            orderedPrice: {
                                $subtract: [
                                    "$orderedPrice",
                                    {
                                        $arrayElemAt: [
                                            {
                                                $map: {
                                                    input: {
                                                        $filter: {
                                                            input: "$products",
                                                            as: "product",
                                                            cond: { $eq: ["$$product.productId", productId] }
                                                        }
                                                    },
                                                    as: "matchedProduct",
                                                    in: "$$matchedProduct.totalPrice"
                                                }
                                            },
                                            0
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                ]
            )
        }
        return res.status(200).send({ messgae: "Order Deleted" })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
}



const countOrders = async (req, res) => {

    try {

        const { userId, type } = req.query;
        let pending = 0;
        let accept = 0;
        let processing = 0;
        let complete = 0;


        const allOrders = await Order.find({ userId: userId, type: Number(type) });
        let totalOrders = allOrders.length;

        allOrders.forEach(item => {
            switch (item.status) {
                case 0:
                    pending++;
                    break;
                case 1:
                    accept++;
                    break;
                case 2:
                    processing++;
                    break;

                case 4:
                    complete++;
                    break;
                default:
                    break;
            }
        });

        return res.status(200).send({
            message: "Count of orders",
            totalOrders: totalOrders,
            pending: pending,
            processing: processing,
            accept: accept,
            complete: complete
        })


    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }

}


const manualReqOrder = async (req, res) => {

    let { type } = req.query;
    type = parseInt(type)
    let body = req.body

    try {

        if (!type) {
            return res.status(400).send({ success: false, message: "Missing Credentials" })
        }

        let tokenId = await getNextSequentialId("TOKEN");

        let json = {
            tokenId: tokenId,
            username: body.username,
            phone: Number(body.phone),
            type: type,
            products: body.products,
            orderedPrice: body.orderedPrice
        }

        console.log("jsonjsonjson", json)

        const result = await ManualOrder.create(json);
        return res.status(201).send({ success: true, token: tokenId })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }


}

const requestOrders = async (req, res) => {

    let { type, key, limit, offset } = req.query;
    type = parseInt(type)
    limit = parseInt(limit) || 10
    offset = parseInt(offset) || 0


    try {
        if (!type) {
            return res.status(400).send({ success: false, message: "Missing Credentials" })
        }

        const result = await ManualOrder.find({ type: type, status: 0, tokenId: { $regex: key, $options: 'i' } }).sort({ _id: -1 }).skip(offset)
            .limit(limit);

        const totaldata = await ManualOrder.find({ type: type, status: 0 }).sort({ _id: -1 }).count()

        if (result.length === 0) {
            return res.status(400).send({ success: false, message: "No Requested Order Found" })
        }

        return res.status(200).send({ sucess: true, message: "Get all requested orders", totalData: totaldata, data: result })


    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }



}


const acceptrejectorder = async (req, res) => {

    let { adminId, type, tokenId, accept } = req.query
    type = parseInt(type)
    accept = parseInt(accept)

    try {

        if (!type || !tokenId) {
            return res.status(400).send({ success: false, message: "Missing Credentials" })
        }
        if (!accept) {
            return res.status(400).send({ success: false, message: "Status is missing" })
        }

        const updateStatus = await ManualOrder.updateOne({ tokenId: tokenId, type: type }, { $set: { accept: accept } })

        if (accept===1 && updateStatus.modifiedCount === 1) {
            return res.status(200).send({ success: true, message: "Order Accepted" })
        } else if (accept===-1 && updateStatus.modifiedCount === 1){
            return res.status(200).send({ success: false, message: "Order Rejected"})
        }else{
            return res.status(400).send({ success: false, message: "Error for accepting order"})
        }

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
}


module.exports = { createOrder, getAllOrders, getSingleOrder, updateOrder, cancelOrder, countOrders, manualReqOrder, requestOrders, acceptrejectorder }