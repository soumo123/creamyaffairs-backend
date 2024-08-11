const CheckoutAdress = require('../models/checkoutadress.model');
const Shops = require('../models/shop.model');
const { getLastAdressId } = require('../utils/helper');



const addAddress = async (req, res) => {

    let type = Number(req.query.type);
    let shop_id = req.query.shop_id;
    let userId = req.query.userId;

    const { address, phone, appratment, state, pin } = req.body

    try {

        if (!address && !phone && !state && !pin) {
            return res.statsu(400).send({ success: false, message: "Field Missing" })
        }

        const id = await getLastAdressId()
        let json = {
            id: id,
            userId: userId,
            type: type,
            shop_id: shop_id,
            address: address,
            phone: phone,
            appratment: appratment,
            state: state,
            pin: pin
        }
        const reaponse = await CheckoutAdress.create(json);
        return res.status(201).send({ success: true, message: "Add Address" })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
}


const getAddress = async (req, res) => {

    try {

        let type = Number(req.query.type);
        let shop_id = req.query.shop_id;
        let userId = req.query.userId;

        const response = await CheckoutAdress.find({ type: type, shop_id: shop_id, userId: userId })

        if (response.length === 0) {
            return res.status(404).send({ success: false, message: "No address found" })
        }

        return res.status(200).send({ success: true, data: response, message: "Get all adresses" })


    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }

}


const updateAdress = async (req, res) => {

    let type = Number(req.query.type);
    let shop_id = req.query.shop_id;;
    let userId = req.query.userId;
    let id = Number(req.query.id)

    const { address, phone, appratment, state, pin } = req.body

    try {

        if (!address && !phone && !appratment && !state && !pin) {
            return res.statsu(400).send({ success: false, message: "Field Missing" })
        }

        let json = {
            address: address,
            phone: phone,
            appratment: appratment,
            state: state,
            pin: pin
        }

        const reaponse = await CheckoutAdress.updateOne({ userId: userId, type: type, shop_id: shop_id, id: id }, { $set: json })

        if (reaponse.modifiedCount === 1) {

            return res.status(200).send({ success: true, message: "Address Updated" })
        } else {
            return res.status(400).send({ success: false, message: "Address Not Updated" })

        }

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }


}

const getShopIdByType = async (req, res) => {

    let type = Number(req.query.type);

    try {

        const response = await Shops.findOne({ type: type });

        if (!response) {
            return res.status(404).send({ success: false, message: "Not Get Shop" })
        }

        return res.status(200).send({ success: true, data: response.shop_id })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
}



module.exports = { addAddress, getAddress, updateAdress , getShopIdByType}