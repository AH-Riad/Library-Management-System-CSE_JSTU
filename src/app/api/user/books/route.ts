import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";

// ✅ IMPORTANT: FORCE MODEL REGISTRATION
import "@/models/Book";
import UserBook from "@/models/UserBook";

export async function GET() {
  try {
    await connectDB();

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const records = await UserBook.find({
      userId,
    }).populate("bookId"); // now Book schema exists

    return NextResponse.json({
      success: true,
      records,
    });
  } catch (error) {
    console.log("USER BOOKS ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch books" },
      { status: 500 },
    );
  }
}
