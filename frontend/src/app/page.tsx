<<<<<<< HEAD
import { ArrowRight, Mic, Search, ShieldCheck, Sparkles } from "lucide-react";
import { DemoBanner } from "@/components/demo-banner";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { features } from "@/lib/data";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-mist">
      <section className="hero-grid relative overflow-hidden">
        <div className="absolute right-[-8rem] top-[-8rem] h-96 w-96 rounded-full bg-orange-200/50 blur-3xl" />
        <div className="absolute bottom-[-10rem] left-[-8rem] h-96 w-96 rounded-full bg-teal-200/60 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-3 font-black text-navy">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-navy text-white"><Sparkles size={21} /></span>
              <span>Saarthi AI</span>
            </div>
            <div className="flex items-center gap-3">
              <LinkButton href="/login" variant="ghost" className="hidden sm:inline-flex">Login</LinkButton>
              <LinkButton href="/dashboard" variant="secondary">Open App</LinkButton>
            </div>
          </nav>

          <div className="grid items-center gap-10 py-16 lg:grid-cols-[1.08fr_0.92fr] lg:py-24">
            <div>
              <p className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-bold text-telangana shadow-sm">Telangana-first. India-scale. Citizen-centered.</p>
              <h1 className="mt-6 max-w-4xl text-5xl font-black tracking-tight text-navy md:text-7xl">Your AI guide through government services.</h1>
              <p className="mt-6 max-w-2xl text-xl leading-9 text-slate-600">Do not search portals, departments, forms, or rules. Tell Saarthi your goal and get a personalized government journey in English and Telugu.</p>
              <div className="glass-panel mt-8 rounded-[2rem] p-3 shadow-civic">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="flex flex-1 items-center gap-3 rounded-2xl bg-white px-4 py-4">
                    <Search className="text-slate-400" />
                    <span className="text-slate-500">I want to open a tea shop in Hyderabad</span>
                  </div>
                  <LinkButton href="/chat" className="gap-2">Ask Saarthi <ArrowRight size={18} /></LinkButton>
                  <button className="rounded-2xl border border-slate-200 bg-white px-4 text-slate-600" aria-label="Use voice"><Mic /></button>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold text-slate-600">
                <span className="rounded-full bg-white px-4 py-2">Trade License</span>
                <span className="rounded-full bg-white px-4 py-2">Birth Certificate</span>
                <span className="rounded-full bg-white px-4 py-2">Farm Schemes</span>
                <span className="rounded-full bg-white px-4 py-2">Land Registration</span>
              </div>
            </div>

            <Card className="p-0">
              <div className="rounded-t-3xl bg-navy p-6 text-white">
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-orange-200">Generated roadmap</p>
                <h2 className="mt-3 text-2xl font-black">Tea shop in Hyderabad</h2>
              </div>
              <div className="space-y-4 p-6">
                {["Shop & Establishment", "GHMC Trade License", "FSSAI Basic Registration"].map((item, index) => (
                  <div key={item} className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cream font-black text-saffron">{index + 1}</span>
                    <div>
                      <p className="font-black text-navy">{item}</p>
                      <p className="text-sm text-slate-500">Documents and forms prepared by Saarthi</p>
                    </div>
                  </div>
                ))}
                <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4 text-sm text-telangana">
                  <ShieldCheck className="mb-2" />
                  Eligible scheme matches: PM SVANidhi, MUDRA Shishu Loan
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <DemoBanner />
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title}>
              <feature.icon className="text-saffron" />
              <h3 className="mt-4 text-xl font-black text-navy">{feature.title}</h3>
              <p className="mt-3 leading-7 text-slate-600">{feature.text}</p>
            </Card>
          ))}
        </div>
      </section>
=======
"use client";

import { useState } from "react";
import ChatInterface from "@/components/ChatInterface";
import WorkflowStepper, { type WorkflowStep } from "@/components/WorkflowStepper";
import DashboardHeader from "@/components/DashboardHeader";

export default function Home() {
  const [intentId, setIntentId] = useState<number | null>(null);
  const [workflow, setWorkflow] = useState<WorkflowStep[]>([]);
  const [loading, setLoading] = useState(false);

  const handleIntentFound = async (id: number) => {
    setIntentId(id);
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/workflow/${id}`);
      if (res.ok) {
        const data = await res.json();
        setWorkflow(data);
      }
    } catch (err) {
      console.error("Failed to fetch workflow", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col h-screen">
      <DashboardHeader />
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side: Chat */}
        <div className="w-1/3 border-r bg-white flex flex-col">
          <ChatInterface onIntentFound={handleIntentFound} />
        </div>

        {/* Right Side: Workflow/Dashboard */}
        <div className="flex-1 bg-slate-50 overflow-y-auto p-8">
          {intentId ? (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-6 text-slate-800">Your Personalized Roadmap</h2>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <WorkflowStepper workflow={workflow} />
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-12">
              <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-slate-800 mb-4">Welcome to Saarthi AI</h2>
              <p className="text-slate-600 text-lg max-w-md">
                Tell me what you want to do (e.g., &quot;I want to open a tea shop&quot;) in the chat, and I&apos;ll build your government roadmap.
              </p>
            </div>
          )}
        </div>
      </div>
>>>>>>> origin/main
    </main>
  );
}
