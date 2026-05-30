import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { Card, StatCard } from "@/components/ui/card";

export default function AdminPage() {
  return (
    <AppShell>
      <PageHeader eyebrow="Government admin console" title="Manage services, rules, workflows, and knowledge base" description="A civic operations view for updating departments, documents, service dependencies, scheme rules, and audit activity." />
      <div className="grid gap-5 md:grid-cols-4">
        <StatCard label="Services" value="128" />
        <StatCard label="Departments" value="18" tone="green" />
        <StatCard label="Workflow rules" value="412" tone="saffron" />
        <StatCard label="Pending reviews" value="9" />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-2xl font-black text-navy">Knowledge base updates</h2>
          <div className="mt-5 space-y-3">
            {["GHMC license fee table updated", "FSSAI registration rule awaiting review", "Telugu translation for birth certificate verified"].map((item) => <p key={item} className="rounded-2xl bg-slate-50 p-4 font-semibold text-slate-600">{item}</p>)}
          </div>
        </Card>
        <Card>
          <h2 className="text-2xl font-black text-navy">Audit trail</h2>
          <div className="mt-5 space-y-3 text-sm text-slate-600">
            <p className="rounded-2xl bg-slate-50 p-4"><strong>Rule changed:</strong> Trade license now requires address proof confidence above 90%.</p>
            <p className="rounded-2xl bg-slate-50 p-4"><strong>Admin:</strong> District officer approved scheme metadata.</p>
            <p className="rounded-2xl bg-slate-50 p-4"><strong>Security:</strong> No failed RBAC events in last 24 hours.</p>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
