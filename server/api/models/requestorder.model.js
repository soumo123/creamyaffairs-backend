const mongoose  = require('mongoose')

const requestSchema = new mongoose.Schema({

    adminId:{
        type:String,
        required:true
    },
    reqId: {
        type: String,
        required: true
    },
    agentInfo:{
        type:Object,
        required:true
    },

    shopId:{
        type:String,
        required:true
    },
    message:{
        type:String
    },
    productId:{
        type:String,
    },
    productname:{
        type:String
    },
    weight: {
        type: Number
    },
    stock: {
        type: Number
    },
    price: {
        type: Number
    },
    purchaseprice: {
        type: Number
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

module.exports = mongoose.model('requestorders', requestSchema);