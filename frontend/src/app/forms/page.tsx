"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { buildFormFields, getDocuments, getRoadmap, type SavedDocument, type SavedRoadmap } from "@/lib/journey";

export default function FormsPage() {
  const [roadmap, setRoadmap] = useState<SavedRoadmap | null>(null);
  const [docs, setDocs] = useState<SavedDocument[]>([]);

  useEffect(() => {
    setRoadmap(getRoadmap());
    setDocs(getDocuments());
  }, []);

  const formFields = buildFormFields(roadmap, docs);
  const missingDocs = formFields.filter((field) => field.confidence === "0%").length;

  return (
    <AppShell>
      <PageHeader eyebrow="Form auto-fill" title={roadmap ? `Review ${roadmap.steps[0]?.title} form` : "Review generated government form"} description="Saarthi maps saved OCR document fields and AI-derived roadmap context into government form templates before citizen approval." />
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <Card>
          <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="text-2xl font-black text-navy">{roadmap?.steps[0]?.title ?? "No roadmap selected"}</h2><p className="text-sm text-slate-500">Status: {missingDocs ? `${missingDocs} fields need documents` : "Ready for citizen verification"}</p></div>
            <Button>Generate PDF</Button>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {formFields.map((field) => (
              <label key={field.label} className="block rounded-2xl border border-slate-200 p-4">
                <span className="text-sm font-bold text-slate-500">{field.label}</span>
                <input className="mt-2 w-full rounded-xl bg-slate-50 px-3 py-3 font-semibold text-navy outline-none" defaultValue={field.value} />
                <span className="mt-2 block text-xs text-telangana">{field.source} - {field.confidence}</span>
              </label>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="text-xl font-black text-navy">Field mapping logic</h2>
          <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
            <p><strong>Saved documents:</strong> {docs.length ? docs.map((doc) => doc.type).join(", ") : "No uploaded documents yet."}</p>
            <p><strong>Roadmap:</strong> {roadmap ? roadmap.goal : "Ask Saarthi in chat to generate one."}</p>
            <p><strong>Profile fields</strong> come from saved Aadhaar, PAN, and address proof OCR.</p>
            <p><strong>Business fields</strong> come from the AI roadmap and workflow template.</p>
            <p><strong>Review required</strong> when OCR confidence is below 90% or rules require citizen confirmation.</p>
          </div>
          <div className="mt-6 grid gap-3">
            <Link href="/chat" className="rounded-2xl border border-slate-200 px-5 py-3 text-center text-sm font-bold text-navy">Create Roadmap</Link>
            <Link href="/documents" className="rounded-2xl bg-saffron px-5 py-3 text-center text-sm font-bold text-white">Upload Documents</Link>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
