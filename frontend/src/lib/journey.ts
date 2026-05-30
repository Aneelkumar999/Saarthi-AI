export type RoadmapStep = {
  id: number;
  title: string;
  dept: string;
  status: string;
  days: string;
  documents: string[];
};

export type SavedRoadmap = {
  id: string;
  goal: string;
  intent: string;
  location: string;
  title: string;
  timeline: string;
  fastestPath: string;
  teluguHint: string;
  steps: RoadmapStep[];
  schemes: string[];
  createdAt: string;
};

export type SavedDocument = {
  id: string;
  name: string;
  type: string;
  state: string;
  confidence: string;
  fields: Record<string, string>;
  createdAt: string;
};

const ROADMAP_KEY = "saarthi_current_roadmap";
const DOCS_KEY = "saarthi_saved_documents";

export function generateRoadmap(goal: string): SavedRoadmap {
  const normalized = goal.toLowerCase();

  if (normalized.includes("birth")) {
    return buildRoadmap(goal, {
      intent: "Birth certificate",
      location: inferLocation(goal),
      title: "Birth certificate roadmap",
      timeline: "7-21",
      fastestPath: "Keep hospital discharge summary and parent Aadhaar ready before visiting the municipal counter or portal.",
      teluguHint: "ముందుగా హాస్పిటల్ డిశ్చార్జ్ సమరీ మరియు తల్లిదండ్రుల ఆధార్ సిద్ధం చేయండి.",
      schemes: ["Newborn health registration guidance", "MeeSeva certificate support"],
      steps: [
        step(1, "Hospital birth record verification", "Hospital / Municipality", "Ready", "1-2 days", ["Hospital discharge summary", "Parent Aadhaar"]),
        step(2, "Birth registration application", "GHMC / Municipality", "Pending", "5-14 days", ["Form 1", "Parent ID proof", "Address proof"]),
        step(3, "Certificate download or collection", "MeeSeva / Municipality", "Pending", "1-5 days", ["Application acknowledgement"])
      ]
    });
  }

  if (normalized.includes("farm") || normalized.includes("agri") || normalized.includes("land")) {
    return buildRoadmap(goal, {
      intent: "Agriculture land or farmer service",
      location: inferLocation(goal),
      title: "Agriculture service roadmap",
      timeline: "10-30",
      fastestPath: "Verify land ownership records and Aadhaar-bank linkage before applying for farmer schemes.",
      teluguHint: "ముందుగా భూమి పత్రాలు మరియు బ్యాంక్ లింక్ అయిన ఆధార్ సిద్ధం చేయండి.",
      schemes: ["Rythu Bandhu", "PM-KISAN", "Crop insurance"],
      steps: [
        step(1, "Land record verification", "Revenue Department", "Ready", "3-7 days", ["Pattadar passbook", "Aadhaar", "Survey number"]),
        step(2, "Farmer profile update", "Agriculture Department", "Pending", "3-10 days", ["Bank passbook", "Aadhaar", "Mobile number"]),
        step(3, "Scheme eligibility application", "Agriculture Department", "Pending", "7-15 days", ["Land record", "Bank details", "Crop details"])
      ]
    });
  }

  if (normalized.includes("marriage")) {
    return buildRoadmap(goal, {
      intent: "Marriage registration",
      location: inferLocation(goal),
      title: "Marriage registration roadmap",
      timeline: "15-30",
      fastestPath: "Collect age proofs, address proofs, wedding photos, and witness IDs before slot booking.",
      teluguHint: "సాక్షుల ఐడీలు మరియు వివాహ ఫోటోలు ముందుగానే సిద్ధం చేయండి.",
      schemes: ["MeeSeva registration assistance"],
      steps: [
        step(1, "Document readiness check", "Registration Department", "Ready", "1-2 days", ["Bride ID", "Groom ID", "Age proof", "Photos"]),
        step(2, "Marriage registration application", "Sub-Registrar Office", "Pending", "7-15 days", ["Witness IDs", "Invitation card", "Address proof"]),
        step(3, "Certificate verification", "Sub-Registrar Office", "Pending", "7-15 days", ["Application receipt"])
      ]
    });
  }

  return buildRoadmap(goal, {
    intent: normalized.includes("business") || normalized.includes("shop") || normalized.includes("tea") ? "Small business registration" : "Government service request",
    location: inferLocation(goal),
    title: normalized.includes("tea") ? "Tea shop roadmap for Hyderabad" : "Small business service roadmap",
    timeline: "15-20",
    fastestPath: "Upload Aadhaar, PAN, rental agreement, and shop address proof, then start Labour registration first.",
    teluguHint: "ముందుగా ఆధార్, పాన్, రెంటల్ అగ్రిమెంట్ అప్లోడ్ చేసి షాప్ రిజిస్ట్రేషన్ ప్రారంభించండి.",
    schemes: ["PM SVANidhi", "MUDRA Shishu Loan", "Telangana T-PRIDE"],
    steps: [
      step(1, "Shop & Establishment Registration", "Telangana Labour Department", "Ready", "2-4 days", ["Aadhaar", "PAN", "Shop address proof"]),
      step(2, "GHMC Trade License", "Greater Hyderabad Municipal Corporation", "Blocked by Step 1", "5-7 days", ["Rental agreement", "Photos", "NOC if applicable"]),
      step(3, "FSSAI Basic Registration", "Food Safety and Standards Authority", "Pending", "7-10 days", ["Food business details", "ID proof", "Applicant photo"]),
      step(4, "GST Readiness Check", "Commercial Taxes / GSTN", "Optional", "1-3 days", ["PAN", "Bank details", "Business address proof"])
    ]
  });
}

export function normalizeApiRoadmap(goal: string, roadmap: unknown): SavedRoadmap | null {
  if (!roadmap || typeof roadmap !== "object") return null;
  const data = roadmap as Partial<SavedRoadmap> & { response?: string };
  if (!Array.isArray(data.steps)) return null;

  return {
    id: crypto.randomUUID(),
    goal: String(data.goal || goal),
    intent: String(data.intent || "Government service request"),
    location: String(data.location || "Telangana"),
    title: String(data.title || "Personalized government service roadmap"),
    timeline: String(data.timeline || "7-15"),
    fastestPath: String(data.fastestPath || "Upload required documents first, then start the first available approval."),
    teluguHint: String(data.teluguHint || "ముందుగా అవసరమైన పత్రాలు సిద్ధం చేయండి."),
    schemes: Array.isArray(data.schemes) ? data.schemes.map(String) : [],
    steps: data.steps.map((step, index) => ({
      id: Number(step.id || index + 1),
      title: String(step.title || "Government service step"),
      dept: String(step.dept || "Relevant department"),
      status: String(step.status || (index === 0 ? "Ready" : "Pending")),
      days: String(step.days || "3-7 days"),
      documents: Array.isArray(step.documents) ? step.documents.map(String) : ["Aadhaar", "Address proof"]
    })),
    createdAt: new Date().toISOString()
  };
}

export function saveRoadmap(roadmap: SavedRoadmap) {
  localStorage.setItem(ROADMAP_KEY, JSON.stringify(roadmap));
}

export function getRoadmap(): SavedRoadmap | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(ROADMAP_KEY);
  return raw ? JSON.parse(raw) as SavedRoadmap : null;
}

export function saveDocument(document: SavedDocument) {
  const docs = getDocuments().filter((item) => item.type !== document.type);
  localStorage.setItem(DOCS_KEY, JSON.stringify([document, ...docs]));
}

export function getDocuments(): SavedDocument[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(DOCS_KEY);
  return raw ? JSON.parse(raw) as SavedDocument[] : [];
}

export function buildFormFields(roadmap: SavedRoadmap | null, docs: SavedDocument[]) {
  const mergedFields = docs.reduce<Record<string, string>>((fields, doc) => ({ ...fields, ...doc.fields }), {});
  const firstStep = roadmap?.steps[0];

  return [
    { label: "Applicant Name", value: mergedFields.name ?? "Upload Aadhaar to auto-fill", source: mergedFields.name ? "Saved Aadhaar OCR" : "Missing document", confidence: mergedFields.name ? "98%" : "0%" },
    { label: "Date of Birth", value: mergedFields.dob ?? "Upload Aadhaar/PAN", source: mergedFields.dob ? "Saved document OCR" : "Missing document", confidence: mergedFields.dob ? "94%" : "0%" },
    { label: "Phone", value: mergedFields.phone ?? "Verified login phone", source: "Auth profile", confidence: "100%" },
    { label: "Business / Service Goal", value: roadmap?.goal ?? "Ask Saarthi in chat first", source: roadmap ? "AI roadmap" : "Missing roadmap", confidence: roadmap ? "95%" : "0%" },
    { label: "Application Type", value: firstStep?.title ?? "No workflow selected", source: roadmap ? "Workflow engine" : "Missing roadmap", confidence: roadmap ? "100%" : "0%" },
    { label: "Department", value: firstStep?.dept ?? "No department selected", source: roadmap ? "Government knowledge base" : "Missing roadmap", confidence: roadmap ? "100%" : "0%" },
    { label: "Address", value: mergedFields.address ?? roadmap?.location ?? "Upload address proof", source: mergedFields.address ? "Saved address proof OCR" : "Roadmap location", confidence: mergedFields.address ? "90%" : "70%" },
    { label: "ID Number", value: mergedFields.idNumber ?? "Upload Aadhaar/PAN", source: mergedFields.idNumber ? "Saved document OCR" : "Missing document", confidence: mergedFields.idNumber ? "92%" : "0%" }
  ];
}

export function createMockDocument(fileName: string): SavedDocument {
  const lower = fileName.toLowerCase();
  const type = lower.includes("pan") ? "PAN" : lower.includes("rent") || lower.includes("agreement") ? "Rental Agreement" : "Aadhaar";
  const fields: Record<string, string> = type === "PAN"
    ? { name: "Anil Kumar", idNumber: "ABCDE1234F" }
    : type === "Rental Agreement"
      ? { address: "Hyderabad, Telangana", premisesOwner: "Verified owner" }
      : { name: "Anil Kumar", dob: "2004-01-01", address: "Hyderabad, Telangana", idNumber: "XXXX-XXXX-1234" };

  return {
    id: crypto.randomUUID(),
    name: fileName,
    type,
    state: "Verified",
    confidence: type === "Rental Agreement" ? "86%" : "98%",
    fields,
    createdAt: new Date().toISOString()
  };
}

function buildRoadmap(goal: string, data: Omit<SavedRoadmap, "id" | "goal" | "createdAt">): SavedRoadmap {
  return {
    id: crypto.randomUUID(),
    goal,
    createdAt: new Date().toISOString(),
    ...data
  };
}

function step(id: number, title: string, dept: string, status: string, days: string, documents: string[]): RoadmapStep {
  return { id, title, dept, status, days, documents };
}

function inferLocation(goal: string) {
  const normalized = goal.toLowerCase();
  if (normalized.includes("hyderabad")) return "Hyderabad, Telangana";
  if (normalized.includes("telangana")) return "Telangana";
  return "Telangana";
}
