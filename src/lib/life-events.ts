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

const events: LifeEvent[] = [];

function nextId(): LifeEventId {
  return `le_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

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

export function getUpcomingLifeEvents(daysAhead: number = 60): UpcomingLifeEvent[] {
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setDate(to.getDate() + daysAhead);

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

export function getAllLifeEvents(): LifeEvent[] {
  return [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

export function createLifeEvent(
  data: Omit<LifeEvent, "id" | "createdAt">
): LifeEvent {
  const event: LifeEvent = {
    ...data,
    id: nextId(),
    date: new Date(data.date),
    createdAt: new Date(),
  };
  events.push(event);
  return event;
}

export function deleteLifeEvent(id: LifeEventId): boolean {
  const idx = events.findIndex((e) => e.id === id);
  if (idx === -1) return false;
  events.splice(idx, 1);
  return true;
}
