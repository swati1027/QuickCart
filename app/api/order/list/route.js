import connectDB from "@/config/db";
import Order from "@/models/Order";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ success: false });
    }

    await connectDB();

    const orders = await Order.find({ userId })
      .populate("address")
      .populate("items.product"); // ✅ populate product name/image

    return NextResponse.json({
      success: true,
      orders
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error.message
    });
  }
}