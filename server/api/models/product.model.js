const mongoose  = require('mongoose')

const productSchema = new mongoose.Schema({

    productId: {
        type: String,
        // required: true
    },
    type:{
        type:Number,
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    other_description1:{
        type:String
    },
    other_description2:{
        type:String
    },
    weight:{
        type:Array,
        default:[]
    },
    unit:{
        type:String,
        default:"gram"
    },
    // price: {
    //     type: Number,
    // },
    purchase_price:{
        type:String
    },
    delivery_partner:{
        type:String
    },
    selling_price_method:{
        type:String
    },
    zomato_service:{
        type:Boolean
    },
    swiggy_service:{
        type:Boolean
    },
    zepto_service:{
        type:Boolean
    },
    blinkit_service:{
        type:Boolean
    },
    zomato_service_price:{
        type:Number
    },
    swiggy_service_price:{
        type:Number
    },
    zepto_service_price:{
        type:Number
    },
    blinkit_service_price:{
        type:Number
    },
    product_type:{
        type:Number  // 0 - Vrg , 1 - Non-veg and 2- Other//
    },

    tags:{
        type:Array,
        default:[]
    },
    isBestSelling:{
        type:Boolean,
        default:true
    },
    isFeatured:{
        type:Boolean,
        default:true
    },
    isOffered:{
        type:Boolean,
        default:false
    },
    isTopSelling:{
        type:Boolean,
        default:true
    },
    isBranded:{
        type:Boolean,
        default:false
    },
    // discount:{
    //     type:Number,
    //     default: 0
    // },
    // actualpricebydiscount: {
    //     type: Number,
    //     required: true
    // },
    ratings: {
        type: Number,
        default:5
    },
    // stock: {
    //     type: Number,
    //     required: true
    // },
    color: {
        type: String,
        default: ''
    },
    searchstring:{
        type:String
    },
    size:{
        type:Array,
        default:[]
    },
    adminId: {
        type: String
    },
    visiblefor: {
        type: Number,
        default: 0
    },
    thumbnailimage: {
        type: String,
        default:""
    },
    barcodeUrl:{
        type:String,
        default:""
    },
    otherimages:{
        type: Array,
        default:[]
    },
    deliverydays:{
        type:Number
    },
    likes:{
        type:Number,
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    whishListIds:{
        type:Array,
        default:[]
    },
    reviews: [
        {
            username: {
                type: String,
                required: true
            },
            userId:{
                type:String,
                required: true
            },
            userImage:{
                type:String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true
            },
            created_at: {
                type: Date,
                default: () => {
                    return Date.now();
                },
                immutable: true
            },

        }
    ],
    active:{
        type:Number,
        default:1
    },
    created_at: {
        type: Date,
        default: () => {
            return Date.now();
        },
        immutable: true
    },
    updated_at: {
        type: Date,
        default: () => {
            return Date.now();
        }
    }

})

module.exports = mongoose.model('products', productSchema);
