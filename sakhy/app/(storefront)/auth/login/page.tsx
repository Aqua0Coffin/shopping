"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/orders";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json() as { ok?: boolean; error?: string };

    setPending(false);

    if (!res.ok || !data.ok) {
      setError(data.error || "Invalid email or password.");
      return;
    }

    router.refresh();
    router.push(callbackUrl);
  };

  return (
    <div className="py-28 px-6 sm:px-8 max-w-md mx-auto bg-ivory font-sans">
      <h1 className="font-display text-3xl font-light text-charcoal mb-2">Sign In</h1>
      <p className="text-xs text-muted/70 leading-relaxed font-light mb-8">
        Access your order history and account details.
      </p>

      <form onSubmit={onSubmit} className="border border-gold/15 bg-silk/10 p-6 flex flex-col gap-5">
        <label className="flex flex-col gap-2 text-[10px] uppercase tracking-widest text-muted">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="border border-gold/20 bg-ivory px-4 py-3 text-sm normal-case text-charcoal outline-none focus:border-gold"
          />
        </label>
        <label className="flex flex-col gap-2 text-[10px] uppercase tracking-widest text-muted">
          Password
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="border border-gold/20 bg-ivory px-4 py-3 text-sm normal-case text-charcoal outline-none focus:border-gold"
          />
        </label>

        {error ? (
          <p className="text-[10px] text-crimson tracking-wide bg-crimson/5 py-3 px-3 border border-crimson/15">
            {error}
          </p>
        ) : null}

        <Button type="submit" variant="primary" className="w-full !py-4" disabled={pending}>
          {pending ? "Signing In..." : "Sign In"}
        </Button>
      </form>

      <p className="text-xs text-muted mt-5">
        New to Sakhy?{" "}
        <Link href="/auth/signup" className="text-gold hover:text-gold-light transition-colors">
          Create account
        </Link>
      </p>
    </div>
  );
}
