import { NextResponse } from "next/server";
import UserBook from "@/models/UserBook";
import { connectDB } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectDB();
    const requests = await UserBook.find({ status: "pending" }).populate(
      "bookId",
    );

    return NextResponse.json({
      success: true,
      requests,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch requests" },
      { status: 500 },
    );
  }
}
