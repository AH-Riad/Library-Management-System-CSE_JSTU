import cron from "node-cron";
import UserBook from "@/models/UserBook";
import Book from "@/models/Book";
import { sendEmail } from "./email";
import { connectDB } from "@/lib/mongodb";

export const startReminderJob = () => {
  cron.schedule("0 9 * * *", async () => {
    try {
      await connectDB();
      console.log("Running 5th-day reminder job...");

      const issuedBooks = await UserBook.find({
        status: "issued",
      }).populate("bookId");

      const now = new Date();

      for (const record of issuedBooks) {
        const issueDate = new Date(record.issueDate);

        const diffDays = Math.floor(
          (now.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24),
        );

        // 5th day reminder
        if (diffDays === 5) {
          await sendEmail(
            record.userId,
            "Library Book Reminder - JSTU Library",
            `Reminder: You must return your book "${record.bookId.title}" in 2 days.`,
          );
        }
      }
    } catch (error) {
      console.error("Reminder job error:", error);
    }
  });
};
