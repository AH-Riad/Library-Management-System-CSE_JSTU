import cron from "node-cron";
import { connectDB } from "@/lib/mongodb";
import UserBook from "@/models/UserBook";
import { sendEmail } from "./sendEmail";
import { clerkClient } from "@clerk/nextjs/server";

function calculateFine(daysLate: number) {
  if (daysLate <= 7) return 0;
  if (daysLate <= 10) return 50;
  return 50 + (daysLate - 10) * 5;
}

export function startCronJobs() {
  cron.schedule("* * * * *", async () => {
    console.log("📚 Library cron running...");

    await connectDB();

    const now = new Date();

    const issuedBooks = await UserBook.find({
      status: "issued",
    }).populate("bookId");

    // ✅ FIX: MUST CALL clerkClient()
    const client = await clerkClient();

    for (const record of issuedBooks as any[]) {
      if (!record.dueDate) continue;

      const due = new Date(record.dueDate);

      const diffDays = Math.ceil(
        (now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24),
      );

      const fine = calculateFine(diffDays);

      const bookTitle = record.bookId?.title || "Unknown Book";

      // 💰 always update fine
      record.fine = fine;

      // ======================
      // 📧 DAY 8 REMINDER
      // ======================
      if (diffDays === 8 && !record.reminderSent) {
        const user = await client.users.getUser(record.userId);
        const email = user.emailAddresses?.[0]?.emailAddress;

        if (email) {
          await sendEmail(
            email,
            "📚 Library Reminder - Book Due Soon",
            `
              <h2>Reminder</h2>
              <p>Your book <b>${bookTitle}</b> is due soon.</p>
              <p>Please return it within 2 days to avoid fine.</p>
            `,
          );
        }

        record.reminderSent = true;
      }

      // ======================
      // ⚠️ OVERDUE EMAIL
      // ======================
      if (diffDays >= 10 && !record.overdueAlertSent) {
        const user = await client.users.getUser(record.userId);
        const email = user.emailAddresses?.[0]?.emailAddress;

        if (email) {
          await sendEmail(
            email,
            "⚠️ Overdue Book Notice",
            `
              <h2>Overdue Notice</h2>
              <p>Your book <b>${bookTitle}</b> is overdue.</p>
              <p>Current fine: <b>${fine} TK</b></p>
            `,
          );
        }

        record.overdueAlertSent = true;
      }

      await record.save();
    }

    console.log("✅ Cron job completed");
  });
}
