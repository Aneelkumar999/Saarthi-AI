import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { schemes } from "@/lib/data";

export default function SchemesPage() {
  return (
    <AppShell>
      <PageHeader eyebrow="Recommendation engine" title="Government schemes matched to citizen context" description="Eligibility is derived from profile data, location, business type, documents, and knowledge-base rules." />
      <div className="grid gap-5 md:grid-cols-3">
        {schemes.map((scheme) => (
          <Card key={scheme.name}>
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-2xl font-black text-navy">{scheme.name}</h2>
              <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-black text-telangana">{scheme.fit}</span>
            </div>
            <p className="mt-4 font-semibold text-saffron">{scheme.benefit}</p>
            <p className="mt-4 leading-7 text-slate-600">{scheme.reason}</p>
            <button className="mt-6 w-full rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-navy hover:bg-slate-50">Check full eligibility</button>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
