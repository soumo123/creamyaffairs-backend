const express = require('express');
const router = express.Router();
const { addToCart, addWhishList, adminProducts, createProduct , createTags, deleteCartItems, deleteProductByAdmin, deleteSpecificItemFromCart, deleteTags, editTag, getAllCartProducts, getAllProducts, getAllTags, getTotalRatings, getWhishListProducts, getProductById, updateProduct, avaliabilityCheck, countUpdate, updateCategoryStatus, productPriceVariation,expiryproducts, getqrProducts } = require('../../controllers/product.controller.js');
const {ensureAuthenticated} = require('../../middleware/jwtVerify.js')
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).array('files', 10);
const upload1 = multer({ storage: storage }).single('file', 10);


router.post('/create/:adminId', upload, createProduct);
router.post('/update/:adminId', upload, updateProduct);
router.put('/active',avaliabilityCheck)
router.get('/getAllProducts', getAllProducts);
router.get('/getProductById',getProductById)
router.post('/createTags/:adminId', upload1,createTags);
router.get('/getalltags',getAllTags)
router.get('/getallratings',getTotalRatings)
router.put('/addToCart',addToCart)
router.get('/getallcartproducts',getAllCartProducts)
router.put("/deleteCart",deleteCartItems)
router.put("/deleteById",deleteSpecificItemFromCart)
router.put("/add_whishlist",addWhishList)
router.get("/get_whishlist",getWhishListProducts)
router.put("/count_update",countUpdate)
router.put('/category_update',updateCategoryStatus)
router.get('/variation_price',productPriceVariation)

router.get('/qr-products',getqrProducts)
//admin//

router.get('/get_admin_products', adminProducts);
router.delete('/delete_product_by_admin', deleteProductByAdmin);
router.delete("/delete_tags/:adminId",deleteTags)
router.put("/update_tags/:adminId/:tag_id",upload1,editTag)

router.get('/get_expiry_products',expiryproducts)
module.exports = router
