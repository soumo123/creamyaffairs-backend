const mongoose  = require('mongoose')

const productSchema = new mongoose.Schema({

    productId: {
        type: String,
        // required: true
    },
    transaction_id:{
        type:String
    },
    type:{
        type:Number,
    },
    agentId:{
        type:String
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    category:{
        type:String,
        default:""
    },
    discount:{
        type:Number,
        default:0
    },
    deal_start_date:{
        type: Date,
        default:""
    },
    deal_end_date:{
        type: Date,
        default:""
    },
    other_description1:{
        type:String
    },
    other_description2:{
        type:String
    },
    weight: {
        type: [
            {
                weight: {
                    type: Number,
                    required: true // Use required if this field must always have a value
                },
                price: {
                    type: Number,
                    required: true
                },
                stock: {
                    type: Number,
                    required: true
                },
                purchaseprice: {
                    type: Number,
                    required: true
                },
            }
        ],
        _id: false // Prevent _id creation
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
        type:Array
    },
    product_type:{
        type:Number  // 0 - Vrg , 1 - Non-veg and 2- Other//
    },

    platforms: {
        type: [
            {
                weight: {
                    type: Number
                   
                },
                price: {
                    type: Number
                },
                value: {
                    type: Number
                },
                label: {
                    type: String
                },
                active:{
                    type:Boolean,
                    default:true
                }
            }
        ],
        _id: false ,// Prevent _id creation
        default:[]
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
    process:{
        type:Number,
        default:0
    },
    expired:{
        type:Boolean,
        default:false
    },
    expiry_date:{
        type:Date,
        default:"",
    },
    manufacture_date:{
        type:Date,
        default:""
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
