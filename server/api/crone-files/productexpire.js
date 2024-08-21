const cron = require('node-cron');
const dotenv = require('dotenv');
const Expiry = require('../models/expiredproducts.model.js')
const Products = require('../models/product.model.js')
const Notification = require('../models/notification.model.js');
const { checkExpiry } = require('../utils/helper.js');
dotenv.config();



const productExpiry = async () => {

    cron.schedule(process.env.EXPIRY_CRONE, async () => {

        try {
            const products = await Products.find({
                $expr: {
                    $and: [
                        { $eq: [{ $year: "$expiry_date" }, { $year: new Date() }] },
                        { $eq: [{ $month: "$expiry_date" }, { $month: new Date() }] },
                        { $eq: [{ $dayOfMonth: "$expiry_date" }, { $dayOfMonth: new Date() }] }
                    ]
                },
                expired: false
            });
            if (products.length > 0) {
                console.log("Crone Start-------------------------");

                for (let ele of products) {
                    await Expiry.updateOne(
                        { agendtId: ele.agentId },
                        {
                            $addToSet: {
                                productId: {
                                    $each: [ele.productId] // Wrap ele.productId in an array
                                }
                            }
                        }
                    );

                    await Products.updateOne(
                        { productId: ele.productId },
                        { $set: { expired: true, active: 0 } }
                    );
                }
            }

            console.log("Crone End-------------------------No Product Here to push expiry section");

        } catch (error) {
            console.log(error.stack);
        }

    });

};

const sendNotification = async () => {

    cron.schedule(process.env.NOTIFICATION_CRONE, async () => {

        try {

            //Delete all Notifications of last 2 Days //
            console.log("DELETE Crone Start -----------------------")
            const deleteallnotification = await Notification.deleteMany({
                created_at: { $lte: new Date(new Date().setDate(new Date().getDate() - 2)) }
            });
            console.log("DELETE Crone End -----------------------")


            // send notificaation for that products that will expire after 4 hours //
            const expiryproducts = await Products.find({
                expiry_date: {
                    $lte: new Date(new Date().getTime() + 3 * 60 * 60 * 1000),
                    $gte: new Date()
                },
                expired: false,
                active: 1
            })

            const stockProducts = await Products.aggregate([
                { $unwind: "$weight" },
                {
                    $match: {
                        "weight.stock": { $lte: 4 },
                        active: 1,
                        expired: false
                    }
                },
                {
                    $project: {
                        _id: 0,
                        productname: "$name",
                        productId: "$productId",
                        weight: "$weight.weight",
                        stock: "$weight.stock",
                        unit: "$unit"
                    }
                }
            ])

            console.log("stockProducts", stockProducts)

            if (expiryproducts.length > 0) {
                console.log("Crone Start For Expiry Products-------------------------");
                for (let ele of expiryproducts) {
                    let checkTime = checkExpiry(ele.expiry_date)

                    await Notification.create({
                        productId: ele.productId,
                        productname: ele.name,
                        message: `Hurry ${checkTime}`
                    })
                }
            }
            if (stockProducts.length > 0) {
                console.log("Crone Start For Stock Products-------------------------");
                for (let ele of stockProducts) {
                    await Notification.create({
                        productId: ele.productId,
                        productname: ele.productname,
                        message: `${ele.productname} of weight ${ele.weight} ${ele.unit} have only ${ele.stock} items left`
                    })
                }
            }

            console.log("Crone End For Expiry Products-------------------------");
            console.log("Crone End For Stock Products-------------------------");
        } catch (error) {
            console.log(error.stack);
        }

    })


}
module.exports = { productExpiry, sendNotification }

