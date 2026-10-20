import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import UserBook from "@/models/UserBook";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { requestId } = await req.json();

    if (!requestId || typeof requestId !== "string") {
      return NextResponse.json(
        { success: false, message: "Missing request ID" },
        { status: 400 },
      );
    }

    await connectDB();

    // Only allow the signed-in owner to request a return for their own record.
    const record = await UserBook.findOne({ _id: requestId, userId });

    if (!record) {
      return NextResponse.json(
        { success: false, message: "Book record not found" },
        { status: 404 },
      );
    }

    if (record.status !== "issued") {
      return NextResponse.json({
        success: false,
        message: "Already processed",
      });
    }

    record.status = "return_pending";
    await record.save();

    return NextResponse.json({
      success: true,
      message: "Return request sent",
    });
  } catch (error) {
    console.error("RETURN REQUEST ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
