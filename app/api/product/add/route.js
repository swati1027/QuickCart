import connectDB from '@/config/db';
import authSeller from '@/lib/authSeller';
import { getAuth } from 'clerk/nextjs/server';
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from "next/server";
import Product from '@/models/Product';

// ✅ configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    // 1️⃣ Get the authenticated user
    const { userId } = getAuth(request);

    // 2️⃣ Add this check immediately after
    if (!userId) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized, userId not found"
      });
    }

    // 3️⃣ Then check if the user is a seller
    const isSeller = await authSeller(userId);
    if (!isSeller) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized, only sellers are allowed"
      });
    }

    // 4️⃣ Continue with formData and product creation...
    const formData = await request.formData();
    const name = formData.get("name");
    const description = formData.get("description");
    const category = formData.get("category");
    const price = formData.get("price");
    const offeredPrice = formData.get("offeredPrice");
    // ✅ validation
    if (!name || !description || !category || !price || !offeredPrice) {
      return NextResponse.json({
        success: false,
        message: "All fields are required"
      });
    }

    const files = formData.getAll("images");

    if (!files || files.length === 0) {
      return NextResponse.json({
        success: false,
        message: "At least one product image is required"
      });
    }

    // ✅ upload images
    const result = await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: 'auto' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(buffer);
        });
      })
    );

    const image = result.map(item => item.secure_url); // ✅ array

    await connectDB();

    const newProduct = await Product.create({
      userId,
      name,
      description,
      category,
      price: Number(price),
      offeredPrice: Number(offeredPrice),
      image, // ✅ IMPORTANT (must match schema)
      date: Date.now()
    });

    return NextResponse.json({
      success: true,
      message: "Upload successful",
      newProduct
    });

  } catch (error) {
    console.error("PRODUCT CREATE ERROR:", error);

    return NextResponse.json({
      success: false,
      message: error.message
    });
  }
}
