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

    // 2. Get book
    const book = await Book.findById(request.bookId);
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

    // 3. Update request → issued
    const issueDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(issueDate.getDate() + 7);

    request.status = "issued";
    request.issueDate = issueDate;
    request.dueDate = dueDate;

    await request.save();

    // 4. Decrease book count
    book.availableCopies -= 1;
    await book.save();

    return NextResponse.json({
      success: true,
      message: "Book approved and issued",
      request,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
