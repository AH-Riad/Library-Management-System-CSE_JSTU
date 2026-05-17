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
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        requests: [],
      },
      { status: 500 },
    );
  }
}
