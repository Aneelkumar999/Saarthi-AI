<<<<<<< HEAD
"use client";

import { useEffect, useState } from "react";
=======
>>>>>>> origin/main
import { AppShell } from "@/components/app-shell";
import { DemoBanner } from "@/components/demo-banner";
import { PageHeader } from "@/components/page-header";
import { Card, StatCard } from "@/components/ui/card";
<<<<<<< HEAD

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

interface Activity {
  type: string;
  title: string;
  status: string;
  timestamp: string;
}

interface DashboardData {
  active_journeys: number;
  completed_steps: number;
  total_steps: number;
  uploaded_documents: number;
  eligible_schemes: number;
  days_saved: number;
  recent_activities: Activity[];
}

function timeAgo(timestamp: string): string {
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function activityIcon(type: string) {
  if (type === "journey") return "🚀";
  if (type === "document") return "📄";
  return "💡";
}

function statusColor(status: string) {
  if (status === "active" || status === "verified" || status === "eligible") return "text-emerald-600 bg-emerald-50";
  if (status === "pending" || status === "uploaded") return "text-amber-600 bg-amber-50";
  return "text-slate-600 bg-slate-50";
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/dashboard/stats`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch dashboard data");
        return res.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-32">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-saffron border-t-transparent" />
        </div>
      </AppShell>
    );
  }

  if (error || !data) {
    return (
      <AppShell>
        <div className="py-32 text-center text-red-500">
          {error ?? "No data available."}
        </div>
      </AppShell>
    );
  }

  const progressPercent = data.total_steps > 0
    ? Math.round((data.completed_steps / data.total_steps) * 100)
    : 0;

  return (
    <AppShell>
      <PageHeader
        eyebrow="Citizen command center"
        title="Track every government journey in one dashboard"
        description="A unified view of workflows, document readiness, scheme eligibility, pending approvals, and next best actions."
      />

      <div className="grid gap-5 md:grid-cols-4">
        <StatCard label="Active journeys" value={String(data.active_journeys)} />
        <StatCard label="Documents ready" value={String(data.uploaded_documents)} tone="green" />
        <StatCard label="Estimated days saved" value={String(data.days_saved)} tone="saffron" />
        <StatCard label="Eligible schemes" value={String(data.eligible_schemes)} />
      </div>

      <div className="mt-8">
        <DemoBanner />
      </div>

      <div className="mt-8">
        <Card>
          <h2 className="text-2xl font-black text-navy">Journey progress</h2>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm font-bold text-slate-600">
              <span>{data.completed_steps} of {data.total_steps} steps completed</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-saffron to-emerald-500 transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <h2 className="text-2xl font-black text-navy">Recent activities</h2>
          <div className="mt-5 space-y-4">
            {data.recent_activities.length === 0 && (
              <p className="text-sm text-slate-400">No recent activities yet.</p>
            )}
            {data.recent_activities.map((activity, i) => (
              <div
                key={`${activity.type}-${i}`}
                className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{activityIcon(activity.type)}</span>
                  <div>
                    <p className="font-black text-navy">{activity.title}</p>
                    <p className="text-xs text-slate-400">{timeAgo(activity.timestamp)}</p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${statusColor(activity.status)}`}
                >
                  {activity.status}
                </span>
=======
import { schemes, teaShopSteps } from "@/lib/data";

export default function DashboardPage() {
  return (
    <AppShell>
      <PageHeader eyebrow="Citizen command center" title="Track every government journey in one dashboard" description="A unified view of workflows, document readiness, scheme eligibility, pending approvals, and next best actions." />
      <div className="grid gap-5 md:grid-cols-4">
        <StatCard label="Active journeys" value="3" />
        <StatCard label="Ready documents" value="8/10" tone="green" />
        <StatCard label="Estimated days saved" value="12" tone="saffron" />
        <StatCard label="Eligible schemes" value="5" />
      </div>
      <div className="mt-8"><DemoBanner /></div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <h2 className="text-2xl font-black text-navy">Next approvals</h2>
          <div className="mt-5 space-y-4">
            {teaShopSteps.slice(0, 3).map((step) => (
              <div key={step.id} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4">
                <div>
                  <p className="font-black text-navy">{step.title}</p>
                  <p className="text-sm text-slate-500">{step.dept}</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-saffron">{step.status}</span>
>>>>>>> origin/main
              </div>
            ))}
          </div>
        </Card>
<<<<<<< HEAD

        <Card>
          <h2 className="text-2xl font-black text-navy">Quick stats</h2>
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-slate-100 p-4">
              <p className="text-sm text-slate-500">Documents uploaded</p>
              <p className="mt-1 text-3xl font-black text-navy">{data.uploaded_documents}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 p-4">
              <p className="text-sm text-slate-500">Schemes you may qualify for</p>
              <p className="mt-1 text-3xl font-black text-telangana">{data.eligible_schemes}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 p-4">
              <p className="text-sm text-slate-500">Time saved this month</p>
              <p className="mt-1 text-3xl font-black text-saffron">{data.days_saved} days</p>
            </div>
=======
        <Card>
          <h2 className="text-2xl font-black text-navy">Scheme matches</h2>
          <div className="mt-5 space-y-4">
            {schemes.map((scheme) => (
              <div key={scheme.name} className="rounded-2xl border border-slate-100 p-4">
                <div className="flex items-center justify-between"><p className="font-black text-navy">{scheme.name}</p><span className="text-sm font-bold text-telangana">{scheme.fit}</span></div>
                <p className="mt-2 text-sm text-slate-500">{scheme.benefit}</p>
              </div>
            ))}
>>>>>>> origin/main
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
