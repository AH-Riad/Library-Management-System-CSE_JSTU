import { NextResponse } from "next/server";
import UserBook from "@/models/UserBook";
import "@/lib/mongodb";

export async function GET() {
  try {
    const issued = await UserBook.find({ status: "issued" }).populate("bookId");

    return NextResponse.json({
      success: true,
      issued,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch issued books" },
      { status: 500 },
    );
  }
}
