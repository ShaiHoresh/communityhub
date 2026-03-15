"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export function HeaderAuthButtons() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center gap-3">
        <span className="h-9 w-20 animate-pulse rounded-full bg-secondary/20" />
      </div>
    );
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground/90">
          {session.user.name ?? session.user.email}
        </span>
        <Link
          href="/"
          className="btn-nav-secondary text-xs py-1.5 px-3"
        >
          דף הבית
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/auth/signin" className="btn-nav-secondary">
        התחברות
      </Link>
      <Link href="/auth/signup" className="btn-nav-primary">
        הרשמה
      </Link>
    </div>
  );
}
