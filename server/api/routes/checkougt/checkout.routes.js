const express = require('express');
const router = express.Router();

const {addAddress, getAddress ,updateAdress, getShopIdByType} = require("../../controllers/checkout.controller.js")



router.post('/addAdddress',addAddress);
router.get('/getAdress', getAddress);
router.put('/updateAdress',updateAdress);
router.get("/getshopid",getShopIdByType)



module.exports = router