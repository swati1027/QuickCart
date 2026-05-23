import connectDB from "@/config/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const { items, address } = await request.json(); // ← fixed: addressId → address

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

    const subtotal = Math.round(
      filteredItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ) * 100
    ) / 100;

    const tax = Math.round(subtotal * 0.02 * 100) / 100;
    const amount = Math.round((subtotal + tax) * 100) / 100;

    const order = await Order.create({
      userId,
      items: filteredItems,
      address, // ← fixed: addressId → address
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