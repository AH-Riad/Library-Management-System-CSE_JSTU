import { startReminderJob } from "./reminderJob";

let started = false;

export function initJobs() {
  if (started) return;
  started = true;

  startReminderJob();
}
