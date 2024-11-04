const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({

    orderId: {
        type: String,
        required: true
    },
    userId: {
        type: String
    },
    username:{
        type:String,
        default:""
    },
    phone:{
        type:Number,
        default:""
    },
    adminId:{
        type:String,
        default:""
    },
    shopId: {
        type: String
    },
    type: {
        type: Number
    },

    products: {
        type: Array,
        required: true
    },
    sgst:{
        type:Number
    },
    cgst:{
        type:Number
    },
    initialDeposit:{
        type:Number,
        default:0
    },
    orderedPrice:{
        type:Number
    },
    extrathings:{
        type:String,
        default:""
    },
    extraprice:{
        type:Number,
        default:0
    },
    notes:{
        type:String,
        default:""
    },
    discount:{
        type:Number,
        default:0
    },

    paymentmethod: {
        type: String,
        default: "offline"
    },
    plat_type:{
        type:Object,
        default:{}
    },
    status: {
        type: Number,
        default: 0
    },
    paid:{
        type:Boolean,
        default:false
    },
    order_method:{
        type:String,
        default:"offline"
    },
    deliver_date:{
        type: Date,
        default:""
    },
    isreturn: {
        type: Boolean,
        default: false
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

module.exports = mongoose.model('orders', orderSchema);
