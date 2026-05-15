import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import UserBook from "@/models/UserBook";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { userId, bookId } = await req.json();

    if (!userId || !bookId) {
      return NextResponse.json(
        { success: false, message: "Missing data" },
        { status: 400 },
      );
    }

    const existing = await UserBook.findOne({
      userId,
      bookId,
      status: { $in: ["borrow_pending", "issued"] },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Already requested or issued" },
        { status: 400 },
      );
    }

    const record = await UserBook.create({
      userId,
      bookId,
      status: "borrow_pending",
      issueDate: null,
      dueDate: null,
    });

    return NextResponse.json({
      success: true,
      message: "Borrow request sent",
      record,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
