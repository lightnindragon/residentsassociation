"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import {
  createCalendarEvent,
  deleteCalendarEvent,
  updateCalendarEvent,
  type CalendarEvent,
} from "@/app/admin/actions/calendar";
import { Button, Input, Textarea } from "@/components/ui";
import { toast } from "sonner";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function toDateInput(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  return `${toDateInput(iso)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function eventTouchesDay(event: CalendarEvent, day: Date): boolean {
  const start = startOfDay(new Date(event.starts_at));
  const end = startOfDay(new Date(event.ends_at || event.starts_at));
  const t = startOfDay(day).getTime();
  return t >= start.getTime() && t <= end.getTime();
}

function monthCells(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const mondayOffset = (first.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - mondayOffset);
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) {
    cells.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  }
  return cells;
}

type Draft = {
  id?: string;
  title: string;
  description: string;
  location: string;
  allDay: boolean;
  startsAt: string;
  endsAt: string;
};

function draftFromDay(day: Date): Draft {
  const date = `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}`;
  return {
    title: "",
    description: "",
    location: "",
    allDay: true,
    startsAt: `${date}T09:00`,
    endsAt: "",
  };
}

function draftFromEvent(event: CalendarEvent): Draft {
  return {
    id: event.id,
    title: event.title,
    description: event.description ?? "",
    location: event.location ?? "",
    allDay: event.all_day,
    startsAt: event.all_day ? toDateInput(event.starts_at) : toDatetimeLocal(event.starts_at),
    endsAt: event.ends_at
      ? event.all_day
        ? toDateInput(event.ends_at)
        : toDatetimeLocal(event.ends_at)
      : "",
  };
}

export function AdminCalendar({ events }: { events: CalendarEvent[] }) {
  const today = new Date();
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selected, setSelected] = useState<Date>(startOfDay(today));
  const [draft, setDraft] = useState<Draft | null>(null);
  const [deleting, setDeleting] = useState(false);

  const cells = useMemo(() => monthCells(cursor.year, cursor.month), [cursor]);
  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const selectedEvents = events.filter((e) => eventTouchesDay(e, selected));

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <button
            type="button"
            className="rounded-lg px-3 py-1.5 text-sm hover:bg-[var(--color-surface)]"
            onClick={() =>
              setCursor((c) =>
                c.month === 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: c.month - 1 }
              )
            }
          >
            Previous
          </button>
          <h2 className="font-heading text-lg font-semibold">{monthLabel}</h2>
          <button
            type="button"
            className="rounded-lg px-3 py-1.5 text-sm hover:bg-[var(--color-surface)]"
            onClick={() =>
              setCursor((c) =>
                c.month === 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: c.month + 1 }
              )
            }
          >
            Next
          </button>
        </div>
        <div className="grid grid-cols-7 gap-px text-center text-xs font-medium text-[var(--color-muted)]">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-2">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px rounded-lg bg-[var(--color-border)]">
          {cells.map((day) => {
            const inMonth = day.getMonth() === cursor.month;
            const isSelected = startOfDay(day).getTime() === startOfDay(selected).getTime();
            const isToday = startOfDay(day).getTime() === startOfDay(today).getTime();
            const dayEvents = events.filter((e) => eventTouchesDay(e, day));
            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => {
                  setSelected(startOfDay(day));
                  setDraft(null);
                }}
                className={`min-h-[5.5rem] bg-[var(--color-card)] p-1.5 text-left ${
                  inMonth ? "" : "opacity-40"
                } ${isSelected ? "ring-2 ring-inset ring-[var(--color-primary)]" : ""}`}
              >
                <span
                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                    isToday
                      ? "bg-[var(--color-primary)] font-semibold text-white"
                      : "text-[var(--foreground)]"
                  }`}
                >
                  {day.getDate()}
                </span>
                <ul className="mt-1 space-y-0.5">
                  {dayEvents.slice(0, 3).map((e) => (
                    <li
                      key={e.id}
                      className="truncate rounded bg-[var(--color-primary-muted)] px-1 py-0.5 text-[10px] text-[var(--color-primary-hover)]"
                    >
                      {e.title}
                    </li>
                  ))}
                  {dayEvents.length > 3 && (
                    <li className="text-[10px] text-[var(--color-muted)]">
                      +{dayEvents.length - 3} more
                    </li>
                  )}
                </ul>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 shadow-sm">
        <h2 className="font-heading text-lg font-semibold">
          {selected.toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </h2>
        <Button
          type="button"
          className="mt-3 w-full"
          onClick={() => setDraft(draftFromDay(selected))}
        >
          Add event
        </Button>

        {draft ? (
          <EventEditor
            key={draft.id ?? "new"}
            draft={draft}
            onCancel={() => setDraft(null)}
            onDelete={
              draft.id
                ? async () => {
                    setDeleting(true);
                    const res = await deleteCalendarEvent(draft.id!);
                    setDeleting(false);
                    if (res.ok) {
                      toast.success("Event deleted.");
                      setDraft(null);
                    } else {
                      toast.error(res.error || "Could not delete.");
                    }
                  }
                : undefined
            }
            deleting={deleting}
          />
        ) : selectedEvents.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--color-muted)]">No events on this day.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {selectedEvents.map((e) => (
              <li key={e.id}>
                <button
                  type="button"
                  className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-left hover:bg-[var(--color-surface)]/50"
                  onClick={() => setDraft(draftFromEvent(e))}
                >
                  <p className="text-sm font-medium">{e.title}</p>
                  <p className="text-xs text-[var(--color-muted)]">
                    {e.all_day
                      ? "All day"
                      : new Date(e.starts_at).toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                    {e.location ? ` · ${e.location}` : ""}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function EventEditor({
  draft,
  onCancel,
  onDelete,
  deleting,
}: {
  draft: Draft;
  onCancel: () => void;
  onDelete?: () => void;
  deleting: boolean;
}) {
  const isEdit = !!draft.id;
  const boundUpdate = draft.id
    ? (prev: unknown, formData: FormData) => updateCalendarEvent(draft.id!, prev, formData)
    : createCalendarEvent;
  const [state, formAction] = useActionState(boundUpdate, null);
  const last = useRef<typeof state>(null);
  const [allDay, setAllDay] = useState(draft.allDay);

  useEffect(() => {
    if (!state || state === last.current) return;
    last.current = state;
    if (state.ok) {
      toast.success(isEdit ? "Event updated." : "Event added.");
      onCancel();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [isEdit, onCancel, state]);

  const startName = "starts_at";
  const startType = allDay ? "date" : "datetime-local";
  const startValue = allDay ? draft.startsAt.slice(0, 10) : draft.startsAt;
  const endValue = allDay ? draft.endsAt.slice(0, 10) : draft.endsAt;

  return (
    <form action={formAction} className="mt-4 flex flex-col gap-3">
      <Input label="Title" name="title" defaultValue={draft.title} required />
      <Input label="Location" name="location" defaultValue={draft.location} />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="all_day"
          value="1"
          checked={allDay}
          onChange={(e) => setAllDay(e.target.checked)}
        />
        All day
      </label>
      <Input label="Starts" name={startName} type={startType} defaultValue={startValue} required />
      <Input label="Ends (optional)" name="ends_at" type={startType} defaultValue={endValue} />
      <Textarea label="Notes" name="description" defaultValue={draft.description} rows={3} />
      <div className="flex flex-wrap gap-2">
        <Button type="submit">{isEdit ? "Save" : "Add"}</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        {onDelete && (
          <Button type="button" variant="outline" disabled={deleting} onClick={onDelete}>
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        )}
      </div>
    </form>
  );
}