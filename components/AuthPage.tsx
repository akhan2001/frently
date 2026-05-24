"use client";

// Auth page — login + signup, 50/50 split, royal-green left panel.
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type ChangeEvent, type ComponentType, type ReactNode } from "react";
import { createClient } from "@/lib/supabase";
import { Wordmark } from "@/components/Wordmark";
import {
  IconArrowRight,
  IconChevronLeft,
  IconEye,
  IconEyeOff,
  IconLock,
  IconMail,
  IconPhone,
  IconUser,
  type IconProps,
} from "@/components/icons";

type Mode = "login" | "signup";

type TextFieldProps = {
  label: ReactNode;
  type?: string;
  placeholder?: string;
  icon?: ComponentType<IconProps>;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  hint?: ReactNode;
  error?: ReactNode;
};

function TextField({
  label, type = "text", placeholder, icon: IconC, value, onChange, autoComplete, hint, error,
}: TextFieldProps) {
  const [show, setShow] = useState(false);
  const isPw = type === "password";
  const inputType = isPw ? (show ? "text" : "password") : type;
  return (
    <label className="block">
      <div className="text-[13px] font-medium text-ink mb-1.5">{label}</div>
      <div
        className={[
          "relative flex items-center bg-white rounded-lg border transition",
          error
            ? "border-red-400"
            : "border-[#DDDDDD] focus-within:border-forest focus-within:ring-[3px] focus-within:ring-forest/15",
        ].join(" ")}
      >
        {IconC && (
          <span className="pl-3 pr-1 text-muted">
            <IconC size={16} color="#999" />
          </span>
        )}
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={[
            "w-full h-11 bg-transparent outline-none text-[14px] text-ink placeholder:text-muted",
            IconC ? "pl-1.5 pr-3" : "px-3.5",
          ].join(" ")}
        />
        {isPw && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="px-3 text-muted hover:text-body"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <IconEyeOff size={16} color="currentColor" /> : <IconEye size={16} color="currentColor" />}
          </button>
        )}
      </div>
      {(hint || error) && (
        <div className={"mt-1.5 text-[12px] " + (error ? "text-red-500" : "text-muted")}>{error || hint}</div>
      )}
    </label>
  );
}

function LeftPanel() {
  return (
    <div className="hidden md:flex flex-col justify-between text-white p-12 lg:p-14 relative overflow-hidden bg-forest">
      {/* Background photo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://plus.unsplash.com/premium_photo-1689609950071-af404daa58a0?q=80&w=687&auto=format&fit=crop"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Royal-green tint so white text still reads. Layered as two stops:
          a solid forest wash + a slight darken-from-bottom gradient. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/50 mix-blend-multiply"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40"
      />

      <div className="relative flex items-center gap-2">
        <Wordmark className="text-[22px] text-white" />
      </div>

      <div className="relative max-w-[420px]">
        <h2
          className="text-[34px] lg:text-[40px] font-bold leading-[1.05] tracking-[-0.02em] drop-shadow-sm"
          style={{ textWrap: "balance" }}
        >
          Your rental,
          <br />
          on MLS — <span className="italic font-medium opacity-90">fast</span>.
        </h2>
        <p className="mt-5 text-[15px] text-white/85 leading-relaxed max-w-[360px]">
          Ontario landlords trust Frently to handle the MLS listing so they don&apos;t have to.
        </p>
      </div>

      <div className="relative text-[12px] text-white/70 font-mono tracking-wide">
        Powered by Vancor Realty · Brokerage #CAS984
      </div>
    </div>
  );
}

function RightPanel({ mode }: { mode: Mode }) {
  const isSignup = mode === "signup";
  const router = useRouter();
  const searchParams = useSearchParams();
  // proxy.ts sets ?redirectTo=<original-path> when bouncing to /login. We
  // also accept the legacy ?redirect= for backwards compat during the migration.
  const nextPath =
    searchParams.get("redirectTo") || searchParams.get("redirect") || "/dashboard";

  const [form, setForm] = useState({ full_name: "", email: "", phone: "", password: "" });
  const set =
    (k: keyof typeof form) =>
    (e: ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const supabase = createClient();

    if (isSignup) {
      // user_metadata keys MUST be `full_name` and `phone` — the
      // frently.handle_new_user() trigger reads raw_user_meta_data->>'full_name'
      // when inserting into frently.profiles. See frently-docs/SCHEMA.md.
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: { full_name: form.full_name, phone: form.phone },
        },
      });
      setSubmitting(false);
      if (error) return setError(error.message);
      router.push("/dashboard");
      router.refresh();
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });
      setSubmitting(false);
      if (error) return setError(error.message);
      router.push(nextPath);
      router.refresh();
    }
  };

  return (
    <div className="flex flex-col bg-white relative">
      <div className="md:hidden p-6 border-b border-line">
        <Link href="/" className="text-forest text-[20px]"><Wordmark /></Link>
      </div>

      <div className="absolute top-6 right-6 hidden md:flex items-center gap-2 text-[13px] text-muted">
        {isSignup ? "Already have an account?" : "New to Frently?"}
        <Link
          href={isSignup ? "/login" : "/signup"}
          className="text-forest font-semibold hover:underline"
        >
          {isSignup ? "Log in" : "Create an account"}
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-[380px] fade-up">
          <h1
            className="text-[26px] font-bold text-ink tracking-tight"
            style={{ textWrap: "balance" }}
          >
            {isSignup ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-[14px] text-muted mt-1.5">
            {isSignup ? "Start listing your rentals on MLS" : "Log in to manage your listings"}
          </p>

          {error && (
            <div
              role="alert"
              className="mt-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700"
            >
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-7 space-y-4">
            {isSignup && (
              <TextField
                label="Full name"
                placeholder="Alex Singh"
                icon={IconUser}
                value={form.full_name}
                onChange={set("full_name")}
                autoComplete="name"
              />
            )}
                <TextField
                  label="Email address"
                  type="email"
                  placeholder="you@email.com"
                  icon={IconMail}
                  value={form.email}
                  onChange={set("email")}
                  autoComplete="email"
                />
                {isSignup && (
                  <TextField
                    label="Phone number"
                    type="tel"
                    placeholder="(416) 555 0142"
                    icon={IconPhone}
                    value={form.phone}
                    onChange={set("phone")}
                    autoComplete="tel"
                  />
                )}
                <TextField
                  label="Password"
                  type="password"
                  placeholder={isSignup ? "At least 8 characters" : "Your password"}
                  icon={IconLock}
                  value={form.password}
                  onChange={set("password")}
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  hint={isSignup ? "8+ characters, with a number and a letter." : null}
                />

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-11 rounded-lg bg-forest text-white text-[14px] font-semibold hover:bg-forest-700 transition disabled:opacity-70 inline-flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      {isSignup ? "Creating account…" : "Logging in…"}
                    </>
                  ) : (
                    <>
                      {isSignup ? "Create account" : "Log in"} <IconArrowRight size={15} color="#fff" />
                    </>
                  )}
                </button>

                {isSignup && (
                  <p className="text-[12px] text-muted leading-relaxed">
                    By creating an account you authorize Vancor Realty (Brokerage{" "}
                    <span className="font-mono">#CAS984</span>) to list properties on your behalf.
                  </p>
                )}
              </form>

          <div className="mt-6 text-center text-[14px] text-body md:hidden">
            {isSignup ? "Already have an account? " : "Don't have an account? "}
            <Link href={isSignup ? "/login" : "/signup"} className="text-forest font-semibold">
              {isSignup ? "Log in" : "Sign up"}
            </Link>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-12 py-4 text-[12px] text-muted border-t border-line">
        <Link href="/" className="hover:text-ink inline-flex items-center gap-1.5">
          <IconChevronLeft size={13} color="currentColor" /> Back to Frently
        </Link>
      </div>
    </div>
  );
}

export function AuthPage({ mode }: { mode: Mode }) {
  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <LeftPanel />
      <RightPanel mode={mode} />
    </div>
  );
}
