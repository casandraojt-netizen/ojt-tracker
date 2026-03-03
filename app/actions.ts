"use server";
import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";

export async function saveEntry(formData: FormData) {
  const date = formData.get("date") as string;
  const start = formData.get("start") as string;
  const end = formData.get("end") as string;

  // --- THE LOGIC ---
  let startTime = new Date(`${date}T${start}`);
  const limitTime = new Date(`${date}T07:00`);
  const endTime = new Date(`${date}T${end}`);

  // Rule: If late (after 7:00 AM), start counts as 8:00 AM
  let effectiveStart = startTime;
  if (startTime > limitTime) {
    effectiveStart = new Date(`${date}T08:00`);
  }

  // Calculate difference
  let diff = (endTime.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60);
  
  // Rule: 1 hr lunch deduction if shift is > 5 hours
  if (diff > 5) diff -= 1;
  const hoursWorked = Math.max(0, diff);

  // Save to Vercel Postgres
  await sql`
    INSERT INTO ojt_logs (date, start_time, end_time, hours_worked)
    VALUES (${date}, ${start}, ${end}, ${hoursWorked})
  `;

  revalidatePath("/"); // Refresh the page to show new data
}