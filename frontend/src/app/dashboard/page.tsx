import { AppShell } from "@/components/app-shell";
import { DemoBanner } from "@/components/demo-banner";
import { PageHeader } from "@/components/page-header";
import { Card, StatCard } from "@/components/ui/card";
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
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="text-2xl font-black text-navy">Scheme matches</h2>
          <div className="mt-5 space-y-4">
            {schemes.map((scheme) => (
              <div key={scheme.name} className="rounded-2xl border border-slate-100 p-4">
                <div className="flex items-center justify-between"><p className="font-black text-navy">{scheme.name}</p><span className="text-sm font-bold text-telangana">{scheme.fit}</span></div>
                <p className="mt-2 text-sm text-slate-500">{scheme.benefit}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
