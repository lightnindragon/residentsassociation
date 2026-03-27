"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function MessageFilters({
  admins,
}: {
  admins: Array<{ id: string; name: string; email: string }>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get("status") || "all";
  const currentAssignee = searchParams.get("assignee") || "all";

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="mt-4 flex flex-wrap items-center gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4">
      <div className="flex items-center gap-2">
        <label htmlFor="status-filter" className="text-sm font-medium">
          Status:
        </label>
        <select
          id="status-filter"
          value={currentStatus}
          onChange={(e) => updateFilters("status", e.target.value)}
          className="rounded border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-1.5 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="unresponded">Unresponded</option>
          <option value="open">Open</option>
          <option value="replied">Replied</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="assignee-filter" className="text-sm font-medium">
          Assigned to:
        </label>
        <select
          id="assignee-filter"
          value={currentAssignee}
          onChange={(e) => updateFilters("assignee", e.target.value)}
          className="rounded border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-1.5 text-sm"
        >
          <option value="all">Anyone</option>
          <option value="unassigned">Unassigned (General)</option>
          {admins.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
