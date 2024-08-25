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
    agentId:{
        type:String,
        required:true
    },
    shopId:{
        type:String,
        required:true
    },
    agentname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    message:{
        type:String
    },
    quantity:{
        type:Number,
        required: true
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