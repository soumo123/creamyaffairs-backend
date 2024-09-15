const mongoose = require('mongoose')

const manusalorderSchema = new mongoose.Schema({


    tokenId:{
        type:String,
        required:true
    },
    username:{
        type:String,
        default:""
    },
    phone:{
        type:Number,
        default:""
    },
    type: {
        type: Number
    },

    products: {
        type: Array,
        required: true
    },
    sgst:{
        type:Number,
        default:0
    },
    cgst:{
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
    status:{
        type:Number,
        default:0
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

module.exports = mongoose.model('manualorders', manusalorderSchema);
