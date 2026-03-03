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
  
  // Rule: If late (after 7:00 AM), start counts as 8:00 AM
  if (startObj > limitObj) {
    effectiveStart = new Date(`2000-01-01T08:00`);
  }

  // Calculate difference in hours
  let diff = (endObj.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60);
  
  // Rule: Subtract 1 hour for lunch if shift > 5 hours
  if (diff > 5) diff -= 1;

  // --- THE FIX: FLAT VALUES ONLY ---
  // Math.floor turns 7.9 or 7.5 into exactly 7.
  const hoursWorked = Math.floor(Math.max(0, diff));

  await sql`
    INSERT INTO ojt_logs (date, start_time, end_time, hours_worked) 
    VALUES (${dateStr}, ${startStr}, ${endStr}, ${hoursWorked})
  `;

  revalidatePath("/");
}
