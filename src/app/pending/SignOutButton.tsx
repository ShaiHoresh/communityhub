"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <div className="pt-4">
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="btn-secondary"
      >
        התנתק
      </button>
    </div>
  );
}
