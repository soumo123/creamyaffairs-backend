const express = require('express');
const router = express.Router();

const {createOrder, getAllOrders, countOrders,cancelOrder, getSingleOrder, updateOrder} = require("../../controllers/order.controller")



router.post('/create',createOrder);
router.get('/getorders',getAllOrders)
router.get("/getorder/:orderId",getSingleOrder)
router.get('/count',countOrders)
router.put('/cancel',cancelOrder)
router.put('/updateOrder',updateOrder)

module.exports = router