const express = require('express');
const router = express.Router();
const { adminImageUpload, getAllSettingRule, updateSettings } = require('../../controllers/settings.controller.js');
const multer = require('multer');


const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('file');


router.put("/update_settings",updateSettings)
router.get("/setting_rules",getAllSettingRule)
router.put("/update_image",upload,adminImageUpload)



module.exports = router