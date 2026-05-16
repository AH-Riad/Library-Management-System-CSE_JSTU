import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import UserBook from "@/models/UserBook";
import "@/models/Book";

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({
        success: false,
        books: [],
      });
    }

    const books = await UserBook.find({ userId })
      .populate("bookId") // 🔥 THIS FIXES YOUR ISSUE
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      books,
    });
  } catch (error) {
    console.log("USER BOOKS ERROR:", error);

    return NextResponse.json({
      success: false,
      books: [],
    });
  }
}
