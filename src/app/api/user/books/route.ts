import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import UserBook from "@/models/UserBook";
import "@/models/Book";

function calculateFine(dueDate: Date | string) {
  const due = new Date(dueDate);
  const now = new Date();

  const diffTime = now.getTime() - due.getTime();
  const daysLate = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysLate <= 0) {
    return { fine: 0, daysLate };
  }

  // First 10 days late: fixed 50 TK.
  if (daysLate <= 10) {
    return { fine: 50, daysLate };
  }

  // After 10 days: 50 TK plus 5 TK per additional day.
  const extraDays = daysLate - 10;

  return {
    fine: 50 + extraDays * 5,
    daysLate,
  };
}

export async function GET() {
  try {
    // Derive the owner from the verified Clerk session, not a URL parameter.
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized", books: [] },
        { status: 401 },
      );
    }

    await connectDB();

    const books = await UserBook.find({ userId })
      .populate("bookId")
      .sort({ createdAt: -1 });

    const enrichedBooks = books.map((record: any) => {
      const dueDate = record.dueDate;
      const fineData = dueDate
        ? calculateFine(dueDate)
        : { fine: 0, daysLate: 0 };

      return {
        ...record.toObject(),
        fine: fineData.fine,
        daysLate: fineData.daysLate,
        isOverdue: fineData.daysLate > 0,
      };
    });

    return NextResponse.json({
      success: true,
      books: enrichedBooks,
    });
  } catch (error) {
    console.error("USER BOOKS ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to load books", books: [] },
      { status: 500 },
    );
  }
}
