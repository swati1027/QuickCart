import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: String,
  email: { type: String, unique: true },
  imageUrl: String,
  cartItems: { type: Object, default: {} }
}, { minimize: false }); // ← prevents empty {} from being stripped

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;