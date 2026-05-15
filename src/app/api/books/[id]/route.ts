import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Book from "@/models/Book";

// GET BOOKS
export async function GET() {
  try {
    await connectDB();

    const books = await Book.find().sort({
      createdAt: -1,
    });

    return NextResponse.json({
      success: true,
      books,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch books",
      },
      {
        status: 500,
      },
    );
  }
}

// ADD BOOK
export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const { title, author, category, image, availableCopies } = body;

    if (!title || !author || !category) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required",
        },
        {
          status: 400,
        },
      );
    }

    const newBook = await Book.create({
      title,
      author,
      category,
      image,
      availableCopies,
    });

    return NextResponse.json({
      success: true,
      message: "Book added successfully",
      book: newBook,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      {
        status: 500,
      },
    );
  }
}
