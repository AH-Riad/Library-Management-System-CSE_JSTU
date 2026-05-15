import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function GET() {
  try {
    await sendEmail(
      "riadk910@gmail.com",
      "Test Email - JSTU Library System",
      "If you received this, your email system is working perfectly 🚀",
    );

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Email failed",
      error,
    });
  }
}
