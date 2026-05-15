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
      return NextResponse.json(
        { success: false, message: "Not found" },
        { status: 404 },
      );
    }

    if (record.status !== "return_pending") {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 },
      );
    }

    record.status = "returned";
    record.returnDate = new Date();

    await record.save();

    const book = await Book.findById(record.bookId);

    if (book) {
      book.availableCopies += 1;
      await book.save();
    }

    return NextResponse.json({
      success: true,
      message: "Book returned successfully",
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
