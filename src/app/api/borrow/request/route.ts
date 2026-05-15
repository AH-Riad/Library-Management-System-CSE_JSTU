import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Book from "@/models/Book";
import UserBook from "@/models/UserBook";
import { connectDB } from "@/lib/mongodb";
export async function POST(req: Request) {
  try {
    await connectDB();
    const { userId } = await auth();
    const body = await req.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { bookId } = body;

    if (!bookId) {
      return NextResponse.json(
        { success: false, message: "Book ID required" },
        { status: 400 },
      );
    }

    // 1. Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return NextResponse.json(
        { success: false, message: "Book not found" },
        { status: 404 },
      );
    }

    // 2. Prevent duplicate request for same book (your rule B)
    const existingRequest = await UserBook.findOne({
      userId,
      bookId,
      status: { $in: ["pending", "issued"] },
    });

    if (existingRequest) {
      return NextResponse.json(
        { success: false, message: "You already requested this book" },
        { status: 400 },
      );
    }

    // 3. Check active books limit (pending + issued)
    const activeBooksCount = await UserBook.countDocuments({
      userId,
      status: { $in: ["pending", "issued"] },
    });

    if (activeBooksCount >= 3) {
      return NextResponse.json(
        { success: false, message: "Book limit reached (max 3 books)" },
        { status: 400 },
      );
    }

    // 4. Create request
    const request = await UserBook.create({
      userId,
      bookId,
      status: "pending",
      issueDate: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Book request sent to admin",
      request,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
