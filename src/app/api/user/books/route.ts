import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import UserBook from "@/models/UserBook";

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Missing userId" },
        { status: 400 },
      );
    }

    const records = await UserBook.find({ userId }).populate("bookId");

    return NextResponse.json({
      success: true,
      records,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
