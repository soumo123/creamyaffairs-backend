const mongoose  = require('mongoose')

const scheckAdressSchema = new mongoose.Schema({

    id:{
        type:Number,
        required:true
    },
    type:{
        type:Number,
        required:true
    },
    
    shop_id:{
        type:String,
        required:true
    },

    userId:{
        type:String,
        required:true
    },

    address:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true
    },
    appratment:{
        type:String,
        default:""
    },
    state:{
        type:String,
        required:true
    },
    pin:{
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

module.exports = mongoose.model('checkoutadress', scheckAdressSchema);