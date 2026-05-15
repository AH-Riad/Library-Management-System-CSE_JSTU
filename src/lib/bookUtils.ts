import UserBook from "@/models/UserBook";

export async function updateOverdue(record: any) {
  if (!record.dueDate || record.status !== "issued") return record;

  const now = new Date();

  if (now > record.dueDate) {
    const diffDays = Math.ceil(
      (now.getTime() - record.dueDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    record.status = "overdue";
    record.fine = diffDays * 10; // 10 TK per day

    await record.save();
  }

  return record;
}
