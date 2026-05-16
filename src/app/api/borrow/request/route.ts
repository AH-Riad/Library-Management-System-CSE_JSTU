import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import UserBook from "@/models/UserBook";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { userId, bookId } = await req.json();

    if (!userId || !bookId) {
      return NextResponse.json(
        { success: false, message: "Missing fields" },
        { status: 400 },
      );
    }

    const existing = await UserBook.findOne({
      userId,
      bookId,
      status: { $in: ["pending", "issued"] },
    });

    if (existing) {
      return NextResponse.json({
        success: false,
        message: "Already requested or issued",
      });
    }

    const request = await UserBook.create({
      userId,
      bookId,
      status: "pending",
    });

    return NextResponse.json({
      success: true,
      message: "Borrow request sent",
      request,
    });
  } catch (error) {
    console.log("BORROW ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
