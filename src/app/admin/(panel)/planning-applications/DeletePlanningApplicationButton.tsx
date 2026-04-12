"use client";

import { deletePlanningApplication } from "@/app/admin/actions/planning";

export function DeletePlanningApplicationButton({ applicationId }: { applicationId: string }) {
  return (
    <form
      action={async () => {
        if (typeof window !== "undefined" && !confirm("Delete this planning application?")) return;
        await deletePlanningApplication(applicationId);
      }}
      className="inline"
    >
      <button type="submit" className="text-red-600 hover:underline dark:text-red-400">
        Delete
      </button>
    </form>
  );
}
