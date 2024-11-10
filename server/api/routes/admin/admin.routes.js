const express = require('express');
const router = express.Router();
const { signIn, signUp, getUser, getAllImages, getuserDetailsByAdmin, userSpecificDetails, registerAdmin, signinAdmin, getAdmin, createShop, getAllShopsForParticularOwner, addReview, getAllReviews, dashboardContents, getTax, updateTax, getAllNotifications, updateNotification, countNotification, adminSignin, deleteNotification, getAllPlatforms, addPlatform, editPlatform, updateStatusPlatform, dashboardOnlinegraph, addEmp, getEmployees, getEmpById, updateEmp, deleteEmp, encrypt_decrypt, userAccess } = require('../../controllers/admin.controller.js');
const { ensureAuthenticated } = require('../../middleware/jwtVerify.js')
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('file');
const upload1 = multer({ storage: storage }).fields([
    { name: 'file1', maxCount: 1 },
    { name: 'file2', maxCount: 1 }
]);

router.post('/signup', upload, signUp);
router.post('/signin', signIn);
router.get('/getUser', ensureAuthenticated, getUser);
router.get('/getImages', getAllImages)


//admin//
router.get('/get_users_by_admin', getuserDetailsByAdmin)
router.get('/get_user_details', userSpecificDetails)
router.put('/addreview', addReview)
router.get('/getreviews', getAllReviews)


//master admin //
router.post('/registerAdmin', upload, registerAdmin);
router.post('/adminLogin', signinAdmin)
router.get('/get_admin', ensureAuthenticated, getAdmin);
router.post('/craete_shop', upload, createShop)
router.get("/get_all_shops", getAllShopsForParticularOwner)


router.get("/getdashbordDetails", dashboardContents)
router.get("/graphs", dashboardOnlinegraph)



router.put('/update_tax', updateTax)
router.get('/get_tax', getTax)

//notification route //


router.get('/get_notification', getAllNotifications)
router.put('/update_noti', updateNotification)
router.get('/count_notification', countNotification)

//admin sign in//

router.post('/signinadmin', adminSignin)
router.delete('/delete_notification', deleteNotification)

router.post('/addPlatform', addPlatform)
router.put('/editPlatform', editPlatform)
router.put('/updatestatusplatform', updateStatusPlatform)
router.get("/platforms", getAllPlatforms)



//emp add//
router.post("/addemp",upload1,addEmp)
router.get("/getemp",getEmployees)
router.get("/getemp/:id",getEmpById)
router.put('/updateemp', upload1,updateEmp)
router.delete('/deleteemp', deleteEmp)

router.get("/access",userAccess)


router.post("/encrypt_decrypt",encrypt_decrypt)


module.exports = router
