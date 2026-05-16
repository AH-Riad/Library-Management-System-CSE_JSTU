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

    record.status = "issued";
    record.issueDate = new Date();

    const due = new Date();
    due.setDate(due.getDate() + 7);

    record.dueDate = due;

    await record.save();

    const book = await Book.findById(record.bookId);

    if (book) {
      book.availableCopies -= 1;
      await book.save();
    }

    return NextResponse.json({
      success: true,
      message: "Book issued",
    });
  } catch (err) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
