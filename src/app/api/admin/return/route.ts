import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import UserBook from "@/models/UserBook";
import Book from "@/models/Book";

export async function GET() {
  try {
    await connectDB();

    const requests = await UserBook.find({
      status: "return_pending",
    }).populate("bookId");

    return NextResponse.json({ success: true, requests });
  } catch {
    return NextResponse.json({ success: false, requests: [] });
  }
}

// ADMIN APPROVE RETURN
export async function POST(req: Request) {
  try {
    await connectDB();

    const { requestId } = await req.json();

    const record = await UserBook.findById(requestId);

    if (!record) {
      return NextResponse.json({ success: false }, { status: 404 });
    }

    // ✅ IMPORTANT FIX: STOP FURTHER FINE CALCULATION
    record.status = "returned";

    // ✅ LOCK FINES (VERY IMPORTANT FIX)
    record.fine = record.fine || 0;
    record.daysLate = record.daysLate || 0;
    record.isOverdue = false;

    record.returnDate = new Date();

    await record.save();

    const book = await Book.findById(record.bookId);

    if (book) {
      book.availableCopies += 1;
      await book.save();
    }

    return NextResponse.json({
      success: true,
      message: "Book returned",
    });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
