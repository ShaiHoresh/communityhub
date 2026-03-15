"use client";

import { useActionState } from "react";
import { createProjectAction } from "./actions";

export function CreateProjectForm() {
  const [state, formAction] = useActionState(
    async (_prev: { success: boolean; error?: string } | null, formData: FormData) => {
      return await createProjectAction(formData);
    },
    null
  );

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-4">
      <div>
        <label htmlFor="project-name" className="mb-1 block text-xs font-medium text-primary/80">
          שם הפרויקט
        </label>
        <input
          id="project-name"
          name="name"
          type="text"
          required
          placeholder="למשל: קרן בניין"
          className="w-64 rounded-lg border border-secondary/40 bg-white px-3 py-2 text-right text-foreground"
        />
      </div>
      <button type="submit" className="btn-primary py-2 px-4 text-sm">
        הוסף פרויקט
      </button>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-primary">הפרויקט נוסף.</p>}
    </form>
  );
}
