"use client";

import { useActionState, useState } from "react";
import { updateHhPrayerAction, deleteHhPrayerAction } from "./actions";

type Props = {
  prayer: { id: string; name: string; sortOrder: number };
};

export function HhPrayerRow({ prayer }: Props) {
  const [editing, setEditing] = useState(false);

  const [updateState, updateAction] = useActionState(
    async (_prev: { ok: boolean; error?: string } | null, formData: FormData) => {
      const result = await updateHhPrayerAction(formData);
      if (result.ok) setEditing(false);
      return result;
    },
    null,
  );

  const [, deleteAction] = useActionState(
    async (_prev: { ok: boolean; error?: string } | null, formData: FormData) => {
      return await deleteHhPrayerAction(formData);
    },
    null,
  );

  if (editing) {
    return (
      <tr className="border-b border-secondary/10">
        <td className="p-2" colSpan={2}>
          <form action={updateAction} className="flex items-center gap-2">
            <input type="hidden" name="id" value={prayer.id} />
            <input
              name="name"
              type="text"
              defaultValue={prayer.name}
              required
              className="flex-1 rounded-lg border border-secondary/40 bg-white px-2 py-1 text-right text-sm text-foreground"
            />
            <input
              name="sortOrder"
              type="number"
              defaultValue={prayer.sortOrder}
              className="w-16 rounded-lg border border-secondary/40 bg-white px-2 py-1 text-right text-sm text-foreground"
            />
            <button type="submit" className="btn-primary text-xs">שמור</button>
            <button type="button" onClick={() => setEditing(false)} className="btn-secondary text-xs">ביטול</button>
            {updateState && !updateState.ok && updateState.error && (
              <span className="text-xs text-red-600">{updateState.error}</span>
            )}
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-secondary/10 align-middle">
      <td className="p-2 text-sm text-foreground">
        <span className="font-medium">{prayer.name}</span>
        <span className="mr-2 text-xs text-primary/50">(סדר: {prayer.sortOrder})</span>
      </td>
      <td className="p-2 text-left">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-lg px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
          >
            עריכה
          </button>
          <form action={deleteAction}>
            <input type="hidden" name="id" value={prayer.id} />
            <button
              type="submit"
              className="rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              מחיקה
            </button>
          </form>
        </div>
      </td>
    </tr>
  );
}
