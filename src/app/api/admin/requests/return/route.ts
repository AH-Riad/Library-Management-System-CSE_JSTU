import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import UserBook from "@/models/UserBook";
import Book from "@/models/Book";

import { clerkClient } from "@clerk/nextjs/server";

export async function GET() {
  try {
    await connectDB();

    const requests = await UserBook.find({
      status: "return_pending",
    })
      .populate("bookId")
      .sort({ createdAt: -1 });

    const client = await clerkClient();

    const formattedRequests = await Promise.all(
      requests.map(async (request: any) => {
        try {
          const user = await client.users.getUser(request.userId);

          return {
            ...request.toObject(),

            userName:
              `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
              "Unknown User",

            userEmail: user.emailAddresses?.[0]?.emailAddress || "No Email",
          };
        } catch {
          return {
            ...request.toObject(),
            userName: "Unknown User",
            userEmail: "No Email",
          };
        }
      }),
    );

    return NextResponse.json({
      success: true,
      requests: formattedRequests,
    });
  } catch (err) {
    console.log(err);

    return NextResponse.json({
      success: false,
      requests: [],
    });
  }
}

// ADMIN APPROVE RETURN
export async function POST(req: Request) {
  try {
    await connectDB();

    const { requestId } = await req.json();

    const record = await UserBook.findById(requestId);

    if (!record) {
      return NextResponse.json({ success: false }, { status: 404 });
    }

    record.status = "returned";
    record.returnDate = new Date();

    await record.save();

    const book = await Book.findById(record.bookId);

    if (book) {
      book.availableCopies += 1;
      await book.save();
    }

    return NextResponse.json({
      success: true,
      message: "Book returned successfully",
    });
  } catch (err) {
    console.log(err);

    return NextResponse.json({ success: false }, { status: 500 });
  }
}
