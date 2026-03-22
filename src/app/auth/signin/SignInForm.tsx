"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { FormError } from "@/components/FormFeedback";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError(result.error === "CredentialsSignin" ? "אימייל או סיסמה לא נכונים." : result.error);
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-foreground">
          אימייל
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-base"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-foreground">
          סיסמה
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-base"
        />
      </div>
      <div aria-live="polite" aria-atomic="true">
        <FormError message={error || undefined} />
      </div>
      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? "מתחבר…" : "התחברות"}
      </button>
    </form>
  );
}
