const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
    productId:{
        type:String,
        required:true
    },
    productname: {
        type: String,
        required: true
    },
    message:{
        type:String,
        default:""
    },
    notification_type:{
        type:Number, /// 1 means - Product will expire after an sudden hours  /// 2 means - stocks reducing or stock will be finish soon
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


module.exports = mongoose.model('notifications', notificationSchema);