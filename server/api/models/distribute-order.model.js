const mongoose  = require('mongoose')

const distriButeSchema = new mongoose.Schema({


    transaction_id:{
        type:String,
        required:true
    },
    distributorId:{
        type:String,
        required:true
    },
    vendorId:{
        type:String
    },
    distributorName:{
        type:String,
        required:true
    },
    paid:{
        type:Boolean,
        default:false
    },
    pay:{
        type:Number
    },
    balance:{
        type:Number
    },
    paymentInfo:{
        type:Array,
        default:[]
    },
    shopOwnerId:{
        type:String,
        required:true
    },
    products:{
        type:Array,
        default:[]
    },
    resourceid:{
        type:Number,
        default:""
    },
    returcost:{
        type:Number,
        default:0
    },
    totalAmount:{
        type:Number,
        required:true
    },
    order_date: {
        type: Date,
        default: () => {
            return Date.now();
        },
        immutable: true
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

module.exports = mongoose.model('distribute', distriButeSchema);
