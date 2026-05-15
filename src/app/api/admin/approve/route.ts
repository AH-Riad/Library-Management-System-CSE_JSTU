import { NextResponse } from "next/server";
import UserBook from "@/models/UserBook";
import Book from "@/models/Book";
import { connectDB } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const { requestId } = body;

    if (!requestId) {
      return NextResponse.json(
        { success: false, message: "Request ID required" },
        { status: 400 },
      );
    }

    // 1. Find request
    const request = await UserBook.findById(requestId);

    if (!request) {
      return NextResponse.json(
        { success: false, message: "Request not found" },
        { status: 404 },
      );
    }

    if (request.status !== "pending") {
      return NextResponse.json(
        { success: false, message: "Request already processed" },
        { status: 400 },
      );
    }

    // 2. Normalize bookId (safe fix)
    const bookId =
      typeof request.bookId === "object" ? request.bookId._id : request.bookId;

    const book = await Book.findById(bookId);

    if (!book) {
      return NextResponse.json(
        { success: false, message: "Book not found" },
        { status: 404 },
      );
    }

    if (book.availableCopies <= 0) {
      return NextResponse.json(
        { success: false, message: "No copies available" },
        { status: 400 },
      );
    }

    // 3. Issue dates
    const issueDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(issueDate.getDate() + 7);

    // 4. Update request
    request.status = "issued";
    request.issueDate = issueDate;
    request.dueDate = dueDate;

    await request.save();

    // 5. Update book stock safely
    book.availableCopies = Math.max(0, book.availableCopies - 1);
    await book.save();

    // (optional debug log)
    console.log("BOOK ISSUED:", {
      requestId,
      userId: request.userId,
      bookId,
    });

    return NextResponse.json({
      success: true,
      message: "Book approved and issued",
      request,
    });
  } catch (error) {
    console.log("ADMIN APPROVE ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
