const express = require('express');
const router = express.Router();
const { adminImageUpload, getAllSettingRule, updateSettings, setSale, getSaleItems, createTemplate, getTemplates, updateSale, updateTemplate, getTemplatesofShop } = require('../../controllers/settings.controller.js');
const multer = require('multer');


const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('file');


router.put("/update_settings",updateSettings)
router.get("/setting_rules",getAllSettingRule)
router.put("/update_image",upload,adminImageUpload)
router.post("/addsale",setSale)
router.get("/getsale",getSaleItems)
router.post("/createtemplate",upload,createTemplate)
router.get("/gettemplates",getTemplates)
router.get("/gettemplatesshop",getTemplatesofShop)

router.put("/updatesale",updateSale)
router.put("/updatetempstatus",updateTemplate)


module.exports = router