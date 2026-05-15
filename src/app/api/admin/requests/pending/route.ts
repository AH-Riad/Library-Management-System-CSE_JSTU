import { NextResponse } from "next/server";
import UserBook from "@/models/UserBook";
import "@/lib/mongodb";

export async function GET() {
  try {
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
