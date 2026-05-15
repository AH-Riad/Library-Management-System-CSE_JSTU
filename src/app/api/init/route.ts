import { initJobs } from "@/lib/startup";

initJobs();

export async function GET() {
  return Response.json({ success: true });
}
