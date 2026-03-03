"use server";

import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";

export async function saveEntry(formData: FormData) {
  const dateStr = formData.get("date") as string;
  const startStr = formData.get("start") as string;
  const endStr = formData.get("end") as string;

  if (!dateStr || !startStr || !endStr) return;

  const startObj = new Date(`2000-01-01T${startStr}`);
  const limitObj = new Date(`2000-01-01T07:00`);
  const endObj = new Date(`2000-01-01T${endStr}`);

  let effectiveStart = startObj;
  if (startObj > limitObj) {
    effectiveStart = new Date(`2000-01-01T08:00`);
  }

  let diff = (endObj.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60);
  if (diff > 5) diff -= 1;
  const hoursWorked = Math.max(0, diff);

  await sql`
    INSERT INTO ojt_logs (date, start_time, end_time, hours_worked) 
    VALUES (${dateStr}, ${startStr}, ${endStr}, ${hoursWorked})
  `;

  revalidatePath("/");
}