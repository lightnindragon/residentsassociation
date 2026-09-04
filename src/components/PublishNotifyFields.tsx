"use client";

import { useState } from "react";

export function PublishNotifyFields({
  defaultPublished,
}: {
  defaultPublished: boolean;
}) {
  const [published, setPublished] = useState(defaultPublished);

  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="published"
          value="1"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
        />
        <span className="text-sm">Published (visible on site)</span>
      </label>
      {published && (
        <label className="flex items-start gap-2 pl-6">
          <input
            type="checkbox"
            name="notify_subscribers"
            value="1"
            defaultChecked={!defaultPublished}
            className="mt-0.5"
          />
          <span className="text-sm">
            Send email notification to subscribers
            <span className="mt-0.5 block text-xs text-[var(--color-muted)]">
              Only sent the first time this is published. Leave unchecked to
              publish quietly.
            </span>
          </span>
        </label>
      )}
    </div>
  );
}