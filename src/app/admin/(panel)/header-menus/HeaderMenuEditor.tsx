"use client";

import { useActionState, useEffect, useMemo, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { saveNavMenu } from "@/app/admin/actions/nav-menus";
import { Button, Input } from "@/components/ui";
import { toast } from "sonner";
import {
  NAV_PAGE_OPTIONS,
  type NavItem,
  type NavMenuKey,
} from "@/lib/nav-menu";

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

function emptyItem(): NavItem {
  return { id: newId(), label: "New link", href: "/" };
}

type DragState =
  | { kind: "top"; from: number }
  | { kind: "child"; parent: number; from: number }
  | null;

export function HeaderMenuEditor({
  desktop,
  mobile,
}: {
  desktop: NavItem[];
  mobile: NavItem[];
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
        {tab === "desktop"
          ? "Shown in the top bar on larger screens. Keep this list fairly short so it still wraps cleanly beside the logo."
          : "Shown in the hamburger drawer on phones. You can include more links here than on desktop."}
      </p>
      <MenuEditor
        key={tab}
        menuKey={tab}
        items={items}
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
  setItems,
  onCopyFromOther,
  copyLabel,
}: {
  menuKey: NavMenuKey;
  items: NavItem[];
  setItems: Dispatch<SetStateAction<NavItem[]>>;
  onCopyFromOther: () => void;
  copyLabel: string;
}) {
  const [drag, setDrag] = useState<DragState>(null);
  const [state, formAction] = useActionState(saveNavMenu, null);
  const last = useRef<typeof state>(null);

  useEffect(() => {
    if (!state || state === last.current) return;
    last.current = state;
    if (state.ok) toast.success("Header menu saved.");
    else if (state.error) toast.error(state.error);
  }, [state]);

  const preview = useMemo(() => items, [items]);

  function patchTop(index: number, patch: Partial<NavItem>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function patchChild(parent: number, index: number, patch: Partial<NavItem>) {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== parent) return item;
        const children = (item.children ?? []).map((c, ci) =>
          ci === index ? { ...c, ...patch } : c
        );
        return { ...item, children };
      })
    );
  }

  function moveTop(index: number, dir: -1 | 1) {
    setItems((prev) => {
      const next = [...prev];
      const to = index + dir;
      if (to < 0 || to >= next.length) return prev;
      const [row] = next.splice(index, 1);
      next.splice(to, 0, row);
      return next;
    });
  }

  function moveChild(parent: number, index: number, dir: -1 | 1) {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== parent) return item;
        const children = [...(item.children ?? [])];
        const to = index + dir;
        if (to < 0 || to >= children.length) return item;
        const [row] = children.splice(index, 1);
        children.splice(to, 0, row);
        return { ...item, children };
      })
    );
  }

  function indentTop(index: number) {
    if (index <= 0) return;
    setItems((prev) => {
      const next = [...prev];
      const [row] = next.splice(index, 1);
      const parent = next[index - 1];
      const nested = row.children?.length
        ? [{ ...row, children: undefined }, ...row.children]
        : [row];
      next[index - 1] = {
        ...parent,
        children: [...(parent.children ?? []), ...nested],
      };
      return next;
    });
  }

  function outdentChild(parent: number, index: number) {
    setItems((prev) => {
      const next = [...prev];
      const parentItem = next[parent];
      const children = [...(parentItem.children ?? [])];
      const [row] = children.splice(index, 1);
      next[parent] = { ...parentItem, children: children.length ? children : undefined };
      next.splice(parent + 1, 0, row);
      return next;
    });
  }

  function removeTop(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function removeChild(parent: number, index: number) {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== parent) return item;
        const children = (item.children ?? []).filter((_, ci) => ci !== index);
        return { ...item, children: children.length ? children : undefined };
      })
    );
  }

  return (
    <form action={formAction} className="mt-4">
      <input type="hidden" name="menu_key" value={menuKey} />
      <input type="hidden" name="items" value={JSON.stringify(items)} />

      <div className="mb-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-header-bg)] px-4 py-3">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--color-chrome-muted)]">
          Preview
        </p>
        {menuKey === "desktop" ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-[var(--color-chrome-foreground)]">
            {preview.map((item) => (
              <span key={item.id} className="inline-flex items-center gap-0.5">
                {item.label}
                {(item.children?.length || item.includeNewsCategories) && (
                  <span className="text-xs opacity-70">▾</span>
                )}
              </span>
            ))}
          </div>
        ) : (
          <ul className="divide-y divide-black/10 text-sm font-medium">
            {preview.map((item) => (
              <li key={item.id} className="py-2">
                {item.label}
                {item.children && item.children.length > 0 && (
                  <ul className="mt-1 pl-4 text-[var(--color-chrome-muted)]">
                    {item.children.map((c) => (
                      <li key={c.id} className="py-0.5">
                        {c.label}
                      </li>
                    ))}
                    {item.includeNewsCategories && (
                      <li className="py-0.5 italic">News categories…</li>
                    )}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            draggable
            onDragStart={() => setDrag({ kind: "top", from: index })}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (drag?.kind === "top" && drag.from !== index) {
                setItems((prev) => {
                  const next = [...prev];
                  const [row] = next.splice(drag.from, 1);
                  next.splice(index, 0, row);
                  return next;
                });
              }
              setDrag(null);
            }}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-3 shadow-sm"
          >
            <ItemFields
              item={item}
              onChange={(patch) => patchTop(index, patch)}
              allowNewsCategories
            />
            <div className="mt-2 flex flex-wrap gap-1">
              <TinyButton onClick={() => moveTop(index, -1)} disabled={index === 0}>
                Up
              </TinyButton>
              <TinyButton onClick={() => moveTop(index, 1)} disabled={index === items.length - 1}>
                Down
              </TinyButton>
              <TinyButton onClick={() => indentTop(index)} disabled={index === 0}>
                Make submenu of previous
              </TinyButton>
              <TinyButton
                onClick={() =>
                  patchTop(index, {
                    children: [...(item.children ?? []), emptyItem()],
                  })
                }
              >
                Add submenu item
              </TinyButton>
              <TinyButton onClick={() => removeTop(index)} danger>
                Remove
              </TinyButton>
            </div>

            {(item.children ?? []).map((child, ci) => (
              <div
                key={child.id}
                draggable
                onDragStart={(e) => {
                  e.stopPropagation();
                  setDrag({ kind: "child", parent: index, from: ci });
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.stopPropagation();
                  if (drag?.kind === "child" && drag.parent === index && drag.from !== ci) {
                    setItems((prev) =>
                      prev.map((p, pi) => {
                        if (pi !== index) return p;
                        const children = [...(p.children ?? [])];
                        const [row] = children.splice(drag.from, 1);
                        children.splice(ci, 0, row);
                        return { ...p, children };
                      })
                    );
                  }
                  setDrag(null);
                }}
                className="mt-2 ml-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/40 p-3"
              >
                <ItemFields item={child} onChange={(patch) => patchChild(index, ci, patch)} />
                <div className="mt-2 flex flex-wrap gap-1">
                  <TinyButton onClick={() => moveChild(index, ci, -1)} disabled={ci === 0}>
                    Up
                  </TinyButton>
                  <TinyButton
                    onClick={() => moveChild(index, ci, 1)}
                    disabled={ci === (item.children?.length ?? 0) - 1}
                  >
                    Down
                  </TinyButton>
                  <TinyButton onClick={() => outdentChild(index, ci)}>Move to top level</TinyButton>
                  <TinyButton onClick={() => removeChild(index, ci)} danger>
                    Remove
                  </TinyButton>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => setItems((prev) => [...prev, emptyItem()])}>
          Add menu item
        </Button>
        <Button type="button" variant="ghost" onClick={onCopyFromOther}>
          {copyLabel}
        </Button>
        <Button type="submit">Save {menuKey} menu</Button>
      </div>
    </form>
  );
}

function ItemFields({
  item,
  onChange,
  allowNewsCategories,
}: {
  item: NavItem;
  onChange: (patch: Partial<NavItem>) => void;
  allowNewsCategories?: boolean;
}) {
  const known = NAV_PAGE_OPTIONS.some((p) => p.href === item.href);
  const selectValue = known ? item.href : "__custom__";

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Input
        label="Label"
        value={item.label}
        onChange={(e) => onChange({ label: e.target.value })}
      />
      <div>
        <label className="mb-1.5 block text-sm font-medium">Page or URL</label>
        <select
          value={selectValue}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "__custom__") {
              onChange({ href: item.href && !known ? item.href : "" });
              return;
            }
            const match = NAV_PAGE_OPTIONS.find((p) => p.href === v);
            onChange({
              href: v,
              label: item.label === "New link" && match ? match.label : item.label,
            });
          }}
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm"
        >
          {NAV_PAGE_OPTIONS.map((p) => (
            <option key={p.href} value={p.href}>
              {p.label}
            </option>
          ))}
          <option value="__custom__">Custom URL…</option>
        </select>
        {selectValue === "__custom__" && (
          <input
            value={item.href}
            onChange={(e) => onChange({ href: e.target.value })}
            placeholder="/path or https://…"
            className="mt-2 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm"
          />
        )}
      </div>
      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <input
          type="checkbox"
          checked={item.openInNewTab === true}
          onChange={(e) => onChange({ openInNewTab: e.target.checked || undefined })}
        />
        Open in a new tab
      </label>
      {allowNewsCategories && (
        <label className="flex items-start gap-2 text-sm sm:col-span-2">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={item.includeNewsCategories === true}
            onChange={(e) => onChange({ includeNewsCategories: e.target.checked || undefined })}
          />
          <span>
            Include news categories in this submenu
            <span className="mt-0.5 block text-xs text-[var(--color-muted)]">
              Categories marked “show in header” are added automatically.
            </span>
          </span>
        </label>
      )}
    </div>
  );
}

function TinyButton({
  onClick,
  children,
  disabled,
  danger,
}: {
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-md px-2 py-1 text-xs font-medium disabled:opacity-40 ${
        danger
          ? "text-red-700 hover:bg-red-50"
          : "text-[var(--color-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--foreground)]"
      }`}
    >
      {children}
    </button>
  );
}