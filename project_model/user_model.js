const express = require('express')
const mongoose = require('mongoose')

const userSchema = mongoose.Schema(
    {
        username:{
            type: String,
            required: [true, "Please Enter Your name"]
        },
        email:{
            type: String,
            required: [true, "Please Enter Your Email"],
            unique: true
        },
        password:{
            type: String,
            required:[true, "Please Enter Your Password"]
        },
         image:{
            type: String,
            required:[false]
        }
    },
   {timestamps: true}
)

const user = mongoose.model("User", userSchema)
module.exports= user