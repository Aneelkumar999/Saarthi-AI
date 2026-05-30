import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";

const profile = [
  ["Name", "Anil Kumar"],
  ["Preferred Language", "English + Telugu"],
  ["Location", "Hyderabad, Telangana"],
  ["Citizen Type", "Micro entrepreneur"],
  ["Consent", "Document reuse enabled for selected services"]
];

export default function ProfilePage() {
  return (
    <AppShell>
      <PageHeader eyebrow="Citizen profile" title="Reusable, consent-led service profile" description="Profile data reduces duplicate entry while preserving user consent, visibility, and control over PII usage." />
      <Card className="max-w-3xl">
        <div className="space-y-4">
          {profile.map(([label, value]) => (
            <div key={label} className="grid gap-2 rounded-2xl bg-slate-50 p-4 sm:grid-cols-[14rem_1fr]">
              <p className="font-bold text-slate-500">{label}</p>
              <p className="font-black text-navy">{value}</p>
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
