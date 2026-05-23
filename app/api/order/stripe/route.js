import connectDB from "@/config/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const { items, addressId } = await request.json();
    const origin = request.headers.get('origin');

    await connectDB();
    let productData = [];

    const orderItems = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.product);
        if (!product) return null;
        productData.push({
          name: product.name,
          price: product.offeredPrice,
          quantity: item.quantity
        });
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

    // ✅ Add 2% tax
    const tax = Math.round(subtotal * 0.02 * 100) / 100;
    const amount = Math.round((subtotal + tax) * 100) / 100;

    const order = await Order.create({
      userId,
      items: filteredItems,
      address: addressId,
      amount, // ← now includes tax
      date: Date.now(),
      paymentType: "Stripe"
    });

    // ✅ Line items with tax as separate line
    const line_items = [
      ...productData.map(item => ({
        price_data: {
          currency: "usd",
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity
      })),
      // ✅ Tax line item
      {
        price_data: {
          currency: "usd",
          product_data: { name: "Tax (2%)" },
          unit_amount: Math.round(tax * 100),
        },
        quantity: 1
      }
    ];

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${origin}/order-placed`,
      cancel_url: `${origin}/cart`,
      metadata: {
        orderId: order._id.toString(),
        userId
      }
    });

    return NextResponse.json({
      success: true,
      url: session.url
    });

  } catch (error) {
    console.error("ORDER ERROR:", error);
    return NextResponse.json({
      success: false,
      message: error.message
    });
  }
}