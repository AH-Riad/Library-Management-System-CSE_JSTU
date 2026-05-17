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

    try {
      await connectDB();

      const now = new Date();

      // ✅ ONLY ACTIVE ISSUED BOOKS (STRICT FILTER)
      const issuedBooks = await UserBook.find({
        status: "issued",
        returnDate: { $exists: false },
      }).populate("bookId");

      const client = await clerkClient();

      for (const record of issuedBooks as any[]) {
        // 🔥 HARD SAFETY GUARD
        if (record.status !== "issued") continue;
        if (record.returnDate) continue;

        if (!record.dueDate) continue;

        const due = new Date(record.dueDate);

        const diffDays = Math.ceil(
          (now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24),
        );

        const fine = calculateFine(diffDays);

        const bookTitle = record.bookId?.title || "Unknown Book";

        // 💰 Update fine ONLY for active issued books
        record.fine = fine;

        // ======================
        // 📧 DAY 8 REMINDER
        // ======================
        if (diffDays === 8 && !record.reminderSent) {
          try {
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
          } catch (err) {
            console.log("Reminder email error:", err);
          }
        }

        // ======================
        // ⚠️ OVERDUE EMAIL
        // ======================
        if (diffDays >= 10 && !record.overdueAlertSent) {
          try {
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
          } catch (err) {
            console.log("Overdue email error:", err);
          }
        }

        await record.save();
      }

      console.log("✅ Cron job completed");
    } catch (error) {
      console.log("❌ Cron error:", error);
    }
  });
}
