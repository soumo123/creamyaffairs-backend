const mongoose  = require('mongoose')

const TaxSchema = new mongoose.Schema({

    adminId:{type:String},
    cgst:{
        type:Number
    },
    sgst:{
        type:Number
    },
    cgstvalue:{
        type:Number
    },
    sgstvalue:{
        type:Number
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

module.exports = mongoose.model('Tax', TaxSchema);