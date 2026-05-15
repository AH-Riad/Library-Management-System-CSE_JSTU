import { NextResponse } from "next/server";
import UserBook from "@/models/UserBook";
import Book from "@/models/Book";
import "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { requestId } = body;

    if (!requestId) {
      return NextResponse.json(
        { success: false, message: "Request ID required" },
        { status: 400 },
      );
    }

    // 1. Find issued book record
    const record = await UserBook.findById(requestId);
    if (!record) {
      return NextResponse.json(
        { success: false, message: "Record not found" },
        { status: 404 },
      );
    }

    if (record.status !== "issued") {
      return NextResponse.json(
        { success: false, message: "Book is not currently issued" },
        { status: 400 },
      );
    }

    // 2. Set return date
    const returnDate = new Date();
    record.returnDate = returnDate;

    // 3. Check overdue
    let fine = 0;

    if (record.dueDate && returnDate > record.dueDate) {
      fine = 50; // fixed fine (your rule)
    }

    record.fine = fine;
    record.status = "returned";

    await record.save();

    // 4. Increase book stock
    const book = await Book.findById(record.bookId);

    if (book) {
      book.availableCopies += 1;
      await book.save();
    }

    return NextResponse.json({
      success: true,
      message: "Book returned successfully",
      fine,
      record,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
