import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-3xl border border-slate-200 bg-white p-6 shadow-civic", className)} {...props} />;
}

export function StatCard({ label, value, tone = "navy" }: { label: string; value: string; tone?: "navy" | "saffron" | "green" }) {
  const toneClass = tone === "saffron" ? "text-saffron" : tone === "green" ? "text-telangana" : "text-navy";

  return (
    <Card className="p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-black ${toneClass}`}>{value}</p>
    </Card>
  );
}
