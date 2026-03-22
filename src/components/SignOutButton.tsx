"use client";

import { signOut } from "next-auth/react";

type Props = { className?: string };

export function SignOutButton({ className }: Props) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className={className ?? "btn-secondary"}
    >
      התנתק
    </button>
  );
}
