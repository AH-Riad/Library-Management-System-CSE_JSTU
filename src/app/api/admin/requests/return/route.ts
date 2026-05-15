import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import UserBook from "@/models/UserBook";
import "@/models/Book";

export async function GET() {
  try {
    await connectDB();

    const requests = await UserBook.find({
      status: "issued",
    }).populate("bookId");

    return NextResponse.json({
      success: true,
      requests,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch issued books" },
      { status: 500 },
    );
  }
}
