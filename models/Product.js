import mongoose from "mongoose";

// Force fresh model (clear cache if exists)
if (mongoose.models.Product) {
  delete mongoose.models.Product;
}

const productSchema = new mongoose.Schema({
  userId: { type: String, required: true, ref: "user" },
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  offeredPrice: { type: Number, required: true },
  image: { type: [String], required: true },
  date: { type: Date, default: Date.now },
});

const Product = mongoose.model("Product", productSchema);

export default Product;