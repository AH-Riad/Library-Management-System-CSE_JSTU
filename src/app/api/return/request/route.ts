import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import UserBook from "@/models/UserBook";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { userId } = await auth();
    const { requestId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const record = await UserBook.findById(requestId);

    if (!record) {
      return NextResponse.json(
        { success: false, message: "Record not found" },
        { status: 404 },
      );
    }

    if (record.status !== "issued") {
      return NextResponse.json(
        { success: false, message: "Only issued books can be returned" },
        { status: 400 },
      );
    }

    // mark as return requested (NEW STATUS)
    record.status = "return_requested";

    await record.save();

    return NextResponse.json({
      success: true,
      message: "Return request sent to admin",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
