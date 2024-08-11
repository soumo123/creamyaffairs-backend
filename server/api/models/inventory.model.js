const mongoose  = require('mongoose')

const inventorySchema = new mongoose.Schema({

    agentId:{
        type:String,
        required:true
    },
    type:{
        type:Number,
    },
    productName: {
        type: String,
        required: true
    },
    weight:{
        type:Array,
        default:[]
    },
    color:{
        type:Array,
        default:[]
    },
    size:{
        type:Array,
        default:[]
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

module.exports = mongoose.model('inventory', inventorySchema);
