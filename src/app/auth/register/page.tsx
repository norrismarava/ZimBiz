"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Building2, User, Wrench, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input, Label, Field } from "@/components/ui/input";

type AccountType = "customer" | "provider" | "business";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [accountType, setAccountType] = useState<AccountType>(
    (searchParams.get("type") as AccountType) || "customer"
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      password: formData.get("password"),
      accountType,
    };

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        if (data.details) {
          const detailMsg = Object.entries(data.details)
            .map(([k, v]) => `${k}: ${(v as string[]).join(", ")}`)
            .join("; ");
          setError(`${data.error} — ${detailMsg}`);
        }
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#047857]">
              <ShieldCheck className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-[#111827]">Create your account</h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Join Zimbabwe&apos;s trusted business network
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            {/* Account Type Selector */}
            <div className="mb-5">
              <Label>I want to join as</Label>
              <div className="grid grid-cols-3 gap-2 mt-1.5">
                {[
                  { value: "customer" as AccountType, label: "Customer", icon: User },
                  { value: "provider" as AccountType, label: "Provider", icon: Wrench },
                  { value: "business" as AccountType, label: "Business", icon: Building2 },
                ].map((opt) => {
                  const Icon = opt.icon;
                  const active = accountType === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setAccountType(opt.value)}
                      className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs font-medium transition-colors ${
                        active
                          ? "border-[#047857] bg-[#047857]/5 text-[#047857]"
                          : "border-[#DDE7E2] text-[#64748B] hover:border-[#059669]/30"
                      }`}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Full name" required>
                <Input
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Tendai Mukamuri"
                  required
                  minLength={2}
                />
              </Field>

              <Field label="Email address" required>
                <Input
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                />
              </Field>

              <Field label="Phone number" required hint="Include country code, e.g. +263 77 123 4567">
                <Input
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+263 77 123 4567"
                  required
                />
              </Field>

              <Field
                label="Password"
                required
                hint="At least 8 characters with uppercase, lowercase and a number"
              >
                <div className="relative">
                  <Input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#334155]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>

              {error && (
                <div className="rounded-lg bg-[#DC2626]/10 border border-[#DC2626]/20 px-3 py-2 text-sm text-[#DC2626]">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" loading={loading} size="lg">
                Create Account
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-[#64748B]">
              Already have an account?{" "}
              <Link href="/auth/login" className="font-medium text-[#047857] hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-xs text-[#64748B]">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-[#047857]">Terms</Link> and{" "}
          <Link href="/privacy" className="underline hover:text-[#047857]">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-[#64748B]">Loading...</p></div>}>
      <RegisterForm />
    </Suspense>
  );
}
