const mongoose = require('mongoose');


const templateSchema = new mongoose.Schema({

    shop_id: {
        type: String,
        required: true
    },
    adminId:{
        type:String,
        required:true
    },
    temp_id:{
        type:String,
        required:true
    },
    template_url:{
        type:String,
        required:true
    },
    active:{
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
})

module.exports = mongoose.model('templates', templateSchema);
