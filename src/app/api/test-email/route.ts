import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function GET() {
  try {
    await sendEmail(
      "abunaimpias2002@gmail.com",
      "Test Email - JSTU Library System",
      "Hi Pias Abunaim, this is a test email from the JSTU Library System. If you received this email, it means the email functionality is working correctly. Thank you for using our system!",
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
