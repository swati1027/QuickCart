import connectDB from "@/config/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const { items, addressId } = await request.json();

    await connectDB();

    const orderItems = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.product);

        if (!product) return null;

        return {
          product: product._id,
          name: product.name,
          price: product.offeredPrice,
          image: product.image[0],
          quantity: item.quantity
        };
      })
    );

    const filteredItems = orderItems.filter(item => item !== null);

    // ✅ FIXED: round to 2 decimal places
    const amount = Math.round(
      filteredItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ) * 100
    ) / 100;

    const order = await Order.create({
      userId,
      items: filteredItems,
      address: addressId,
      amount,
      date: Date.now(),
      paymentType: "COD"
    });

    return NextResponse.json({
      success: true,
      order
    });

  } catch (error) {
    console.error("ORDER ERROR:", error);
    return NextResponse.json({
      success: false,
      message: error.message
    });
  }
}