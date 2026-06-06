"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2, Send, Smartphone, Mail, ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { sendOtp, loginOtp } from "@/lib/api";
import { saveAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [channel, setChannel] = useState<"phone" | "email">("phone");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [maskedDest, setMaskedDest] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<"send" | "verify" | null>(null);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const resetState = useCallback(() => {
    setOtpSent(false);
    setOtp("");
    setMaskedDest("");
    setDevOtp(null);
    setCountdown(0);
    setMessage("");
    setError("");
  }, []);

  function switchChannel(ch: "phone" | "email") {
    setChannel(ch);
    resetState();
  }

  async function handleSendOtp() {
    setError("");
    setMessage("");
    if (!identifier.trim()) {
      setError(channel === "phone" ? "Enter your phone number" : "Enter your email address");
      return;
    }
    setLoading("send");
    try {
      const response = await sendOtp(identifier, "login");
      setOtpSent(true);
      setMaskedDest(response.masked_destination);
      setDevOtp(response.dev_otp ?? null);
      setCountdown(30);
      setMessage(`OTP sent to ${response.masked_destination}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send OTP");
    } finally {
      setLoading(null);
    }
  }

  async function handleVerifyOtp() {
    setError("");
    setMessage("");
    if (otp.length !== 6) {
      setError("Enter the 6-digit OTP");
      return;
    }
    setLoading("verify");
    try {
      const response = await loginOtp(identifier, otp);
      saveAuth(response.access_token, response.user, response.refresh_token);
      setMessage("Login successful. Redirecting...");
      setTimeout(() => router.push("/dashboard"), 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid OTP");
    } finally {
      setLoading(null);
    }
  }

  function handleResendOtp() {
    setOtp("");
    setDevOtp(null);
    handleSendOtp();
  }

  const inputType = channel === "email" ? "email" : "tel";
  const placeholder = channel === "email" ? "you@example.com" : "+91 98765 43210";

  return (
    <main className="flex min-h-screen items-center justify-center bg-mist px-4 py-10">
      <Card className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-navy text-white">
            <Shield size={32} />
          </div>
          <h1 className="text-2xl font-black text-navy">Welcome to Saarthi AI</h1>
          <p className="mt-1 text-sm text-slate-500">Secure OTP-based authentication</p>
        </div>

        {/* Channel Tabs */}
        <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => switchChannel("phone")}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition ${
              channel === "phone" ? "bg-white text-navy shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Smartphone size={16} />
            Phone OTP
          </button>
          <button
            onClick={() => switchChannel("email")}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition ${
              channel === "email" ? "bg-white text-navy shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Mail size={16} />
            Email OTP
          </button>
        </div>

        {!otpSent ? (
          /* Step 1: Enter Identifier */
          <>
            <label className="text-sm font-bold text-slate-700" htmlFor="identifier">
              {channel === "phone" ? "Mobile Number" : "Email Address"}
            </label>
            <input
              id="identifier"
              type={inputType}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3.5 text-navy outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/20 transition"
              placeholder={placeholder}
              disabled={loading !== null}
              autoComplete={channel === "email" ? "email" : "tel-national"}
            />
            <Button
              onClick={handleSendOtp}
              disabled={loading !== null || !identifier.trim()}
              className="mt-5 w-full gap-2 py-3.5"
            >
              {loading === "send" ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Send size={18} />
              )}
              Send OTP
            </Button>
          </>
        ) : (
          /* Step 2: Enter OTP */
          <>
            <div className="rounded-xl bg-slate-50 p-4 mb-5">
              <p className="text-sm text-slate-600">
                OTP sent to <span className="font-bold text-navy">{maskedDest}</span>
              </p>
            </div>

            <label className="text-sm font-bold text-slate-700" htmlFor="otp">Enter 6-digit OTP</label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3.5 text-center text-2xl font-mono tracking-[0.5em] text-navy outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/20 transition"
              placeholder="------"
              disabled={loading !== null}
              autoFocus
              maxLength={6}
            />

            {devOtp && (
              <div className="mt-3 rounded-xl border border-dashed border-amber-300 bg-amber-50 p-3 text-center">
                <p className="text-xs text-amber-600 font-semibold">DEVELOPMENT MODE</p>
                <p className="text-lg font-black text-amber-700 tracking-widest mt-1">{devOtp}</p>
              </div>
            )}

            <Button
              onClick={handleVerifyOtp}
              disabled={loading !== null || otp.length !== 6}
              className="mt-5 w-full gap-2 py-3.5"
            >
              {loading === "verify" ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <ArrowRight size={18} />
              )}
              Verify & Login
            </Button>

            <div className="mt-4 text-center">
              {countdown > 0 ? (
                <p className="text-sm text-slate-500">
                  Resend OTP in <span className="font-bold text-navy">{countdown}s</span>
                </p>
              ) : (
                <button
                  onClick={handleResendOtp}
                  className="text-sm font-bold text-navy hover:underline"
                >
                  Resend OTP
                </button>
              )}
            </div>

            <button
              onClick={resetState}
              className="mt-2 w-full text-center text-sm text-slate-500 hover:text-navy transition"
            >
              Change {channel === "phone" ? "phone number" : "email address"}
            </button>
          </>
        )}

        {/* Messages */}
        {message && (
          <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-center">
            <p className="text-sm font-semibold text-emerald-700">{message}</p>
          </div>
        )}
        {error && (
          <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-center">
            <p className="text-sm font-semibold text-red-700">{error}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 flex flex-col items-center gap-2 text-sm border-t border-slate-100 pt-5">
          <p className="text-slate-500">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-bold text-navy hover:underline">Sign up</Link>
          </p>
        </div>

        <p className="mt-4 text-center text-xs leading-5 text-slate-400">
          By continuing, you agree to Saarthi AI&apos;s Terms of Service and Privacy Policy.
        </p>
      </Card>
    </main>
  );
}
