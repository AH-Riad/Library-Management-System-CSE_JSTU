import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import UserBook from "@/models/UserBook";
import "@/models/Book";
import { clerkClient } from "@clerk/nextjs/server";

export async function GET() {
  try {
    await connectDB();

    const requests = await UserBook.find({
      status: "pending",
    })
      .populate({
        path: "bookId",
        select: "title author category image",
      })
      .sort({ createdAt: -1 })
      .lean();

    const client = await clerkClient();

    const formattedRequests = await Promise.all(
      requests.map(async (request: any) => {
        let userName = "Unknown User";
        let userEmail = "No Email";

        try {
          const user = await client.users.getUser(request.userId);

          userName =
            `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
            "Unknown User";

          userEmail = user.emailAddresses?.[0]?.emailAddress || "No Email";
        } catch {}

        return {
          ...request,
          userName,
          userEmail,
        };
      }),
    );

    return NextResponse.json({
      success: true,
      requests: formattedRequests,
    });
  } catch (error) {
    return NextResponse.json({ success: false, requests: [] }, { status: 500 });
  }
}
