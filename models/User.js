import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Ensure this is String for Clerk IDs
  imageUrl: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  name: { type: String },
  cartItems: { type: Object, default: {} }
}, { minimize: false });

const User = mongoose.models.user || mongoose.model("user", userSchema);
export default User;