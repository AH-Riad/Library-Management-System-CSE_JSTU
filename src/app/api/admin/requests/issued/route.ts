import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import UserBook from "@/models/UserBook";

export async function GET() {
  try {
    await connectDB();

    const issued = await UserBook.find({
      status: "issued",
    }).populate("bookId");

    return NextResponse.json({
      success: true,
      requests: issued,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
