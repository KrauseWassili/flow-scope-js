import { db } from "./client";
import { events } from "./schema";

export async function insertEvent(event: Omit<typeof events.$inferInsert, "id" | "timestamp">) {
  const [inserted] = await db
    .insert(events)
    .values(event)
    .returning();

  return inserted;
}

export async function getAllEvents() {
  return db.select().from(events).orderBy(events.timestamp);
}
