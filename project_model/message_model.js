const mongoose = require('mongoose')

const messageSchema= mongoose.Schema({
    name:{
        type: String,
        required: [true, "Please Enter Your Name"]
    },
    email:{
        type: String,
        required: [true, "Please Enter Your Email"]
    },
    message:{
        type: String,
        required: [true, "Please Enter Your Message"]
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false 
    },
    type:{
        type: String,
        enum: ['feedback', 'contact', 'complaint', 'suggestion'],
        default: 'feedback'
    },
    status:{
        type: String,
        enum: ['pending', 'read', 'resolved'],
        default: 'pending'
    }
},

{timestamps: true}
)
const message_model = mongoose.model("message", messageSchema)

module.exports= message_model