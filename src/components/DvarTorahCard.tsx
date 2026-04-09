"use client";

import { useState } from "react";
import Link from "next/link";
import type { DbDvarTorah } from "@/lib/db-dvar-torah";

type Props = {
  dvarTorah: DbDvarTorah;
};

export function DvarTorahCard({ dvarTorah }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="surface-card overflow-hidden p-0">
      <div className="border-b border-secondary/10 bg-secondary/5 px-6 py-4 flex items-center justify-between gap-4">
        <p className="text-xs font-bold uppercase tracking-wider text-primary/70">
          דבר תורה שבועי
        </p>
        <Link
          href="/dvar-torah"
          className="text-xs font-semibold text-primary underline transition hover:text-primary/80 shrink-0"
        >
          לכל דברי התורה ←
        </Link>
      </div>
      <div className="p-6">
        {dvarTorah.parasha && (
          <p className="text-xs font-semibold text-secondary">
            פרשת {dvarTorah.parasha}
          </p>
        )}
        <h2 className="mt-1 font-heading text-lg font-bold text-foreground">
          {dvarTorah.title}
        </h2>
        {dvarTorah.author && (
          <p className="mt-0.5 text-sm text-primary/70">{dvarTorah.author}</p>
        )}

        <p
          className={`mt-3 text-sm leading-relaxed text-primary/75 whitespace-pre-line transition-all ${
            expanded ? "" : "line-clamp-3"
          }`}
        >
          {dvarTorah.body}
        </p>

        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-3 flex items-center gap-1 text-sm font-semibold text-primary underline transition hover:text-primary/80"
          aria-expanded={expanded}
        >
          <span
            className={`inline-block transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            aria-hidden="true"
          >
            ▾
          </span>
          {expanded ? "הצג פחות" : "הרחב לקריאה מלאה"}
        </button>
      </div>
    </section>
  );
}
