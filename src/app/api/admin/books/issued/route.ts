import { NextResponse } from "next/server";
import UserBook from "@/models/UserBook";
import { connectDB } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectDB();

    const issued = await UserBook.find({ status: "issued" }).populate("bookId");

    return NextResponse.json({
      success: true,
      issued,
    });
  } catch (error) {
    console.log("ISSUED FETCH ERROR:", error); // helpful debug

    return NextResponse.json(
      { success: false, message: "Failed to fetch issued books" },
      { status: 500 },
    );
  }
}
