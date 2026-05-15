import { NextResponse } from "next/server";
import UserBook from "@/models/UserBook";
import { connectDB } from "@/lib/mongodb";
export async function GET() {
  try {
    await connectDB();
    const returned = await UserBook.find({ status: "returned" }).populate(
      "bookId",
    );

    return NextResponse.json({
      success: true,
      returned,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch returned books" },
      { status: 500 },
    );
  }
}
