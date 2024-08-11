const mongoose  = require('mongoose')

const imagesSchema = new mongoose.Schema({

    adminId: {
        type: String,
        required: true
    },
    type: {
        type: Number,
        required: true
    },

    staticImages: 
        {
            loader:{
                type:String
            },

            logo: {
                type: String
            },

            caraousel1: {
                type: String
            },
            caraousel2: {
                type: String
            },

            caraousel3: {
                type: String
            },
            caraousel4: {
                type: String
            },
            category1:{
                type: String
            },
            category2:{
                type: String
            },
            category3:{
                type: String
            },
            category4:{
                type: String
            },
            category5:{
                type: String
            },
            category6:{
                type: String
            },
            category7:{
                type: String
            },
            category8:{
                type: String
            },
            middle_banner1:{
                type: String
            },
            banner1:{
                type: String
            },
            banner2:{
                type: String
            },
            banner3:{
                type: String
            },
            middle_banner2:{
                type:String
            },
            middle_banner3:{
                type:String
            },
            middle_banner4:{
                type:String
            },
            middle_banner5:{
                type:String
            },
            middle_banner6:{
                type:String
            },
            middle_banner7:{
                type:String
            },
            middle_banner8:{
                type:String
            },
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

module.exports = mongoose.model('images', imagesSchema);
