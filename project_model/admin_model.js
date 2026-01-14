const mongoose = require('mongoose')

const adminSchema = mongoose.Schema(
    {
        username:{
            type: String,
            required: [true, "Please Enter Your name"]
        },
        user_type: {
            type:String,
            required :[true , "Please Enter A user Type"]
        },
        email:{
            type: String,
            required: [true, "Please Enter Your Email"],
            unique: true
        },
        password:{
            type: String,
            required:[true, "Please Enter Your Password"]
        }  ,
       
    },
    {timestamps: true}
)

const admin = mongoose.model('Admin', adminSchema)
module.exports = admin