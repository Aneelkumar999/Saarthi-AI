# Saarthi AI – Hackathon Document

| Heading | Content |
|---------|---------|
| **Problem Statement** | Citizens struggle to navigate complex government procedures, identify required services, understand documentation requirements, and complete applications across multiple government portals. This leads to delays, confusion, and low adoption of digital governance services. |
| **Proposed Solution** | Saarthi AI is an AI-powered civic assistant that converts citizen goals into actionable government service roadmaps. Users describe what they want to achieve (e.g., start a business, apply for certificates, update records), and Saarthi AI generates personalized workflows, document checklists, multilingual guidance, and auto-filled application forms. |
| **Existing Solution** | UMANG, MeeSeva, T-App Folio, DigiLocker, ServicePlus, individual government department portals. |
| **What Unique Problems Will Your Solution Solve That Existing Solutions Do Not?** | • Goal-based navigation instead of service-based navigation. • AI-generated personalized government journey planner. • Automatic identification of all required approvals and dependencies. • Intelligent document analysis and form auto-filling. • Simple Telugu and English explanations. • Life-event-based assistance (marriage, business registration, birth, death, property purchase, etc.). • Unified citizen experience across multiple departments. |
| **What Is Your Plan To Complete A Working Solution By 1 PM Tomorrow?** | Phase 1: Build frontend and chatbot interface. Phase 2: Create workflow engine for 5-10 government services. Phase 3: Implement document upload + OCR. Phase 4: AI roadmap generation using Gemini/OpenAI. Phase 5: Generate downloadable checklists and filled forms. Phase 6: Final testing and deployment. |

---

## Technical Implementation Status

### Completed (Working)

| Feature | Status | Details |
|---------|--------|---------|
| React + Tailwind Frontend | ✅ Done | Landing page, AI Chat, Dashboard, Documents, Form Fill |
| Auth System | ✅ Done | Phone OTP, Email OTP, Google OAuth, JWT tokens |
| Backend API (FastAPI) | ✅ Done | 35+ endpoints, SQLite database |
| 10 Citizen Roadmaps | ✅ Done | Tea Shop, MSME, Birth Cert, Marriage, Property, DL, Scholarship, Farm, Income Cert, Food Truck |
| AI Intent Parsing | ✅ Done | Keyword matching + trigger keywords for all 20 intents |
| Roadmap Generation | ✅ Done | DB-driven roadmap with steps, departments, documents, schemes |
| Journey Tracking | ✅ Done | Create/list journeys, progress tracking |
| Dashboard Stats | ✅ Done | Real-time stats from database |
| Document Vault | ✅ Done | Upload, grid view, download |
| Form Auto-Fill | ✅ Done | Pre-filled forms from document OCR data |
| Responsive Design | ✅ Done | Mobile-first, Tailwind CSS |
| Telugu Support | ✅ Done | Telugu hints in roadmap generation |

### Architecture

```
Frontend (React + Tailwind)  →  Vite Proxy  →  Backend (FastAPI)
                                                     ↓
                                                SQLite DB
                                                     ↓
                                          AI Service (Gemini/OpenAI/Keyword)
```

### API Endpoints

| Category | Endpoint | Method | Description |
|----------|----------|--------|-------------|
| Auth | `/api/v1/auth/signup` | POST | Register new user |
| Auth | `/api/v1/auth/otp/send` | POST | Send OTP to phone/email |
| Auth | `/api/v1/auth/otp/verify` | POST | Verify OTP → JWT |
| Auth | `/api/v1/auth/google` | POST | Google OAuth mock |
| Chat | `/api/v1/chat` | POST | Parse intent + generate roadmap |
| Chat | `/api/v1/parse-intent` | POST | Parse intent from query |
| Workflow | `/api/v1/workflow/{intent_id}` | GET | Get workflow steps |
| Journeys | `/api/v1/journeys` | POST | Create journey |
| Journeys | `/api/v1/journeys` | GET | List user journeys |
| Dashboard | `/api/v1/dashboard/stats` | GET | Dashboard statistics |
| Intents | `/api/v1/intents` | GET | List all intents with services |
| Services | `/api/v1/services` | GET | List all services |
| Schemes | `/api/v1/schemes` | GET | List all schemes |
| Documents | `/api/v1/documents/upload` | POST | Upload + OCR document |
| Forms | `/api/v1/forms/generate/{id}` | GET | Generate pre-filled form |
| Profile | `/api/v1/profile` | GET/PUT | User profile |
| Admin | `/api/v1/admin/*` | * | Full admin CRUD |

### Database Tables (13)

| Table | Purpose | Seed Data |
|-------|---------|-----------|
| `users` | Registered citizens | 5 demo + dynamic |
| `otp_codes` | OTP verification | Empty |
| `intents` | 20 government service categories | 20 intents |
| `services` | 40 government services | 40 services |
| `intent_services` | Intent-to-service workflow mappings | 47 mappings |
| `service_dependencies` | DAG dependencies between services | 13 dependencies |
| `schemes` | 23 government welfare schemes | 23 schemes |
| `user_journeys` | Active user journeys | Dynamic |
| `journey_steps` | Individual step tracking | Dynamic |
| `user_documents` | Uploaded documents with OCR | 9 sample docs |
| `user_profiles` | Extended user profiles | 5 profiles |
| `user_schemes` | User-scheme associations | Dynamic |
| `audit_logs` | Audit trail | Empty |

### 10 Roadmaps Summary

| # | Roadmap | Steps | Documents Required | Schemes |
|---|---------|-------|-------------------|---------|
| 1 | Tea Shop | 6 | Aadhaar, PAN, Shop proof, Photos, Rental agreement | PM SVANidhi, MUDRA, T-PRIDE |
| 2 | MSME Registration | 4 | Aadhaar, PAN, Business address, Bank details | MUDRA, Udyog Aadhaar, Startup India |
| 3 | Birth Certificate | 5 | Hospital record, Parent Aadhaar, Address proof | Health registration guidance |
| 4 | Marriage Registration | 5 | Aadhaar (both), Wedding photos, Witness IDs | Kalyana Lakshmi, Shaadi Mubarak |
| 5 | Property Registration | 5 | Aadhaar, PAN, Property docs, Sale agreement | PM Awas Yojana |
| 6 | Driving License | 6 | Aadhaar, Address proof, Photos, Medical cert | Skill India |
| 7 | Student Scholarship | 6 | Aadhaar, Income cert, Bonafide, Bank passbook | Post Matric, Central Sector |
| 8 | Farm Subsidy | 6 | Aadhaar, Pattadar passbook, Bank account | Rythu Bandhu, PM-KISAN, Rythu Bima |
| 9 | Income/Caste Cert | 5 | Aadhaar, Address proof, Supporting certs | Post Matric, Ration Card, Ayushman |
| 10 | Food Truck/Restaurant | 6 | Aadhaar, PAN, Address proof, Food safety docs | PM SVANidhi, MUDRA, T-PRIDE |
