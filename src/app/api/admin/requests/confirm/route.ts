import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import UserBook from "@/models/UserBook";
import Book from "@/models/Book";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { requestId } = await req.json();

    if (!requestId) {
      return NextResponse.json(
        { success: false, message: "Request ID required" },
        { status: 400 },
      );
    }

    const record = await UserBook.findById(requestId);

    if (!record) {
      return NextResponse.json(
        { success: false, message: "Record not found" },
        { status: 404 },
      );
    }

    if (record.status !== "return_requested") {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 },
      );
    }

    // 🔥 calculate fine (final check)
    const now = new Date();
    let fine = 0;

    if (record.dueDate && now > record.dueDate) {
      const diffDays = Math.ceil(
        (now.getTime() - record.dueDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      fine = diffDays * 50;
    }

    // ✅ update record
    record.status = "returned";
    record.returnDate = now;
    record.fine = fine;

    await record.save();

    // ✅ restore book stock
    const book = await Book.findById(record.bookId);

    if (book) {
      book.availableCopies += 1;
      await book.save();
    }

    return NextResponse.json({
      success: true,
      message: "Return confirmed successfully",
      fine,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
