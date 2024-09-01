const mongoose = require('mongoose')

const expiredSchmea = new mongoose.Schema({
    agentId:{
        type:String,
        required:true
    },
    agentname: {
        type: String,
        required: true
    },
    shopid: {
        type: String,
        required: true
    },
    productId: {
        type: Array,
        deafult:[],
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


module.exports = mongoose.model('expiredproducts', expiredSchmea);