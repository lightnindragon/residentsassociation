"use client";

import {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type DragEvent,
  type ReactNode,
  type SetStateAction,
} from "react";
import { saveNavMenu } from "@/app/admin/actions/nav-menus";
import { Button } from "@/components/ui";
import { toast } from "sonner";
import {
  NAV_PAGE_OPTIONS,
  type NavItem,
  type NavMenuKey,
} from "@/lib/nav-menu";
import type { SitePageOption } from "@/lib/site-pages";
import Link from "next/link";

type Depth = 0 | 1 | 2;

type FlatRow = {
  id: string;
  label: string;
  href: string;
  openInNewTab?: boolean;
  includeNewsCategories?: boolean;
  depth: Depth;
};

function newId(): string {
  return crypto.randomUUID();
}

function cloneItems(items: NavItem[]): NavItem[] {
  return items.map((item) => ({
    ...item,
    children: item.children ? cloneItems(item.children) : undefined,
  }));
}

function regenIds(items: NavItem[]): NavItem[] {
  return items.map((item) => ({
    ...item,
    id: newId(),
    children: item.children ? regenIds(item.children) : undefined,
  }));
}

function toItem(row: FlatRow): NavItem {
  const item: NavItem = {
    id: row.id,
    label: row.label.trim() || "Untitled",
    href: row.href,
  };
  if (row.openInNewTab) item.openInNewTab = true;
  if (row.includeNewsCategories) item.includeNewsCategories = true;
  return item;
}

function toFlat(items: NavItem[], depth: Depth = 0): FlatRow[] {
  const rows: FlatRow[] = [];
  for (const item of items) {
    const { children, ...rest } = item;
    rows.push({ ...rest, depth });
    if (children && depth < 2) {
      rows.push(...toFlat(children, (depth + 1) as Depth));
    }
  }
  return rows;
}

function fromFlat(rows: FlatRow[]): NavItem[] {
  const items: NavItem[] = [];
  const at: Array<NavItem | undefined> = [];
  for (const row of rows) {
    const item = toItem(row);
    let depth: Depth = row.depth;
    if (depth > 0 && !at[depth - 1]) depth = at[0] ? 1 : 0;
    if (depth === 0) {
      items.push(item);
      at.length = 0;
      at[0] = item;
      continue;
    }
    const parent = at[depth - 1];
    if (!parent) {
      items.push(item);
      at.length = 0;
      at[0] = item;
      continue;
    }
    parent.children = [...(parent.children ?? []), item];
    at.length = depth;
    at[depth] = item;
  }
  return items;
}

function blockRange(rows: FlatRow[], index: number): { start: number; end: number } {
  const depth = rows[index]?.depth ?? 0;
  let end = index;
  while (end + 1 < rows.length && rows[end + 1].depth > depth) end += 1;
  return { start: index, end };
}

function clampDepth(n: number): Depth {
  if (n <= 0) return 0;
  if (n >= 2) return 2;
  return 1;
}

function maxDepthAt(rows: FlatRow[], insertAt: number): Depth {
  if (insertAt <= 0) return 0;
  return clampDepth((rows[insertAt - 1]?.depth ?? 0) + 1);
}

function indentClass(depth: Depth): string {
  if (depth === 2) return "ml-16";
  if (depth === 1) return "ml-8";
  return "";
}

function pageTypeLabel(
  href: string,
  extraPages: SitePageOption[]
): string {
  if (!href) return "Heading";
  if (NAV_PAGE_OPTIONS.some((p) => p.href === href)) return "Page";
  if (href.startsWith("/planning-applications/")) return "Planning";
  if (extraPages.some((p) => p.href === href)) return "Page";
  return "Custom";
}

export function HeaderMenuEditor({
  desktop,
  mobile,
  customPages = [],
  planningPages = [],
}: {
  desktop: NavItem[];
  mobile: NavItem[];
  customPages?: SitePageOption[];
  planningPages?: SitePageOption[];
}) {
  const [tab, setTab] = useState<NavMenuKey>("desktop");
  const [desktopItems, setDesktopItems] = useState(() => cloneItems(desktop));
  const [mobileItems, setMobileItems] = useState(() => cloneItems(mobile));
  const items = tab === "desktop" ? desktopItems : mobileItems;
  const setItems = tab === "desktop" ? setDesktopItems : setMobileItems;

  return (
    <div className="mt-6">
      <div className="flex flex-wrap gap-2">
        <TabButton active={tab === "desktop"} onClick={() => setTab("desktop")}>
          Desktop menu
        </TabButton>
        <TabButton active={tab === "mobile"} onClick={() => setTab("mobile")}>
          Mobile menu
        </TabButton>
      </div>
      <p className="mt-3 text-sm text-[var(--color-muted)]">
        Drag to reorder. Drag right for a submenu, or further right for a sub-heading under that
        (for example Planning → Redrow → an application). Click an item to edit it. Sign in,
        Account, Forum and Admin stay in the header automatically.
      </p>
      <MenuEditor
        key={tab}
        menuKey={tab}
        items={items}
        customPages={customPages}
        planningPages={planningPages}
        setItems={setItems}
        onCopyFromOther={() => {
          if (tab === "mobile") setMobileItems(regenIds(desktopItems));
          else setDesktopItems(regenIds(mobileItems));
        }}
        copyLabel={tab === "mobile" ? "Copy desktop menu" : "Copy mobile menu"}
      />
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
        active
          ? "bg-[var(--color-primary)] text-white"
          : "border border-[var(--color-border)] hover:bg-[var(--color-border)]/30"
      }`}
    >
      {children}
    </button>
  );
}

function MenuEditor({
  menuKey,
  items,
  customPages,
  planningPages,
  setItems,
  onCopyFromOther,
  copyLabel,
}: {
  menuKey: NavMenuKey;
  items: NavItem[];
  customPages: SitePageOption[];
  planningPages: SitePageOption[];
  setItems: Dispatch<SetStateAction<NavItem[]>>;
  onCopyFromOther: () => void;
  copyLabel: string;
}) {
  const rows = useMemo(() => toFlat(items), [items]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [drop, setDrop] = useState<{ insertAt: number; depth: Depth } | null>(null);
  const [state, formAction] = useActionState(saveNavMenu, null);
  const last = useRef<typeof state>(null);

  useEffect(() => {
    if (!state || state === last.current) return;
    last.current = state;
    if (state.ok) toast.success("Header menu saved.");
    else if (state.error) toast.error(state.error);
  }, [state]);

  function commit(nextRows: FlatRow[]) {
    setItems(fromFlat(nextRows));
  }

  function patchRow(id: string, patch: Partial<FlatRow>) {
    commit(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  function removeRow(index: number) {
    const { start, end } = blockRange(rows, index);
    commit([...rows.slice(0, start), ...rows.slice(end + 1)]);
    if (openId && rows.slice(start, end + 1).some((r) => r.id === openId)) {
      setOpenId(null);
    }
  }

  function applyDrop(fromIndex: number, insertAt: number, depth: Depth) {
    const { start, end } = blockRange(rows, fromIndex);
    const block = rows.slice(start, end + 1);
    const without = [...rows.slice(0, start), ...rows.slice(end + 1)];
    let at = insertAt;
    if (insertAt > start) at = insertAt - (end - start + 1);
    at = Math.max(0, Math.min(at, without.length));
    const nextDepth = at === 0 ? 0 : clampDepth(Math.min(depth, maxDepthAt(without, at)));
    const base = block[0]?.depth ?? 0;
    const moved = block.map((row) => ({
      ...row,
      depth: clampDepth(row.depth - base + nextDepth),
    }));
    commit([...without.slice(0, at), ...moved, ...without.slice(at)]);
  }

  function updateDropFromPoint(targetIndex: number, clientX: number, clientY: number, el: HTMLElement) {
    const rect = el.getBoundingClientRect();
    const after = clientY > rect.top + rect.height / 2;
    const insertAt = after ? targetIndex + 1 : targetIndex;
    const x = clientX - rect.left;
    let wanted: Depth = 0;
    if (x > 72) wanted = 2;
    else if (x > 36) wanted = 1;
    setDrop({ insertAt, depth: clampDepth(Math.min(wanted, maxDepthAt(rows, insertAt))) });
  }

  return (
    <form action={formAction} className="mt-4">
      <input type="hidden" name="menu_key" value={menuKey} />
      <input type="hidden" name="items" value={JSON.stringify(items)} />

      <div className="mb-4 rounded-lg border border-[var(--color-header-border)] bg-[var(--color-header-bg)] px-4 py-2.5">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-chrome-muted)]">
          Preview
        </p>
        {menuKey === "desktop" ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium text-[var(--color-chrome-foreground)]">
            {items.map((item) => (
              <span key={item.id} className="inline-flex items-center gap-0.5">
                {item.label}
                {(item.children?.length || item.includeNewsCategories) && (
                  <span className="text-xs opacity-70">▾</span>
                )}
              </span>
            ))}
          </div>
        ) : (
          <PreviewList items={items} />
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[16.5rem_minmax(0,1fr)]">
        <AddItemsPanel
          customPages={customPages}
          planningPages={planningPages}
          onAdd={(added) => commit([...rows, ...added])}
        />

        <div>
          <h2 className="mb-2 text-sm font-semibold text-[var(--foreground)]">Menu structure</h2>
          <div
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)]"
            onDragOver={(e) => {
              if (dragIndex === null) return;
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (dragIndex !== null && drop) applyDrop(dragIndex, drop.insertAt, drop.depth);
              setDragIndex(null);
              setDrop(null);
            }}
          >
            {rows.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-[var(--color-muted)]">
                No items yet. Tick pages on the left and click Add to menu.
              </p>
            ) : (
              rows.map((row, index) => {
                const dragging = dragIndex !== null && index >= blockRange(rows, dragIndex).start && index <= blockRange(rows, dragIndex).end;
                const showLine = drop && drop.insertAt === index && dragIndex !== null;
                return (
                  <div key={row.id}>
                    {showLine && <DropLine depth={drop.depth} />}
                    <MenuRow
                      row={row}
                      extraPages={[...customPages, ...planningPages]}
                      open={openId === row.id}
                      dragging={dragging}
                      canNestNews={row.depth === 0}
                      onToggle={() => setOpenId((id) => (id === row.id ? null : row.id))}
                      onChange={(patch) => patchRow(row.id, patch)}
                      onRemove={() => removeRow(index)}
                      onDragStart={() => {
                        setDragIndex(index);
                        setDrop({ insertAt: index, depth: row.depth });
                      }}
                      onDragEnd={() => {
                        setDragIndex(null);
                        setDrop(null);
                      }}
                      onDragOverRow={(e) => {
                        if (dragIndex === null) return;
                        e.preventDefault();
                        e.stopPropagation();
                        e.dataTransfer.dropEffect = "move";
                        updateDropFromPoint(index, e.clientX, e.clientY, e.currentTarget);
                      }}
                    />
                  </div>
                );
              })
            )}
            {drop && dragIndex !== null && drop.insertAt === rows.length && (
              <DropLine depth={drop.depth} />
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="submit">Save {menuKey} menu</Button>
            <Button type="button" variant="ghost" onClick={onCopyFromOther}>
              {copyLabel}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

function PreviewList({ items }: { items: NavItem[] }) {
  return (
    <ul className="text-sm font-medium text-[var(--color-chrome-foreground)]">
      {items.map((item) => (
        <li key={item.id}>
          {item.label}
          {item.children && item.children.length > 0 && (
            <ul className="pl-4 text-[var(--color-chrome-muted)]">
              {item.children.map((child) => (
                <li key={child.id}>
                  {child.label}
                  {child.children && child.children.length > 0 && (
                    <ul className="pl-4">
                      {child.children.map((grand) => (
                        <li key={grand.id}>{grand.label}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}

function DropLine({ depth }: { depth: Depth }) {
  return (
    <div className={indentClass(depth)}>
      <div className="h-0.5 bg-[var(--color-primary)]" />
    </div>
  );
}

function AddItemsPanel({
  customPages,
  planningPages,
  onAdd,
}: {
  customPages: SitePageOption[];
  planningPages: SitePageOption[];
  onAdd: (rows: FlatRow[]) => void;
}) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [customLabel, setCustomLabel] = useState("");
  const [customHref, setCustomHref] = useState("");
  const [headingLabel, setHeadingLabel] = useState("");
  const allPages = [...NAV_PAGE_OPTIONS, ...customPages, ...planningPages];

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)]">
        <h2 className="border-b border-[var(--color-border)] px-3 py-2 text-sm font-semibold">
          Add pages
        </h2>
        <ul className="max-h-72 overflow-y-auto p-2">
          {NAV_PAGE_OPTIONS.map((p) => (
            <li key={p.href}>
              <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-[var(--color-surface)]/60">
                <input
                  type="checkbox"
                  checked={!!checked[p.href]}
                  onChange={(e) =>
                    setChecked((c) => ({ ...c, [p.href]: e.target.checked }))
                  }
                />
                {p.label}
              </label>
            </li>
          ))}
          {customPages.length > 0 && (
            <li className="px-2 pb-1 pt-2 text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
              Your pages
            </li>
          )}
          {customPages.map((p) => (
            <li key={p.href}>
              <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-[var(--color-surface)]/60">
                <input
                  type="checkbox"
                  checked={!!checked[p.href]}
                  onChange={(e) =>
                    setChecked((c) => ({ ...c, [p.href]: e.target.checked }))
                  }
                />
                {p.label}
              </label>
            </li>
          ))}
          {planningPages.length > 0 && (
            <li className="px-2 pb-1 pt-2 text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
              Planning applications
            </li>
          )}
          {planningPages.map((p) => (
            <li key={p.href}>
              <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-[var(--color-surface)]/60">
                <input
                  type="checkbox"
                  checked={!!checked[p.href]}
                  onChange={(e) =>
                    setChecked((c) => ({ ...c, [p.href]: e.target.checked }))
                  }
                />
                {p.label}
              </label>
            </li>
          ))}
        </ul>
        <div className="border-t border-[var(--color-border)] p-2">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              const added = allPages.filter((p) => checked[p.href]).map((p) => ({
                id: newId(),
                label: p.label === "Planning applications" ? "Planning" : p.label,
                href: p.href,
                depth: 0 as const,
              }));
              if (added.length === 0) {
                toast.error("Tick one or more pages first.");
                return;
              }
              onAdd(added);
              setChecked({});
            }}
          >
            Add to menu
          </Button>
          <p className="mt-2 text-center text-xs text-[var(--color-muted)]">
            Need a new page?{" "}
            <Link href="/admin/pages/new" className="text-[var(--color-primary)] underline">
              Create one
            </Link>
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)]">
        <h2 className="border-b border-[var(--color-border)] px-3 py-2 text-sm font-semibold">
          Menu heading
        </h2>
        <div className="flex flex-col gap-2 p-3">
          <label className="text-xs font-medium text-[var(--color-muted)]">
            Header label
            <input
              value={headingLabel}
              onChange={(e) => setHeadingLabel(e.target.value)}
              placeholder="e.g. Community"
              className="mt-1 w-full rounded-md border border-[var(--color-border)] px-2 py-1.5 text-sm"
            />
          </label>
          <p className="text-xs text-[var(--color-muted)]">
            A heading with no page of its own. Drag it under Planning, then drag applications under
            it for a sub-heading such as Redrow.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const label = headingLabel.trim();
              if (!label) {
                toast.error("Enter a header label.");
                return;
              }
              onAdd([{ id: newId(), label, href: "", depth: 0 }]);
              setHeadingLabel("");
            }}
          >
            Add heading
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)]">
        <h2 className="border-b border-[var(--color-border)] px-3 py-2 text-sm font-semibold">
          Custom link
        </h2>
        <div className="flex flex-col gap-2 p-3">
          <label className="text-xs font-medium text-[var(--color-muted)]">
            URL
            <input
              value={customHref}
              onChange={(e) => setCustomHref(e.target.value)}
              placeholder="https:// or /page"
              className="mt-1 w-full rounded-md border border-[var(--color-border)] px-2 py-1.5 text-sm"
            />
          </label>
          <label className="text-xs font-medium text-[var(--color-muted)]">
            Link text
            <input
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              placeholder="Label"
              className="mt-1 w-full rounded-md border border-[var(--color-border)] px-2 py-1.5 text-sm"
            />
          </label>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const href = customHref.trim();
              const label = customLabel.trim() || href;
              if (!href) {
                toast.error("Enter a URL.");
                return;
              }
              onAdd([{ id: newId(), label, href, depth: 0 }]);
              setCustomHref("");
              setCustomLabel("");
            }}
          >
            Add to menu
          </Button>
        </div>
      </div>
    </div>
  );
}

function MenuRow({
  row,
  extraPages,
  open,
  dragging,
  canNestNews,
  onToggle,
  onChange,
  onRemove,
  onDragStart,
  onDragEnd,
  onDragOverRow,
}: {
  row: FlatRow;
  extraPages: SitePageOption[];
  open: boolean;
  dragging: boolean;
  canNestNews: boolean;
  onToggle: () => void;
  onChange: (patch: Partial<FlatRow>) => void;
  onRemove: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragOverRow: (e: DragEvent<HTMLDivElement>) => void;
}) {
  const customPages = extraPages.filter((p) => !p.href.startsWith("/planning-applications/"));
  const planningPages = extraPages.filter((p) => p.href.startsWith("/planning-applications/"));
  const allPages = [...NAV_PAGE_OPTIONS, ...extraPages];
  const known = allPages.some((p) => p.href === row.href);
  const selectValue = !row.href ? "__heading__" : known ? row.href : "__custom__";

  return (
    <div
      className={`${indentClass(row.depth)} ${dragging ? "opacity-40" : ""}`}
      onDragOver={onDragOverRow}
    >
      <div className="flex items-stretch border-b border-[var(--color-border)] bg-[var(--color-surface)]/50">
        <button
          type="button"
          draggable
          onDragStart={(e) => {
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", row.id);
            onDragStart();
          }}
          onDragEnd={onDragEnd}
          className="flex w-8 shrink-0 cursor-grab items-center justify-center text-[var(--color-muted)] active:cursor-grabbing"
          aria-label={`Drag ${row.label}`}
        >
          <DragHandle />
        </button>
        <button
          type="button"
          onClick={onToggle}
          className="flex min-w-0 flex-1 items-center justify-between gap-2 px-2 py-2.5 text-left"
          aria-expanded={open}
        >
          <span className="truncate text-sm font-medium text-[var(--foreground)]">{row.label}</span>
          <span className="flex shrink-0 items-center gap-2 text-xs text-[var(--color-muted)]">
            {pageTypeLabel(row.href, extraPages)}
            <span aria-hidden>{open ? "▴" : "▾"}</span>
          </span>
        </button>
      </div>
      {open && (
        <div className="space-y-3 border-b border-[var(--color-border)] bg-white px-4 py-3">
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-[var(--color-muted)]">
              Navigation label
            </span>
            <input
              value={row.label}
              onChange={(e) => onChange({ label: e.target.value })}
              className="w-full rounded-md border border-[var(--color-border)] px-2 py-1.5 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-[var(--color-muted)]">
              Page or URL
            </span>
            <select
              value={selectValue}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "__heading__") {
                  onChange({ href: "" });
                  return;
                }
                if (v === "__custom__") {
                  onChange({ href: known ? "" : row.href });
                  return;
                }
                onChange({ href: v });
              }}
              className="w-full rounded-md border border-[var(--color-border)] bg-white px-2 py-1.5 text-sm"
            >
              {NAV_PAGE_OPTIONS.map((p) => (
                <option key={p.href} value={p.href}>
                  {p.label}
                </option>
              ))}
              {customPages.length > 0 && (
                <optgroup label="Your pages">
                  {customPages.map((p) => (
                    <option key={p.href} value={p.href}>
                      {p.label}
                    </option>
                  ))}
                </optgroup>
              )}
              {planningPages.length > 0 && (
                <optgroup label="Planning applications">
                  {planningPages.map((p) => (
                    <option key={p.href} value={p.href}>
                      {p.label}
                    </option>
                  ))}
                </optgroup>
              )}
              <option value="__heading__">Menu heading (no link)</option>
              <option value="__custom__">Custom URL…</option>
            </select>
          </label>
          {selectValue === "__custom__" && (
            <input
              value={row.href}
              onChange={(e) => onChange({ href: e.target.value })}
              placeholder="/path or https://…"
              className="w-full rounded-md border border-[var(--color-border)] px-2 py-1.5 text-sm"
            />
          )}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={row.openInNewTab === true}
              onChange={(e) => onChange({ openInNewTab: e.target.checked || undefined })}
            />
            Open in a new tab
          </label>
          {canNestNews && (
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={row.includeNewsCategories === true}
                onChange={(e) =>
                  onChange({ includeNewsCategories: e.target.checked || undefined })
                }
              />
              <span>
                Include news categories in this submenu
                <span className="mt-0.5 block text-xs text-[var(--color-muted)]">
                  Categories marked “show in header” are added automatically.
                </span>
              </span>
            </label>
          )}
          <button
            type="button"
            onClick={onRemove}
            className="text-sm text-red-700 hover:underline"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

function DragHandle() {
  return (
    <svg width="10" height="16" viewBox="0 0 10 16" aria-hidden className="fill-current">
      <circle cx="3" cy="3" r="1.2" />
      <circle cx="7" cy="3" r="1.2" />
      <circle cx="3" cy="8" r="1.2" />
      <circle cx="7" cy="8" r="1.2" />
      <circle cx="3" cy="13" r="1.2" />
      <circle cx="7" cy="13" r="1.2" />
    </svg>
  );
}