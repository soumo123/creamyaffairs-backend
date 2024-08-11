const mongoose  = require('mongoose')

const agentSchema = new mongoose.Schema({

    agentId: {
        type: String,
        // required: true
    },
    vendorId:{
        type:String,
        required:true
    },
    shopId:{
        type:String,
        required:true
    },
    name: {
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
    address:{
        type:String,
        required:true
    },
    image:{
      type:String
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

module.exports = mongoose.model('agents', agentSchema);