import connectDB from "@/config/db";
import User from "@/models/User";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized: User not logged in"
      }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({
        success: false,
        message: "User not found"
      }, { status: 404 });
    }

    // Ensure cartItems is always an object
    const cartItems = user.cartItems || {};

    return NextResponse.json({ success: true, cartItems });
  } catch (error) {
    console.error("GET CART ERROR:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
