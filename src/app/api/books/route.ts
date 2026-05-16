import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Book from "@/models/Book";

export async function GET() {
  try {
    await connectDB();

    const books = await Book.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      books,
    });
  } catch (error) {
    console.log("GET BOOK ERROR:", error);

    return NextResponse.json({ success: false, books: [] }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const { title, author, category, availableCopies } = body;

    // ✅ STRICT VALIDATION (prevents missing field bug)
    if (!title || !author || !category) {
      return NextResponse.json(
        {
          success: false,
          message: "Title, author, and category are required",
        },
        { status: 400 },
      );
    }

    // 🔥 IMPORTANT FIX: NEVER send isbn field at all
    const book = await Book.create({
      title: title.trim(),
      author: author.trim(),
      category: category.trim(),
      availableCopies: Number(availableCopies ?? 1),
    });

    return NextResponse.json({
      success: true,
      message: "Book added successfully",
      book,
    });
  } catch (error: any) {
    console.log("BOOK ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Server error while creating book",
      },
      { status: 500 },
    );
  }
}
