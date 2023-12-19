const { Schema, model } = require('mongoose')

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true , unique:true },
    password: { type: String, required: true },
    gender: { type: String, required: true },
    profile_pic: { type: String, default: "https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg" },
    joiningDate: { type: Date, default: Date.now },
    role:{ type: String, default:"user"}
})

const Users = model('users', userSchema)
module.exports = Users