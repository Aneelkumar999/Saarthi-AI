"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { sendOtp, verifyOtp } from "@/lib/api";
import { saveAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<"send" | "verify" | null>(null);

  async function handleSendOtp() {
    setError("");
    setMessage("");
    setLoading("send");
    try {
      const response = await sendOtp(phone);
      setOtpSent(true);
      setDevOtp(response.dev_otp ?? null);
      setMessage(`${response.message}. It expires in ${Math.floor(response.expires_in_seconds / 60)} minutes.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send OTP");
    } finally {
      setLoading(null);
    }
  }

  async function handleVerifyOtp() {
    setError("");
    setMessage("");
    setLoading("verify");
    try {
      const response = await verifyOtp(phone, otp);
      saveAuth(response.access_token, response.user);
      setMessage("OTP verified. Redirecting...");
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to verify OTP");
    } finally {
      setLoading(null);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-mist px-4 py-10">
      <Card className="w-full max-w-md">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy text-white"><Sparkles /></span>
          <div>
            <h1 className="text-2xl font-black text-navy">Citizen Login</h1>
            <p className="text-sm text-slate-500">OTP-based secure access</p>
          </div>
        </div>
        <label className="text-sm font-bold text-slate-700" htmlFor="phone">Mobile number</label>
        <div className="mt-2 flex gap-3">
          <input
            id="phone"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="min-w-0 flex-1 rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-saffron"
            placeholder="+91 98765 43210"
            disabled={loading !== null}
          />
          <Button type="button" onClick={handleSendOtp} disabled={loading !== null || !phone.trim()} className="gap-2 px-4">
            {loading === "send" ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            <span className="hidden sm:inline">Send OTP</span>
          </Button>
        </div>

        {otpSent && (
          <div className="mt-5">
            <label className="block text-sm font-bold text-slate-700" htmlFor="otp">OTP</label>
            <input
              id="otp"
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 tracking-[0.35em] outline-none focus:border-saffron"
              placeholder="123456"
              inputMode="numeric"
              disabled={loading !== null}
            />
            {devOtp && (
              <div className="mt-3 rounded-2xl border border-orange-200 bg-cream p-4 text-sm font-bold text-saffron">
                Demo OTP: {devOtp}
              </div>
            )}
            <Button type="button" onClick={handleVerifyOtp} disabled={loading !== null || otp.length !== 6} className="mt-5 w-full gap-2">
              {loading === "verify" ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
              Verify OTP and Continue
            </Button>
          </div>
        )}

        {message && <p className="mt-4 rounded-2xl bg-teal-50 p-3 text-sm font-semibold text-telangana">{message}</p>}
        {error && <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
        <p className="mt-4 text-center text-xs leading-6 text-slate-500">By continuing, you consent to Saarthi storing profile data only for government service assistance.</p>
      </Card>
    </main>
  );
}
