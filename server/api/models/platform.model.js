const mongoose  = require('mongoose');

const platformSchema = new mongoose.Schema({

    shop_id:{
        type:String,
        required:true
    },
    adminId:{
        type:String,
        required:true
    },
    value:{
        type:Number,
        required:true
    },
    label:{
        type:String,
        required:true
    },
    active: {
        type: Boolean,
        default:false
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

module.exports = mongoose.model('platforms', platformSchema);
