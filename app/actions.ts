"use server";

import { createPool } from "@vercel/postgres";
import { revalidatePath } from "next/cache";

export async function saveEntry(formData: FormData) {
  const dateStr = formData.get("date") as string;
  const startStr = formData.get("start") as string;
  const endStr = formData.get("end") as string;

  if (!dateStr || !startStr || !endStr) return;

  // Logic for the 7AM rule
  const startObj = new Date(`2000-01-01T${startStr}`);
  const limitObj = new Date(`2000-01-01T07:00`);
  const endObj = new Date(`2000-01-01T${endStr}`);

  let effectiveStart = startObj;
  if (startObj > limitObj) {
    effectiveStart = new Date(`2000-01-01T08:00`);
  }

  let diff = (endObj.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60);
  if (diff > 5) diff -= 1; // Lunch break
  const hoursWorked = Math.max(0, diff);

  try {
    const db = createPool(); // This manually opens the connection
    await db.query(
      `INSERT INTO ojt_logs (date, start_time, end_time, hours_worked) 
       VALUES ($1, $2, $3, $4)`,
      [dateStr, startStr, endStr, hoursWorked]
    );
    
    revalidatePath("/"); 
  } catch (error) {
    console.error("Database Error:", error);
    throw error;
  }
}