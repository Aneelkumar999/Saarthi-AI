import { CheckCircle2, Clock3, LockKeyhole, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";

const statusIcon = {
  Ready: CheckCircle2,
  "Blocked by Step 1": LockKeyhole,
  Pending: Clock3,
  Optional: MapPin
};

export function WorkflowStep({ step }: { step: { id: number; title: string; dept: string; status: string; days: string; documents: string[] } }) {
  const Icon = statusIcon[step.status as keyof typeof statusIcon] ?? Clock3;

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute left-0 top-0 h-full w-1.5 bg-saffron" />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cream text-saffron">
              <Icon size={21} />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-400">Step {step.id}</p>
              <h3 className="text-xl font-black text-navy">{step.title}</h3>
            </div>
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-600">{step.dept}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {step.documents.map((doc) => (
              <span key={doc} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {doc}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4 text-sm">
          <p className="font-black text-navy">{step.status}</p>
          <p className="mt-1 text-slate-500">Estimated {step.days}</p>
        </div>
      </div>
    </Card>
  );
}
