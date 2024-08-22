const mongoose = require('mongoose');
const { required } = require('nodemon/lib/config');

const notificationSchema = new mongoose.Schema({
    productId:{
        type:String,
        required:true
    },
    adminId:{
        type:String,
        required:true
    },
    type:{
        type:Number,
        required:true
    },
    checked:{
        type:Boolean,
        default:false
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
