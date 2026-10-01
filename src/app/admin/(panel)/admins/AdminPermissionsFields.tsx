"use client";

import { useMemo, useState } from "react";
import { ASSIGNABLE_ADMIN_PERMISSIONS } from "@/lib/admin-nav";

export function AdminPermissionsFields({
  defaultKeys,
  disabled,
  onChange,
}: {
  defaultKeys?: string[] | null;
  disabled?: boolean;
  onChange?: (keys: string[] | null) => void;
}) {
  const allKeys = ASSIGNABLE_ADMIN_PERMISSIONS.map((p) => p.key);
  const [fullAccess, setFullAccess] = useState(defaultKeys == null);
  const [selected, setSelected] = useState<string[]>(
    defaultKeys == null ? allKeys : defaultKeys.filter((k) => (allKeys as string[]).includes(k))
  );

  function emit(nextFull: boolean, nextSelected: string[]) {
    onChange?.(nextFull ? null : nextSelected);
  }

  const sections = useMemo(() => {
    const map = new Map<string, typeof ASSIGNABLE_ADMIN_PERMISSIONS>();
    for (const item of ASSIGNABLE_ADMIN_PERMISSIONS) {
      const list = map.get(item.section) ?? [];
      list.push(item);
      map.set(item.section, list);
    }
    return Array.from(map.entries());
  }, []);

  if (disabled) {
    return (
      <p className="text-sm text-[var(--color-muted)]">
        Dev accounts can open every admin section.
      </p>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--color-border)] p-3">
      <p className="text-sm font-medium text-[var(--foreground)]">Admin panel access</p>
      <p className="mt-1 text-xs text-[var(--color-muted)]">
        Dashboard is always available. Untick a section to hide it from this admin.
      </p>
      <label className="mt-3 flex items-center gap-2">
        {fullAccess && <input type="hidden" name="permissions_all" value="1" />}
        <input
          type="checkbox"
          checked={fullAccess}
          onChange={(e) => {
            const on = e.target.checked;
            setFullAccess(on);
            if (on) {
              setSelected(allKeys);
              emit(true, allKeys);
            } else {
              emit(false, selected);
            }
          }}
        />
        <span className="text-sm font-medium">All sections</span>
      </label>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        {sections.map(([title, items]) => (
          <div key={title}>
            <p className="mb-1.5 text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
              {title}
            </p>
            <ul className="space-y-1">
              {items.map((item) => (
                <li key={item.key}>
                  <label className="flex items-start gap-2">
                    {!fullAccess && selected.includes(item.key) && (
                      <input type="hidden" name="permissions" value={item.key} />
                    )}
                    <input
                      type="checkbox"
                      checked={fullAccess || selected.includes(item.key)}
                      disabled={fullAccess}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...selected, item.key]
                          : selected.filter((k) => k !== item.key);
                        setSelected(next);
                        emit(false, next);
                      }}
                    />
                    <span className="text-sm">{item.label}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
