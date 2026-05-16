const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,  // FIX: unique only accepts boolean, not array
        required: [true, "Username is required"]
    },
    email: {
        type: String,
        unique: true,  // FIX: unique only accepts boolean, not array
        required: [true, "Email is required"],
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    }
})

const userModel = mongoose.model("Users", userSchema)

module.exports = userModel;