"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

import { SEED_PASSWORD } from "@/lib/data/seed";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const QUICK_ACCOUNTS = [
  { email: "jordan@whop.test", label: "Jordan Blake", hint: "Buyer" },
  { email: "avery@whop.test", label: "Avery Chen", hint: "Seller" },
  { email: "maya@whop.test", label: "Maya Rodriguez", hint: "Seller" },
];

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async (signInEmail: string, signInPassword: string) => {
    setPending(true);
    setError(null);
    const result = await signIn("credentials", {
      email: signInEmail,
      password: signInPassword,
      redirect: false,
    });
    setPending(false);
    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }
    router.push("/");
    router.refresh();
  };

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-4 py-16">
      <div className="flex items-center gap-2 font-semibold tracking-tight">
        <span className="grid size-7 place-items-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
          W
        </span>
        <span>Whop Marketplace</span>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Sign in to Whop Marketplace</CardTitle>
          <CardDescription>
            Use a demo account below, or sign in with an email. The password for
            every demo account is{" "}
            <span className="font-medium text-foreground">{SEED_PASSWORD}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              submit(email, password);
            }}
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@whop.test"
                autoComplete="email"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
                autoComplete="current-password"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={pending}>
              {pending ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">
              or quick sign in
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="flex flex-col gap-2">
            {QUICK_ACCOUNTS.map((account) => (
              <Button
                key={account.email}
                type="button"
                variant="outline"
                disabled={pending}
                className="justify-between"
                onClick={() => submit(account.email, SEED_PASSWORD)}
              >
                <span>{account.label}</span>
                <span className="text-xs text-muted-foreground">
                  {account.hint}
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
