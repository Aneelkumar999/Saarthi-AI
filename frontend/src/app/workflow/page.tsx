"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { WorkflowStep } from "@/components/workflow-step";
import { Card } from "@/components/ui/card";
import { generateRoadmap, getRoadmap, saveRoadmap, type SavedRoadmap } from "@/lib/journey";

export default function WorkflowPage() {
  const [roadmap, setRoadmap] = useState<SavedRoadmap | null>(() => {
    if (typeof window !== "undefined") {
      const saved = getRoadmap();
      if (saved) return saved;

      const fallback = generateRoadmap("I want to open a tea shop in Hyderabad");
      saveRoadmap(fallback);
      return fallback;
    }
    return null;
  });

  useEffect(() => {
    // Initialized via lazy initializer
  }, []);

  if (!roadmap) {
    return <AppShell><p className="font-bold text-slate-600">Loading roadmap...</p></AppShell>;
  }

  return (
    <AppShell>
      <PageHeader eyebrow="Approval dependency engine" title={roadmap.title} description={`Generated for: ${roadmap.goal}. A dependency-aware journey showing approvals, documents, departments, and timelines.`} />
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-5">
          {roadmap.steps.map((step) => <WorkflowStep key={step.id} step={step} />)}
        </div>
        <Card className="h-fit">
          <h2 className="text-xl font-black text-navy">Timeline estimate</h2>
          <p className="mt-4 text-5xl font-black text-saffron">{roadmap.timeline}</p>
          <p className="text-sm font-semibold text-slate-500">working days</p>
          <div className="mt-6 space-y-3 text-sm text-slate-600">
            <p><strong>Fastest path:</strong> {roadmap.fastestPath}</p>
            <p><strong>Schemes:</strong> {roadmap.schemes.join(", ")}</p>
            <p><strong>Telugu:</strong> {roadmap.teluguHint}</p>
          </div>
          <div className="mt-6 grid gap-3">
            <Link href="/documents" className="rounded-2xl bg-saffron px-5 py-3 text-center text-sm font-bold text-white">Upload Required Docs</Link>
            <Link href="/forms" className="rounded-2xl border border-slate-200 px-5 py-3 text-center text-sm font-bold text-navy">Open Auto-Filled Form</Link>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
