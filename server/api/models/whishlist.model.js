const mongoose  = require('mongoose')

const whishListSchema = new mongoose.Schema({

    productId: {
        type: String,
        // required: true
    },
    type:{
        type:Number,
    },
    userId:{
        type:String
    },
    likes:{
        type:Boolean,
    },
    name: {
        type: String,
    },
    description: {
        type: String
    },
    price: {
        type: Number,
    },
    // discount:{
    //     type:Number,
    //     default: 0
    // },
    ratings: {
        type: Number,
        default:5
    },
    stock: {
        type: Number
    },
    weight:{
        type:Number
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    addtocart:{
        type:Number,
        default:0
    },
    thumbnailimage: {
        type: String,
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

module.exports = mongoose.model('whislistproducts', whishListSchema);

