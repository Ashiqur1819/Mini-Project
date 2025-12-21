const mongoose = require("mongoose")

mongoose.connect("mongodb://localhost:27017/miniProjectDB")

const userSchema = mongoose.Schema({
    name: String,
    username: String,
    email: String,
    password: String,
    age: Number
})

module.exports = mongoose.model("user", userSchema)