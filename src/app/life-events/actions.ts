"use server";

import { createLifeEvent } from "@/lib/life-events";
import {
  type ActionResult,
  parseFormString,
  revalidateAppPaths,
} from "@/lib/action-utils";

export async function submitLifeEventAction(
  formData: FormData,
): Promise<ActionResult> {
  const type = parseFormString(formData, "type");
  const name = parseFormString(formData, "name");
  const dateStr = parseFormString(formData, "date");
  const notes = parseFormString(formData, "notes");

  if (type !== "birth" && type !== "yahrzeit") {
    return { ok: false, error: "נא לבחור סוג אירוע (יום הולדת או אזכרה)." };
  }
  if (!name) {
    return { ok: false, error: "נא להזין שם." };
  }
  if (!dateStr) {
    return { ok: false, error: "נא להזין תאריך." };
  }

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) {
    return { ok: false, error: "תאריך לא תקין." };
  }

  await createLifeEvent({
    type: type as "birth" | "yahrzeit",
    name,
    date,
    notes: notes || undefined,
  });

  revalidateAppPaths();
  return { ok: true };
}
