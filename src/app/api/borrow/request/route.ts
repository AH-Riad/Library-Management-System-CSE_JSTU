import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import UserBook from "@/models/UserBook";
import Book from "@/models/Book";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { userId } = await auth();
    const { bookId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    if (!bookId) {
      return NextResponse.json(
        { success: false, message: "Book ID required" },
        { status: 400 },
      );
    }

    // 🔥 FIX 1: BLOCK DUPLICATES (VERY IMPORTANT)
    const existing = await UserBook.findOne({
      userId,
      bookId,
      status: { $in: ["pending", "issued"] },
    });

    if (existing) {
      return NextResponse.json({
        success: false,
        message: "You already requested or have this book",
      });
    }

    // 🔥 FIX 2: CHECK BOOK
    const book = await Book.findById(bookId);

    if (!book) {
      return NextResponse.json(
        { success: false, message: "Book not found" },
        { status: 404 },
      );
    }

    // 🔥 FIX 3: CREATE ONLY ONE RECORD
    const record = await UserBook.create({
      userId,
      bookId,
      status: "pending",
      issueDate: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Request created",
      record,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
