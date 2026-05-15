import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import UserBook from "@/models/UserBook";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { userId, bookId } = await req.json();

    const existing = await UserBook.findOne({
      userId,
      bookId,
      status: { $in: ["borrow_pending", "issued", "overdue"] },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Already active request exists",
        },
        { status: 400 },
      );
    }

    const record = await UserBook.create({
      userId,
      bookId,
      status: "borrow_pending",
    });

    return NextResponse.json({
      success: true,
      message: "Borrow request created",
      record,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
