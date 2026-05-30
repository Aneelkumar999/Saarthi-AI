import { LinkButton } from "@/components/ui/button";

export function DemoBanner() {
  return (
    <section className="rounded-[2rem] bg-navy p-6 text-white shadow-civic md:p-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-200">Judge demo path</p>
          <h2 className="mt-2 text-2xl font-black">I want to open a tea shop in Hyderabad</h2>
          <p className="mt-2 max-w-2xl text-slate-300">Saarthi generates required licenses, departments, documents, forms, schemes, and progress tracking in one flow.</p>
        </div>
        <LinkButton href="/workflow" variant="primary">View Roadmap</LinkButton>
      </div>
    </section>
  );
}
