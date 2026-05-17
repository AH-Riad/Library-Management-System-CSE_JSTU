import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import UserBook from "@/models/UserBook";
import "@/models/Book";

function calculateFine(dueDate: Date | string) {
  const due = new Date(dueDate);
  const now = new Date();

  const diffTime = now.getTime() - due.getTime();
  const daysLate = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // not late
  if (daysLate <= 0) {
    return { fine: 0, daysLate };
  }

  // 🔥 first 10 days late = fixed 50 TK
  if (daysLate <= 10) {
    return { fine: 50, daysLate };
  }

  // 🔥 after 10 days = 50 + 5 per day
  const extraDays = daysLate - 10;

  return {
    fine: 50 + extraDays * 5,
    daysLate,
  };
}

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
      .populate("bookId")
      .sort({ createdAt: -1 });

    // 🔥 ENRICH WITH FINE DATA
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
    console.log("USER BOOKS ERROR:", error);

    return NextResponse.json({
      success: false,
      books: [],
    });
  }
}
