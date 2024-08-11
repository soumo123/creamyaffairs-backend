const mongoose  = require('mongoose')

const userSchema = new mongoose.Schema({

    userId: {
        type: String,
        // required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    image:{
      type:String
    },
    role:{
        type:String
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
    },
    otp: {
        type: String
    }

})

module.exports = mongoose.model('users', userSchema);