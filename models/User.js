import mongoose from "mongoose";


const userSchemema=new mongoose.Schema({
    _id:{type:String,required:true},
    name:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    imageUrl:{type:String,required:true},
    cartItems:{type:Object,default:{}},

},{minimize:false})

const User= mongoose.models.user||mongoose.model('user',userSchemema)

export default User