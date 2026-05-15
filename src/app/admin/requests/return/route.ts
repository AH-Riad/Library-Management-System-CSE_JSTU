import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import UserBook from "@/models/UserBook";

export async function GET() {
  try {
    await connectDB();

    const requests = await UserBook.find({
      status: "return_pending",
    }).populate("bookId");

    return NextResponse.json({
      success: true,
      requests,
    });
  } catch (err) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
