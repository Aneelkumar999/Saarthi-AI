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
    </main>
  );
}
