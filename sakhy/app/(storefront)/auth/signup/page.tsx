"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import Button from "@/components/ui/Button";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError("");

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const payload = await response.json();

    if (!response.ok) {
      setPending(false);
      setError(payload.error || "Could not create account.");
      return;
    }

    const signInResult = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl: "/orders",
    });

    setPending(false);

    if (!signInResult || signInResult.error) {
      setError("Account created. Please sign in.");
      router.push("/auth/login");
      return;
    }

    router.push(signInResult.url || "/orders");
    router.refresh();
  };

  return (
    <div className="py-28 px-6 sm:px-8 max-w-md mx-auto bg-ivory font-sans">
      <h1 className="font-display text-3xl font-light text-charcoal mb-2">Create Account</h1>
      <p className="text-xs text-muted/70 leading-relaxed font-light mb-8">
        Create a Sakhy account to track orders and manage your details.
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
        <p className="text-[10px] text-muted/80 leading-relaxed">
          Use at least 8 characters with uppercase, lowercase, and a number.
        </p>

        {error ? (
          <p className="text-[10px] text-crimson tracking-wide bg-crimson/5 py-3 px-3 border border-crimson/15">
            {error}
          </p>
        ) : null}

        <Button type="submit" variant="primary" className="w-full !py-4" disabled={pending}>
          {pending ? "Creating..." : "Create Account"}
        </Button>
      </form>

      <p className="text-xs text-muted mt-5">
        Already registered?{" "}
        <Link href="/auth/login" className="text-gold hover:text-gold-light transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
