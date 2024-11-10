const mongoose  = require('mongoose')

const adminSchema = new mongoose.Schema({

    adminId: {
        type: String,
        // required: true //Who create the Tags 
    },
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    address:{
        type:String
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    image:{
        type: String
    },
    identity_proof:{
        type: String
    },
    city:{
        type:String,
        default:""
    },
    state:{
        type:String,
        default:""
    },
    zip:{
        type:Number,
        default:""
    },
    identity:{
        type:String,
        default:""
    },
    access:{
        type:Object,
        default:{}
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

module.exports = mongoose.model('admins', adminSchema);
