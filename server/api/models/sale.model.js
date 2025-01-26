const mongoose = require('mongoose');


const saleSchema = new mongoose.Schema({

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
    caption:{
        type:String,
        required:true
    },
    discount:{
        type:Number,
        required:true
    },
    category:{
        type:Object,
        required:true
    },
    start_date:{
        type:Date,
        required:true
    },
    end_date:{
        type:Date,
        required:true
    },
    active_sale: {
        type: Boolean
    },
    products: {
        type: mongoose.Schema.Types.Mixed, // Allows the field to store any type of data
        required: false
    }
})

module.exports = mongoose.model('saleproducts', saleSchema);
