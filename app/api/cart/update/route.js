import connectDB from "config/db";
import User from "models/User";
import Product from "models/Product";
import { getAuth } from "clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { cartData } = await request.json();

    if (!cartData || typeof cartData !== "object") {
      return NextResponse.json({
        success: false,
        message: "Invalid cart data",
      });
    }

    await connectDB();

    // ✅ FIXED: query by userId field, not _id
    const user = await User.findOne({ userId });
    if (!user) {
      return NextResponse.json({
        success: false,
        message: "User not found",
      });
    }

    const validCart = {};

    for (const itemId in cartData) {
      const quantity = Number(cartData[itemId]);
      if (quantity <= 0) continue;

      const product = await Product.findById(itemId);
      if (product) {
        validCart[itemId] = quantity;
      } else {
        console.log("Invalid product ID removed:", itemId);
      }
    }

    user.cartItems = validCart;
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Cart updated successfully",
      cartItems: validCart,
    });
  } catch (error) {
    console.error("CART UPDATE ERROR:", error);
    return NextResponse.json({
      success: false,
      message: error.message,
    });
  }
}