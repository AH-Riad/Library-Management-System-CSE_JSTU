import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import UserBook from "@/models/UserBook";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { requestId } = await req.json();

    const record = await UserBook.findById(requestId);

    if (!record) {
      return NextResponse.json(
        { success: false, message: "Not found" },
        { status: 404 },
      );
    }

    record.status = "return_pending";
    await record.save();

    return NextResponse.json({
      success: true,
      message: "Return request sent",
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
