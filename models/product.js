import mongoose from "mongoose";

const productSchema = new mongoose.Schema({

  userId:{type:String, required:true, ref:"user"},
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  offeredPrice: { type: Number, required: true },
  category: { type: String, required: true },
  date: { type: Number,requied: true },
  imageURL:{type:String,required:true},
})

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
 export default Product