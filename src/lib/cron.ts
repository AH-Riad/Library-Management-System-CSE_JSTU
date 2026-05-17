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

    // ✅ ONLY ISSUED BOOKS
    const issuedBooks = await UserBook.find({
      status: "issued",
    }).populate("bookId");

    const client = await clerkClient();

    for (const record of issuedBooks as any[]) {
      if (!record.dueDate) continue;

      const due = new Date(record.dueDate);

      const diffDays = Math.ceil(
        (now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24),
      );

      const fine = calculateFine(diffDays);

      const bookTitle = record.bookId?.title || "Unknown Book";

      // ✅ ALWAYS update fine ONLY for issued books
      record.fine = diffDays > 7 ? fine : 0;
      record.daysLate = diffDays > 0 ? diffDays : 0;
      record.isOverdue = diffDays > 7;

      // ======================
      // REMINDER
      // ======================
      if (diffDays === 8 && !record.reminderSent) {
        const user = await client.users.getUser(record.userId);
        const email = user.emailAddresses?.[0]?.emailAddress;

        if (email) {
          await sendEmail(
            email,
            "📚 Library Reminder",
            `
              <h2>Reminder</h2>
              <p><b>${bookTitle}</b> is due soon.</p>
            `,
          );
        }

        record.reminderSent = true;
      }

      // ======================
      // OVERDUE ALERT
      // ======================
      if (diffDays >= 10 && !record.overdueAlertSent) {
        const user = await client.users.getUser(record.userId);
        const email = user.emailAddresses?.[0]?.emailAddress;

        if (email) {
          await sendEmail(
            email,
            "⚠️ Overdue Notice",
            `
              <h2>Overdue</h2>
              <p><b>${bookTitle}</b> is overdue.</p>
              <p>Fine: ${fine} TK</p>
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
