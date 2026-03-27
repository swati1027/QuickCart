import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import User from "@/models/User";   // Your Mongoose User model
import connectDB from "@/config/db";

export async function GET(request) {
  try {
    await connectDB();

    // 1. Get the current user from Clerk
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // 2. Try to find the user in your DB
    let userData = await User.findById(user.id);

    // 3. If user doesn't exist, CREATE them with the required fields
    if (!userData) {
      userData = await User.create({
        _id: user.id,               // This satisfies the '_id is required' error
        imageUrl: user.imageUrl,    // This satisfies the 'imageUrl is required' error
        name: `${user.firstName} ${user.lastName}`,
        email: user.emailAddresses[0].emailAddress,
        cartItems: {}
      });
    }

    return NextResponse.json({ success: true, user: userData });

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message // This will help you see if validation still fails
    }, { status: 500 });
  }
}