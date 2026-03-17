export type LifeEventId = string;

export type LifeEventType = "birth" | "yahrzeit";

export type LifeEvent = {
  id: LifeEventId;
  type: LifeEventType;
  name: string;
  /** Civil date (for birth: birthday; for yahrzeit: date of passing). */
  date: Date;
  householdId?: string;
  notes?: string;
  createdAt: Date;
};
import { dbCreateLifeEvent, dbGetLifeEvents } from "@/lib/db-life-events";

/** Next occurrence of this event (anniversary) on or after refDate. */
function getNextOccurrence(event: LifeEvent, refDate: Date): Date {
  const d = new Date(event.date);
  const ref = new Date(refDate);
  d.setFullYear(ref.getFullYear());
  if (d.getTime() < ref.getTime()) {
    d.setFullYear(d.getFullYear() + 1);
  }
  return d;
}

export type UpcomingLifeEvent = LifeEvent & {
  nextDate: Date;
  label: string;
};

export async function getUpcomingLifeEvents(daysAhead: number = 60): Promise<UpcomingLifeEvent[]> {
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setDate(to.getDate() + daysAhead);

  const events = await dbGetLifeEvents();
  const result: UpcomingLifeEvent[] = [];
  for (const event of events) {
    const next = getNextOccurrence(event, from);
    if (next.getTime() > to.getTime()) continue;
    result.push({
      ...event,
      nextDate: next,
      label:
        event.type === "birth"
          ? `יום הולדת – ${event.name}`
          : `אזכרה – ${event.name}`,
    });
  }
  result.sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime());
  return result;
}

export async function getAllLifeEvents(): Promise<LifeEvent[]> {
  return dbGetLifeEvents();
}

export function createLifeEvent(
  data: Omit<LifeEvent, "id" | "createdAt">
): Promise<LifeEvent> {
  return dbCreateLifeEvent({
    type: data.type,
    name: data.name,
    date: new Date(data.date),
    householdId: data.householdId,
    notes: data.notes,
  });
}

// Note: delete is currently unused; add DB delete when needed.
