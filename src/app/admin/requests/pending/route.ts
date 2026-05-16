import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import UserBook from "@/models/UserBook";
import "@/models/Book";

export async function GET() {
  try {
    await connectDB();

    const requests = await UserBook.find({
      status: "pending",
    })
      .populate("bookId")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      requests,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        requests: [],
      },
      { status: 500 },
    );
  }
}
