"use client";

import { deleteEvent } from "@/app/admin/actions/events";

export function DeleteEventButton({ eventId }: { eventId: string }) {
  return (
    <form
      action={async () => {
        if (typeof window !== "undefined" && !confirm("Delete this event?")) return;
        await deleteEvent(eventId);
      }}
      className="inline"
    >
      <button type="submit" className="text-red-600 hover:underline dark:text-red-400">
        Delete
      </button>
    </form>
  );
}
