"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="surface-card mx-auto max-w-md space-y-6 p-10 text-center">
        <h2 className="font-heading text-xl font-bold text-foreground">
          משהו השתבש
        </h2>
        <p className="text-sm leading-relaxed text-primary/80">
          אירעה שגיאה בטעינת הדף. נסו שוב או חזרו לדף הבית.
        </p>
        {error.digest && (
          <p className="text-xs text-primary/50" dir="ltr">
            {error.digest}
          </p>
        )}
        <div className="flex items-center justify-center gap-4">
          <button onClick={reset} className="btn-primary">
            נסה שוב
          </button>
          <a href="/" className="btn-secondary">
            דף הבית
          </a>
        </div>
      </div>
    </div>
  );
}
