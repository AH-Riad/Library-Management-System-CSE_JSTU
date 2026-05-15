import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import UserBook from "@/models/UserBook";
import Book from "@/models/Book";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { requestId } = await req.json();

    const record = await UserBook.findById(requestId);

    if (!record) {
      return NextResponse.json({ success: false }, { status: 404 });
    }

    record.status = "returned";
    record.returnDate = new Date();
    record.fine = record.fine || 0;

    await record.save();

    const book = await Book.findById(record.bookId);
    if (book) {
      book.availableCopies += 1;
      await book.save();
    }

    return NextResponse.json({
      success: true,
      message: "Book returned successfully",
      fine: record.fine,
    });
  } catch (err) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
