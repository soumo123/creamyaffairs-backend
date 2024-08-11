const mongoose  = require('mongoose')

const tagsSchema = new mongoose.Schema({

    userId: {
        type: String,
        // required: true //Who create the Tags 
    },
    tag_name: {
        type: String,
        required: true
    },
    tag_id: {
        type: Number,
        required: true
    },
    type:{
        type: Number,
        required: true
    },
    thumbnailimage:{
        type:String
    },
    topCategory:{
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

module.exports = mongoose.model('tags', tagsSchema);