const mongoose  = require('mongoose')

const vendorSchema = new mongoose.Schema({

    vendorId: {
        type: String,
        // required: true
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
    image:{
      type:String
    },
    role:{
        type:String
    },
    status:{
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

module.exports = mongoose.model('vendors', vendorSchema);