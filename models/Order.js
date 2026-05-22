import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },

  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },

      // ✅ SNAPSHOT DATA (VERY IMPORTANT)
      name: String,
      price: Number,
      image: String,

      quantity: Number
    }
  ],

  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address"
  },

  amount: Number,
  date: { type: Number, default: Date.now }
});

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;
