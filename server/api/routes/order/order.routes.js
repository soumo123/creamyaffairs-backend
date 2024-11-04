const express = require('express');
const router = express.Router();

const {createOrder, getAllOrders, countOrders,cancelOrder, getSingleOrder, updateOrder, manualReqOrder, requestOrders, acceptrejectorder, createOnlineOrder} = require("../../controllers/order.controller")



router.post('/create',createOrder);
router.post('/createonline',createOnlineOrder);
router.get('/getorders',getAllOrders)
router.get("/getorder/:orderId/:adminId",getSingleOrder)
router.get('/count',countOrders)
router.put('/cancel',cancelOrder)
router.put('/updateOrder',updateOrder)

router.post("/manualorder",manualReqOrder)
router.get("/getmanualorders",requestOrders)

router.put("/accept_reject_order",acceptrejectorder)
module.exports = router