import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import User from "@/models/User";
import connectDB from "@/config/db";

export async function GET() {
  try {
    await connectDB();

    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const email = user.emailAddresses?.[0]?.emailAddress;

    // Query by userId (Clerk ID), not _id
    let userData = await User.findOne({ userId: user.id });

    if (!userData) {
      userData = await User.create({
        userId: user.id,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        email: email,
        imageUrl: user.imageUrl || "",
        cartItems: {}
      });
    }

    return NextResponse.json({ success: true, user: userData });

  } catch (error) {
    console.error("🔥 FULL ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}