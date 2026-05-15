import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Book from "@/models/Book";
import { connectDB } from "@/lib/mongodb";
export async function GET() {
  try {
    await connectDB();
    const books = await Book.find();
    return NextResponse.json({ success: true, books });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch books" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { title, author, isbn, category, totalCopies } = body;

    if (!title || !author || !isbn || !category) {
      return NextResponse.json(
        { success: false, message: "Missing fields" },
        { status: 400 },
      );
    }

    const newBook = await Book.create({
      title,
      author,
      isbn,
      category,
      totalCopies,
      availableCopies: totalCopies,
    });

    return NextResponse.json({ success: true, book: newBook });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to add book" },
      { status: 500 },
    );
  }
}
