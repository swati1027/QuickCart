import connectDB from "@/config/db";
import authSeller from "@/lib/authSeller";
import Product from "@/models/Product";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    const isSeller = await authSeller(userId);
    if (!isSeller) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized, only sellers are allowed",
      });
    }

    await connectDB();

    // Fetch products as plain JS objects
    const products = await Product.find({}).lean();

    // Clean each product
    const cleanedProducts = products.map((p) => ({
      _id: p._id,
      userId: p.userId,
      name: p.name,
      description: p.description.replace(/\"/g, "'"), // replace rogue quotes in description
      price: p.price,
      offerPrice: p.offerPrice || p.offeredPrice || null,
      category: p.category,
      date: p.date ? Number(p.date) : Date.now(),
    }));

    return NextResponse.json({ success: true, products: cleanedProducts });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message });
  }
}
