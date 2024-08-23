const express = require('express');
const router = express.Router();
const { addVendor,addAgent, getAllVendors, getallAgents, addInventory, getTransctions, updateStock, updateMoney, viewTransaction, barCodeProduct,viewVendorAgent} = require('../../controllers/vendor-agents.controller.js');
const {ensureAuthenticated} = require('../../middleware/jwtVerify.js')
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('file');


router.post('/addVendor',upload ,addVendor);
router.post('/addAgent',upload ,addAgent);
router.get("/get_all_vendors",getAllVendors)
router.get("/get_al_agents",getallAgents);


router.post("/addinventory",addInventory)
router.get("/get_transtion",getTransctions)
router.put('/update_stock',updateStock)
router.put('/update_transction',updateMoney)
router.get('/view_transaction',viewTransaction)

router.get('/product/:id',barCodeProduct)
router.get('/view_agent_vendor',viewVendorAgent)
module.exports = router
