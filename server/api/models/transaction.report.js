const mongoose  = require('mongoose')

const transactionReportSchema = new mongoose.Schema({

    shopId:{
        type:String,
        required:true
    },
    productId:{
        type:String,
        required:true
    },
    orderId:{
        type:String,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    platform:{
        type:Number,
        default:null
    },
    totalprice:{
        type:Number,
        required:true
    },
    weight:{
        type:Number,
        required:true
    },
    purchaseprice:{
        type:Number,
        required:true
    },
    sellingprice:{
        type:Number,
        required:true
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

module.exports = mongoose.model('transactionreports', transactionReportSchema);
