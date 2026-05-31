<<<<<<< HEAD
"use client";

import { CheckCircle2, Clock3, LockKeyhole, MapPin, Upload, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { createMockDocument, saveDocument, getDocuments } from "@/lib/journey";
=======
import { CheckCircle2, Clock3, LockKeyhole, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
>>>>>>> origin/main

const statusIcon = {
  Ready: CheckCircle2,
  "Blocked by Step 1": LockKeyhole,
  Pending: Clock3,
  Optional: MapPin
};

<<<<<<< HEAD
function getUploadedDocTypes(): Set<string> {
  const docs = getDocuments();
  return new Set(docs.map((d) => d.type.toLowerCase()));
}

function getDocTypeFromName(docName: string): string {
  const lower = docName.toLowerCase();
  if (lower.includes("aadhaar")) return "Aadhaar";
  if (lower.includes("pan")) return "PAN";
  if (lower.includes("rent") || lower.includes("agreement")) return "Rental Agreement";
  if (lower.includes("photo") || lower.includes("passport photo")) return "Photo";
  if (lower.includes("bank")) return "Bank Passbook";
  if (lower.includes("income")) return "Income Certificate";
  if (lower.includes("caste") || lower.includes("community") || lower.includes("category")) return "Caste Certificate";
  if (lower.includes("birth")) return "Birth Certificate";
  if (lower.includes("marriage")) return "Marriage Certificate";
  if (lower.includes("property") || lower.includes("land") || lower.includes("survey") || lower.includes("pattadar") || lower.includes("title") || lower.includes("encumbrance") || lower.includes("sale")) return "Property Document";
  if (lower.includes("vehicle")) return "Vehicle Document";
  if (lower.includes("medical")) return "Medical Certificate";
  if (lower.includes("bonafide") || lower.includes("degree") || lower.includes("marksheet") || lower.includes("academic")) return "Education Certificate";
  if (lower.includes("salary")) return "Salary Slip";
  if (lower.includes("noc")) return "NOC";
  if (lower.includes("layout") || lower.includes("building") || lower.includes("plan")) return "Building Plan";
  if (lower.includes("food") || lower.includes("menu")) return "Food Business Document";
  if (lower.includes("safety") || lower.includes("fire")) return "Safety Certificate";
  if (lower.includes("crop")) return "Crop Details";
  if (lower.includes("mobile")) return "Mobile Number Proof";
  if (lower.includes("signature")) return "Signature";
  if (lower.includes("voter") || lower.includes("epic")) return "Voter ID";
  if (lower.includes("address")) return "Address Proof";
  if (lower.includes("age")) return "Age Proof";
  if (lower.includes("id proof") || lower.includes("parent")) return "ID Proof";
  if (lower.includes("form")) return "Application Form";
  if (lower.includes("receipt") || lower.includes("acknowledgement") || lower.includes("challan")) return "Receipt";
  if (lower.includes("witness") || lower.includes("invitation")) return "Supporting Document";
  if (lower.includes("test") || lower.includes("learner")) return "License Document";
  if (lower.includes("gas")) return "Gas Connection Proof";
  if (lower.includes("staff")) return "Staff Document";
  if (lower.includes("insurance")) return "Insurance Document";
  return "Document";
}

export function WorkflowStep({ step, onUpload }: { step: { id: number; title: string; dept: string; status: string; days: string; documents: string[] }; onUpload?: () => void }) {
  const Icon = statusIcon[step.status as keyof typeof statusIcon] ?? Clock3;
  const uploadedTypes = getUploadedDocTypes();

  function handleUpload(docName: string) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.png,.jpg,.jpeg,.doc,.docx";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const docType = getDocTypeFromName(docName);
      let document = createMockDocument(file.name);
      document = { ...document, type: docType, name: docName };
      saveDocument(document);
      onUpload?.();
      window.dispatchEvent(new CustomEvent("doc-uploaded"));
    };
    input.click();
  }
=======
export function WorkflowStep({ step }: { step: { id: number; title: string; dept: string; status: string; days: string; documents: string[] } }) {
  const Icon = statusIcon[step.status as keyof typeof statusIcon] ?? Clock3;
>>>>>>> origin/main

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute left-0 top-0 h-full w-1.5 bg-saffron" />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
<<<<<<< HEAD
        <div className="flex-1">
=======
        <div>
>>>>>>> origin/main
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
<<<<<<< HEAD
            {step.documents.map((doc) => {
              const docType = getDocTypeFromName(doc);
              const isUploaded = uploadedTypes.has(docType.toLowerCase());
              return (
                <button
                  key={doc}
                  onClick={() => handleUpload(doc)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    isUploaded
                      ? "bg-teal-50 text-telangana border border-teal-200"
                      : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-saffron hover:text-white hover:border-saffron cursor-pointer"
                  }`}
                  title={isUploaded ? `${doc} - Uploaded` : `Click to upload ${doc}`}
                >
                  {isUploaded ? <Check size={12} /> : <Upload size={12} />}
                  {doc}
                </button>
              );
            })}
=======
            {step.documents.map((doc) => (
              <span key={doc} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {doc}
              </span>
            ))}
>>>>>>> origin/main
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
