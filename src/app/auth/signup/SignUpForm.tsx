"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { registerAction } from "./actions";
import { FormError } from "@/components/FormFeedback";

export function SignUpForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const formData = new FormData();
    formData.set("email", email);
    formData.set("password", password);
    formData.set("fullName", fullName);
    const result = await registerAction(formData);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const signInResult = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    });
    if (signInResult?.error) {
      setError("החשבון נוצר אך ההתחברות נכשלה. נסה להתחבר ידנית.");
      return;
    }
    router.push("/pending");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-foreground">
          שם מלא
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="input-base"
        />
      </div>
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
          סיסמה (לפחות 8 תווים)
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-base"
        />
      </div>
      <div aria-live="polite" aria-atomic="true">
        <FormError message={error || undefined} />
      </div>
      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? "נרשם…" : "הרשמה"}
      </button>
    </form>
  );
}
