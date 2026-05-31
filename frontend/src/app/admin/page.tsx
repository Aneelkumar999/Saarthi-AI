<<<<<<< HEAD
"use client";

import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { Card, StatCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Database, FileText, Shield, Users, Search, Lock } from "lucide-react";
import { isAdmin, isAuthenticated } from "@/lib/auth";
import { useIsClient } from "@/lib/use-is-client";

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

type Tab = "services" | "intents" | "schemes" | "users" | "audit";

interface Service { id: number; name: string; department: string; fee: number; sla_days: number; description: string; }
interface Intent { id: number; name: string; description: string; trigger_keywords: string[]; services: { id: number; name: string; step_order: number }[]; has_roadmap_template: boolean; }
interface Scheme { id: number; name: string; description: string; category: string; region: string; eligibility_rules: Record<string, unknown>; }
interface User { id: number; phone: string; full_name: string; location: string; citizen_type: string; documents: number; journeys: number; created_at: string; }
interface Stats { total_services: number; total_intents: number; total_schemes: number; total_users: number; total_journeys: number; total_documents: number; }
interface AuditEntry { action: string; detail: Record<string, unknown>; timestamp: string; }

export default function AdminPage() {
  const isClient = useIsClient();
  const [tab, setTab] = useState<Tab>("services");
  const [stats, setStats] = useState<Stats | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [intents, setIntents] = useState<Intent[]>([]);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editField, setEditField] = useState("");
  const retryCountRef = useRef(0);

  const [formName, setFormName] = useState("");
  const [formDept, setFormDept] = useState("");
  const [formFee, setFormFee] = useState("");
  const [formSla, setFormSla] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, servicesRes, intentsRes, schemesRes, usersRes, auditRes] = await Promise.allSettled([
        fetch(`${API}/admin/stats`),
        fetch(`${API}/admin/services`),
        fetch(`${API}/admin/intents`),
        fetch(`${API}/admin/schemes`),
        fetch(`${API}/admin/users`),
        fetch(`${API}/admin/audit`),
      ]);
      if (statsRes.status === "fulfilled" && statsRes.value.ok) setStats(await statsRes.value.json());
      if (servicesRes.status === "fulfilled" && servicesRes.value.ok) setServices(await servicesRes.value.json());
      if (intentsRes.status === "fulfilled" && intentsRes.value.ok) setIntents(await intentsRes.value.json());
      if (schemesRes.status === "fulfilled" && schemesRes.value.ok) setSchemes(await schemesRes.value.json());
      if (usersRes.status === "fulfilled" && usersRes.value.ok) setUsers(await usersRes.value.json());
      if (auditRes.status === "fulfilled" && auditRes.value.ok) setAudit(await auditRes.value.json());
    } catch {
      if (retryCountRef.current < 3) {
        retryCountRef.current += 1;
        setError(`Failed to load. Retrying (${retryCountRef.current}/3)...`);
        setTimeout(fetchData, 3000);
      } else {
        setError("Failed to load admin data. Please refresh.");
      }
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchData(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      const url = tab === "services" ? `${API}/admin/services` : tab === "intents" ? `${API}/admin/intents` : `${API}/admin/schemes`;
      const body = tab === "services"
        ? { name: formName, department: formDept, fee: Number(formFee), sla_days: Number(formSla), description: formDesc }
        : tab === "intents"
          ? { name: formName, description: formDesc, trigger_keywords: formDept.split(",").map((s) => s.trim()).filter(Boolean) }
          : { name: formName, description: formDesc, eligibility_rules: { category: formDept || "general", region: "all" } };
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) {
        setFormName(""); setFormDept(""); setFormFee(""); setFormSla(""); setFormDesc("");
        fetchData();
      } else {
        const err = await res.json().catch(() => ({}));
        setFormError(err.detail || "Failed to create. Please try again.");
      }
    } catch {
      setFormError("Network error.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(entity: string, id: number) {
    if (!confirm(`Delete this ${entity}?`)) return;
    const res = await fetch(`${API}/admin/${entity}/${id}`, { method: "DELETE" });
    if (res.ok) fetchData();
  }

  async function handleInlineEdit(entity: string, id: number, field: string, value: string) {
    const body: Record<string, unknown> = {};
    if (field === "trigger_keywords") {
      body[field] = value.split(",").map((s) => s.trim()).filter(Boolean);
    } else if (field === "fee" || field === "sla_days") {
      body[field] = Number(value);
    } else if (field === "eligibility_rules") {
      try { body[field] = JSON.parse(value); } catch { return; }
    } else {
      body[field] = value;
    }
    const res = await fetch(`${API}/admin/${entity}/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) { setEditId(null); fetchData(); }
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode; count: number }[] = [
    { key: "services", label: "Services", icon: <Database size={16} />, count: services.length },
    { key: "intents", label: "Intents", icon: <FileText size={16} />, count: intents.length },
    { key: "schemes", label: "Schemes", icon: <Shield size={16} />, count: schemes.length },
    { key: "users", label: "Users", icon: <Users size={16} />, count: users.length },
    { key: "audit", label: "Audit", icon: <Shield size={16} />, count: audit.length },
  ];

  function filtered<T extends { name?: string; full_name?: string; doc_type?: string }>(list: T[]): T[] {
    if (!search) return list;
    const q = search.toLowerCase();
    return list.filter((item) => {
      const text = ("name" in item ? item.name : "full_name" in item ? item.full_name : "doc_type" in item ? item.doc_type : "") || "";
      return text.toLowerCase().includes(q);
    });
  }

  if (isClient && !isAuthenticated()) {
    return (
      <AppShell>
        <PageHeader eyebrow="Government admin console" title="Admin Access Required" description="Please log in to access the admin panel." />
        <Card className="max-w-md text-center space-y-4">
          <Lock size={48} className="mx-auto text-slate-300" />
          <p className="text-slate-600">You need to be logged in to access this page.</p>
        </Card>
      </AppShell>
    );
  }

  if (isClient && !isAdmin()) {
    return (
      <AppShell>
        <PageHeader eyebrow="Government admin console" title="Access Denied" description="You do not have admin privileges." />
        <Card className="max-w-md text-center space-y-4">
          <Lock size={48} className="mx-auto text-red-300" />
          <p className="text-slate-600">Only authorized administrators can access this page.</p>
          <p className="text-sm text-slate-400">Contact the administrator for access.</p>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader eyebrow="Government admin console" title="Manage your knowledge base" description="Full CRUD for services, intents, workflows, schemes, users, and audit trail." />

      {loading && <div className="mb-6 flex items-center gap-3 rounded-2xl bg-slate-100 p-4 text-sm font-semibold text-slate-600"><span className="h-4 w-4 animate-spin rounded-full border-2 border-saffron border-t-transparent" />Loading...</div>}
      {error && <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}

      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <StatCard label="Services" value={String(stats?.total_services ?? services.length)} />
        <StatCard label="Intents" value={String(stats?.total_intents ?? intents.length)} tone="green" />
        <StatCard label="Schemes" value={String(stats?.total_schemes ?? schemes.length)} tone="saffron" />
        <StatCard label="Users" value={String(stats?.total_users ?? users.length)} />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => { setTab(t.key); setSearch(""); setEditId(null); }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${tab === t.key ? "bg-navy text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}>
            {t.icon} {t.label} <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs">{t.count}</span>
          </button>
        ))}
      </div>

      {tab !== "audit" && (
        <div className="mb-6 flex gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5">
            <Search size={16} className="text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${tab}...`} className="flex-1 bg-transparent text-sm outline-none" />
          </div>
          {tab !== "users" && (
            <Button onClick={() => { setEditId(null); document.getElementById("create-form")?.scrollIntoView({ behavior: "smooth" }); }} className="gap-2">
              <Plus size={16} /> Add {tab === "services" ? "Service" : tab === "intents" ? "Intent" : "Scheme"}
            </Button>
          )}
        </div>
      )}

      {/* Services Tab */}
      {tab === "services" && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead><tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="pb-3 pr-4">Name</th><th className="pb-3 pr-4">Department</th><th className="pb-3 pr-4 text-right">Fee</th><th className="pb-3 pr-4 text-right">SLA</th><th className="pb-3 text-right">Actions</th>
              </tr></thead>
              <tbody>
                {filtered(services).map((s) => (
                  <tr key={s.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 pr-4">
                      {editId === s.id && editField === "name" ? (
                        <input autoFocus defaultValue={s.name} onBlur={(e) => handleInlineEdit("services", s.id, "name", e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleInlineEdit("services", s.id, "name", (e.target as HTMLInputElement).value)} className="w-full rounded border border-saffron px-2 py-1 text-sm" />
                      ) : <span className="font-semibold text-navy cursor-pointer hover:text-saffron" onClick={() => { setEditId(s.id); setEditField("name"); }}>{s.name}</span>}
                    </td>
                    <td className="py-3 pr-4 text-slate-600">{s.department}</td>
                    <td className="py-3 pr-4 text-right font-semibold">₹{s.fee}</td>
                    <td className="py-3 pr-4 text-right">{s.sla_days}d</td>
                    <td className="py-3 text-right">
                      <button onClick={() => handleDelete("services", s.id)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50" aria-label={`Delete ${s.name}`}><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
                {filtered(services).length === 0 && !loading && <tr><td colSpan={5} className="py-8 text-center text-slate-400">No services found</td></tr>}
              </tbody>
            </table>
          </div>
          <div id="create-form" className="mt-6 border-t border-slate-200 pt-6">
            <h3 className="text-lg font-black text-navy mb-4">Add New Service</h3>
            <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2">
              <input required value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Service name" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-saffron" />
              <input required value={formDept} onChange={(e) => setFormDept(e.target.value)} placeholder="Department" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-saffron" />
              <input required type="number" min={0} value={formFee} onChange={(e) => setFormFee(e.target.value)} placeholder="Fee (₹)" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-saffron" />
              <input required type="number" min={1} value={formSla} onChange={(e) => setFormSla(e.target.value)} placeholder="SLA days" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-saffron" />
              <textarea required value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Description" rows={2} className="md:col-span-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-saffron" />
              {formError && <div className="md:col-span-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">{formError}</div>}
              <div className="md:col-span-2"><Button type="submit" disabled={submitting} className="w-full">{submitting ? "Creating..." : "Create Service"}</Button></div>
            </form>
          </div>
        </Card>
      )}

      {/* Intents Tab */}
      {tab === "intents" && (
        <Card>
          <div className="space-y-4">
            {filtered(intents).map((intent) => (
              <div key={intent.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {editId === intent.id && editField === "name" ? (
                      <input autoFocus defaultValue={intent.name} onBlur={(e) => handleInlineEdit("intents", intent.id, "name", e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleInlineEdit("intents", intent.id, "name", (e.target as HTMLInputElement).value)} className="w-full rounded border border-saffron px-2 py-1 text-lg font-black text-navy" />
                    ) : <h3 className="text-lg font-black text-navy cursor-pointer hover:text-saffron" onClick={() => { setEditId(intent.id); setEditField("name"); }}>{intent.name}</h3>}
                    <p className="mt-1 text-sm text-slate-500">{intent.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {intent.trigger_keywords.map((kw) => <span key={kw} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">{kw}</span>)}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {intent.services.map((s) => <span key={s.id} className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-bold text-telangana">Step {s.step_order}: {s.name}</span>)}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {intent.has_roadmap_template && <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-bold text-green-700">Template</span>}
                    <button onClick={() => handleDelete("intents", intent.id)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div id="create-form" className="mt-6 border-t border-slate-200 pt-6">
            <h3 className="text-lg font-black text-navy mb-4">Add New Intent</h3>
            <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2">
              <input required value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Intent name (e.g. Driving License)" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-saffron" />
              <input required value={formDept} onChange={(e) => setFormDept(e.target.value)} placeholder="Keywords (comma separated)" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-saffron" />
              <textarea required value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Description" rows={2} className="md:col-span-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-saffron" />
              {formError && <div className="md:col-span-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">{formError}</div>}
              <div className="md:col-span-2"><Button type="submit" disabled={submitting} className="w-full">{submitting ? "Creating..." : "Create Intent"}</Button></div>
            </form>
          </div>
        </Card>
      )}

      {/* Schemes Tab */}
      {tab === "schemes" && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead><tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="pb-3 pr-4">Name</th><th className="pb-3 pr-4">Description</th><th className="pb-3 pr-4">Category</th><th className="pb-3 pr-4">Region</th><th className="pb-3 text-right">Actions</th>
              </tr></thead>
              <tbody>
                {filtered(schemes).map((s) => (
                  <tr key={s.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 pr-4 font-semibold text-navy">{s.name}</td>
                    <td className="py-3 pr-4 text-slate-600 max-w-xs truncate">{s.description}</td>
                    <td className="py-3 pr-4"><span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">{s.category}</span></td>
                    <td className="py-3 pr-4 text-slate-600">{s.region}</td>
                    <td className="py-3 text-right">
                      <button onClick={() => handleDelete("schemes", s.id)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div id="create-form" className="mt-6 border-t border-slate-200 pt-6">
            <h3 className="text-lg font-black text-navy mb-4">Add New Scheme</h3>
            <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2">
              <input required value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Scheme name" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-saffron" />
              <input required value={formDept} onChange={(e) => setFormDept(e.target.value)} placeholder="Category (business/farmer/bpl/general)" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-saffron" />
              <textarea required value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Description / benefit" rows={2} className="md:col-span-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-saffron" />
              {formError && <div className="md:col-span-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">{formError}</div>}
              <div className="md:col-span-2"><Button type="submit" disabled={submitting} className="w-full">{submitting ? "Creating..." : "Create Scheme"}</Button></div>
            </form>
          </div>
        </Card>
      )}

      {/* Users Tab */}
      {tab === "users" && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead><tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="pb-3 pr-4">Name</th><th className="pb-3 pr-4">Phone</th><th className="pb-3 pr-4">Location</th><th className="pb-3 pr-4">Type</th><th className="pb-3 pr-4 text-right">Docs</th><th className="pb-3 text-right">Journeys</th>
              </tr></thead>
              <tbody>
                {filtered(users).map((u) => (
                  <tr key={u.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 pr-4 font-semibold text-navy">{u.full_name}</td>
                    <td className="py-3 pr-4 text-slate-600">{u.phone}</td>
                    <td className="py-3 pr-4 text-slate-600">{u.location}</td>
                    <td className="py-3 pr-4"><span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">{u.citizen_type}</span></td>
                    <td className="py-3 pr-4 text-right">{u.documents}</td>
                    <td className="py-3 text-right">{u.journeys}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Audit Tab */}
      {tab === "audit" && (
        <Card>
          <div className="space-y-3">
            {audit.length > 0 ? audit.map((entry, idx) => (
              <div key={`${entry.action}-${idx}`} className="rounded-2xl bg-slate-50 p-4">
                <p className="font-bold text-navy">{entry.action}</p>
                <p className="mt-1 text-sm text-slate-600">{typeof entry.detail?.message === "string" ? entry.detail.message : JSON.stringify(entry.detail)}</p>
                <p className="mt-1 text-xs text-slate-400">{entry.timestamp ? new Date(entry.timestamp).toLocaleString() : ""}</p>
              </div>
            )) : (
              <>
                <div className="rounded-2xl bg-slate-50 p-4"><p><strong>System:</strong> Knowledge base initialized with 20 intents, 40 services, 23 schemes.</p></div>
                <div className="rounded-2xl bg-slate-50 p-4"><p><strong>Rule changed:</strong> Trade license now requires address proof confidence above 90%.</p></div>
                <div className="rounded-2xl bg-slate-50 p-4"><p><strong>Security:</strong> No failed RBAC events in last 24 hours.</p></div>
              </>
            )}
          </div>
        </Card>
      )}
=======
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
>>>>>>> origin/main
    </AppShell>
  );
}
