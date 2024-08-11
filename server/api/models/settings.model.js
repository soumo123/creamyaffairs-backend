const mongoose  = require('mongoose')

const settingSchema= new mongoose.Schema({

    adminId: {
        type: String
    },
    type:{
        type: Number,
        required: true
    },
    logoheading:{
        type: String,
        default:""
    },
    aboutuslocation:{
        type:String,
        default:""
    },
    email:{
        type:String,
        default:""
    },
    phone:{
        type:String,
        default:""
    },
    location:{
        type:String,
        default:""
    },
    browse_category:{
        type:Boolean,
        default:true
    },
    home:{
        type:Boolean,
        default:true
    },
    products:{
        type:Boolean,
        default:true
    },
    blog:{
        type:Boolean,
        default:true
    },
    search:{
        type:Boolean,
        default:true
    },
    user:{
        type:Boolean,
        default:true
    },
    cart:{
        type:Boolean,
        default:true
    },
    user_details:{
        type:Boolean,
        default:true
    },
    caraousel1:{
        type:Boolean,
        default:true
    },

    category:{
        type:Boolean,
        default:true
    },
    feature_products:{
        type:Boolean,
        default:true
    },
    feature_card:{
        type:Boolean,
        default:true

    },
    trending_products:{
        type:Boolean,
        default:true

    },
    trending_cards:{
        type:Boolean,
        default:true

    },

    deals:{
        type:Boolean,
        default:true

    },

    deals_products:{
        type:Boolean,
        default:true

    },
    deals_products_card:{
        type:Boolean,
        default:true

    },
    middle_card:{
        type:Boolean,
        default:true

    },
    client:{
        type:Boolean,
        default:true

    },
    new_products:{
        type:Boolean,
        default:true

    },

    new_product_card:{
        type:Boolean,
        default:true

    },

    browse_recent_post:{
        type:Boolean,
        default:true

    },
    
    headerCaraosuel1:{
        type:String,
        default:""
    },
    middleCaraosuel1:{
        type:String,
        default:""
    },
    footerCaraosuel1:{
        type:String,
        default:""
    },


    headerCaraosuel2:{
        type:String,
        default:""
    },
    middleCaraosuel2:{
        type:String,
        default:""
    },
    footerCaraosuel2:{
        type:String,
        default:""
    },


    headerCaraosuel3:{
        type:String,
        default:""
    },
    middleCaraosuel3:{
        type:String,
        default:""
    },
    footerCaraosuel3:{
        type:String,
        default:""
    },

    featureHeading:{
        type:String,
        default:""
    },

    headerFeatureCard:{
        type:String,
        default:""
    },

    middleFeatureCard:{
        type:String,
        default:""
    },
    footerFeatureCard:{
        type:String,
        default:""
    },

    headerMiddleCard1:{
        type:String,
        default:""
    },
    footeMiddleCard1:{
        type:String,
        default:""
    },


    headerMiddleCard2:{
        type:String,
        default:""
    },
    footeMiddleCard2:{
        type:String,
        default:""
    },

    headerMiddleCard3:{
        type:String,
        default:""
    },
    footeMiddleCard3:{
        type:String,
        default:""
    },

    dealsCardHeader:{
        type:String,
        default:""
    },
    dealsCardMiddle:{
        type:String,
        default:"" 
    },
    dealsCardFooter:{
        type:String,
        default:""
    },
    fb:{
        type:String,
        default:"" 
    },
    insta:{
        type:String,
        default:"" 
    },
    youtube:{
        type:String,
        default:"" 
    },
    linkdin:{
        type:String,
        default:"" 
    },
    footerBannerHeader:{
        type:String,
        default:""
    },
    footerBannerFooter:{
        type:String,
        default:""
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

module.exports = mongoose.model('settings', settingSchema);
