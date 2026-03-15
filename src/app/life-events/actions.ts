"use server";

import { revalidatePath } from "next/cache";
import { createLifeEvent } from "@/lib/life-events";

export async function submitLifeEventAction(formData: FormData) {
  const type = formData.get("type") as string | null;
  const name = (formData.get("name") as string | null)?.trim();
  const dateStr = formData.get("date") as string | null;
  const notes = (formData.get("notes") as string | null)?.trim();

  if (!type || type !== "birth" && type !== "yahrzeit") {
    return { success: false, error: "נא לבחור סוג אירוע (יום הולדת או אזכרה)." };
  }
  if (!name) {
    return { success: false, error: "נא להזין שם." };
  }
  if (!dateStr) {
    return { success: false, error: "נא להזין תאריך." };
  }

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) {
    return { success: false, error: "תאריך לא תקין." };
  }

  createLifeEvent({
    type: type as "birth" | "yahrzeit",
    name,
    date,
    notes: notes || undefined,
  });

  revalidatePath("/life-events");
  return { success: true };
}
