const mongoose = require('mongoose')

const messageSchema= mongoose.Schema({
    message:{
        type: String,
        required: [true, "Please Enter Your Message"]
        
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "Please Enter Your User"]
    },
   
},

{timestamps: true}
)
const message_model = mongoose.model("message", messageSchema)

module.exports= message_model