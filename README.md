
# ESGroww — Sustainability Readiness Intelligence Platform

AI-powered ESG assessment and sustainability readiness platform designed for hospitals, enterprises, educational institutions, manufacturing units, NGOs, logistics providers, and commercial facilities.

ESGroww transforms fragmented sustainability data into executive-grade intelligence through automated scoring engines, emissions analysis, benchmarking systems, certification readiness assessments, and strategic ESG roadmaps.

Built using Next.js App Router, TypeScript, Prisma ORM, PostgreSQL, and TailwindCSS.

---

# Executive Summary

Organizations today face a fragmented sustainability landscape with no unified platform capable of evaluating multi-framework ESG readiness from operational data uploads. Traditional sustainability consulting workflows rely heavily on manual analysis, disconnected spreadsheets, inconsistent calculations, and non-transparent assessments.

ESGroww solves this problem by delivering a centralized Sustainability Readiness Intelligence Platform capable of:

- Processing operational ESG data
- Validating uploaded records
- Annualizing incomplete datasets
- Applying confidence modifiers
- Calculating emissions
- Benchmarking sustainability metrics
- Generating certification readiness scores
- Producing executive-level ESG intelligence reports

The platform is designed to feel analytical, consulting-grade, transparent, and enterprise-ready.

---

# Key Features

## AI Assistant / Chatbot
- Integrated AI chatbot to help users navigate the platform, answer common questions, and assist with data uploads and interpretation.
- Implemented as a client-only, lazy-loaded component to avoid adding runtime weight to server-rendered pages. See `src/components/chatbot/ConditionalChatbotClient.tsx` and `src/components/chatbot/MistralChatbot.tsx` for implementation details.
- Chatbot is isolated behind a client wrapper (`ssr: false` moved into the client) to keep Server Components SSR-safe while preserving interactivity.
- Verification: open any page and confirm the chatbot loads client-side and responds to queries; check network/devtools to see the chatbot bundle loaded lazily.

## ESG Intelligence Features

- Multi-sector ESG readiness assessment
- Certification intelligence engine
- Automated annualization engine
- Confidence scoring system
- Scope 1, Scope 2, and Scope 3 emissions engine
- Benchmarking engine
- KPI analytics dashboard
- Regulatory readiness analysis
- Executive sustainability insights
- Strengths & critical gaps generation
- Priority action roadmap generation
- Certification pathway recommendations
- Executive-grade PDF reporting

---

## Platform Features

- Secure authentication system
- Role-based admin management
- ESG operational data uploads
- Multi-category upload management
- Intelligent validation engine
- Duplicate month detection
- Unit standardization system
- Upload merge strategies
- Dashboard analytics
- Downloadable sustainability reports
- Organization profile management
- Smart upload processing
- ESG scoring automation

---

# Supported Industries

| Sector | Applicable Certifications |
|---|---|
| Hospital / Healthcare | NABH, WELL, IGBC Healthcare, LEED Healthcare |
| Commercial Buildings | LEED, EDGE, WELL, IGBC |
| Manufacturing | ISO 14001, ISO 50001, EcoVadis |
| Textile Industry | GOTS, OEKO-TEX, ZDHC |
| Food & Beverage | FSSAI, HACCP, ISO 22000 |
| Logistics & Supply Chain | EcoVadis, GLEC |
| Educational Institutions | WELL, NAAC Sustainability |
| NGO / Social Impact | GRI, UN SDG |
| General Organizations | ISO 14001, BRSR, GRI, CDP |

---

# Application Workflow

## 1. User Registration & Authentication

- User registration
- Login system
- Email verification
- Password recovery
- Session management

---

## 2. Organization Profile Setup

Users configure:
- Industry / Sector
- Facility details
- Employee count
- Operational information
- Built-up area
- Sustainability profile

---

## 3. ESG Data Upload

Operational data categories:
- Electricity
- Water
- Fuel / DG
- Waste
- Refrigerants
- Transport
- Governance records
- Sector-specific ESG data

---

## 4. Validation & Processing

The platform automatically:
- Detects missing months
- Validates uploaded units
- Detects abnormal spikes
- Detects duplicate entries
- Performs cross-category validation
- Validates completeness thresholds

---

## 5. Annualization & Confidence Engine

The platform intelligently annualizes ESG operational data when users upload partial yearly records.

Formula:

```txt
Estimated Annual Value = Uploaded Total ÷ Uploaded Months × 12
````

Confidence modifiers:

* High Confidence
* Medium Confidence
* Low Confidence
* Insufficient Data

---

## 6. KPI & Emissions Calculation

The platform calculates:

* Energy intensity
* Water intensity
* Recycling %
* Renewable energy contribution
* Scope 1 emissions
* Scope 2 emissions
* Scope 3 emissions

---

## 7. Certification Readiness Scoring

Framework-specific weighted scoring:

* Energy
* Water
* Waste
* Governance
* Compliance
* Evidence
* Indoor Environment

---

## 8. Benchmarking & Gap Analysis

The system compares:

* Facility metrics
* Industry benchmarks
* Sector thresholds
* ESG performance indicators

---

## 9. Roadmap Generation

Automated roadmap generation includes:

* Critical gaps
* Recommended actions
* Certification pathways
* ESG priorities
* Sustainability milestones

---

## 10. PDF Report Export

Enterprise-style ESG reports including:

* Executive summaries
* KPI dashboards
* Readiness scoring
* Emissions analysis
* Benchmark comparisons
* Roadmaps
* Regulatory intelligence

---

# Tech Stack

## Frontend

* Next.js App Router
* React
* TypeScript
* TailwindCSS
* Framer Motion
* shadcn/ui

---

## Backend

* Prisma ORM
* PostgreSQL
* Server Actions
* API Routes

---

## ESG Processing

* ESG Scoring Engine
* Annualization Engine
* Confidence Engine
* Benchmarking Engine
* Emissions Calculation Engine
* Validation Engine

---

## File & PDF Processing

* XLSX Parsing
* CSV Processing
* jsPDF
* html2canvas
* Custom PDF templates

---

# Core ESG Engines

# Annualization Engine

The annualization engine intelligently estimates yearly ESG values from partial uploads.

Supported categories:

* Electricity
* Water
* Fuel
* Waste
* Production output

Logic:

* 12 months → actual values
* 6–11 months → annualized estimates
* <3 months → insufficient data

---

# Confidence Engine

Confidence scoring ensures transparency in ESG calculations.

| Months Uploaded | Confidence   |
| --------------- | ------------ |
| 12              | High         |
| 9–11            | High         |
| 6–8             | Medium       |
| 3–5             | Low          |
| <3              | Insufficient |

Confidence modifiers are applied only to dependent parameters.

---

# Emissions Engine

## Scope 1

Direct emissions:

* Diesel
* Fuel
* Refrigerants

## Scope 2

Indirect electricity emissions.

## Scope 3

Indirect operational emissions:

* Waste
* Water treatment
* Logistics

Emission factors follow:

* DEFRA
* IPCC
* GLEC
* Indian Grid Factors

---

# Benchmarking Engine

Sector-specific ESG benchmarking includes:

* Energy intensity
* Water intensity
* Recycling rate
* Renewable contribution
* Waste segregation
* Power factor
* DG dependency

Benchmark statuses:

* Within Benchmark
* Slightly Below Benchmark
* Needs Attention
* Better than Benchmark

---

# Upload Validation Engine

Validation checks include:

* Negative value detection
* Duplicate month detection
* Missing month analysis
* Unit consistency validation
* Cross-category consistency
* Abnormal spike detection

---

# Admin Dashboard

The admin panel includes:

* Hospital management
* Upload management
* Certification management
* Calculation management
* Risk analysis
* System configuration
* ESG analytics monitoring
* Validation tracking
* Report management

---

# Main Modules

## Authentication

* Login
* Registration
* Verification
* Password reset

## ESG Upload System

* Excel uploads
* CSV uploads
* Merge strategies
* Validation handling

## Upload Summary & Calculations

* Annualization
* KPI calculations
* Emissions analysis
* Confidence calculations

## Readiness Dashboard

* Certification readiness
* ESG scoring
* Sustainability analytics

## Risk Analysis

* ESG risk indicators
* Compliance readiness
* Critical gaps

## PDF Reporting

* Enterprise reports
* Dashboard exports
* Executive reports

## Admin Control Center

* Monitoring
* System management
* ESG operations

---

# Folder Structure

```txt
ESGroww/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── public/
│   ├── pdf_template/
│   └── templates/
│
├── src/
│   ├── actions/
│   │   ├── assessment.actions.ts
│   │   ├── chatbot.actions.ts
│   │   ├── dashboard.actions.ts
│   │   ├── governance.actions.ts
│   │   ├── summary.actions.ts
│   │   ├── upload.actions.ts
│   │   └── whereIStand.action.ts
│   │
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── loading.tsx
│   │   │
│   │   ├── (public)/
│   │   │   ├── page.tsx
│   │   │   ├── login/
│   │   │   └── register/
│   │   │
│   │   ├── admin/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── certifications/
│   │   │   ├── calculations/
│   │   │   ├── reports/
│   │   │   └── uploads/
│   │   │
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── assessment/
│   │   │   └── admin/
│   │   │
│   │   ├── upload/
│   │   ├── results/
│   │   ├── summary/
│   │   ├── kpi/
│   │   ├── metrics/
│   │   ├── glossary/
│   │   ├── analysis/
│   │   ├── where-i-stand/
│   │   └── what-next/
│   │
│   ├── components/
│   │   ├── admin/
│   │   ├── chatbot/
│   │   ├── dashboard/
│   │   ├── charts/
│   │   ├── results/
│   │   ├── summary/
│   │   ├── upload/
│   │   ├── shared/
│   │   ├── layout/
│   │   └── ui/
│   │
│   ├── hooks/
│   │   └── useFetchAssessment.ts
│   │
│   └── lib/
│       ├── auth.ts
│       ├── db.ts
│       ├── email.ts
│       ├── esgCalculations.ts
│       ├── glossaryData.ts
│       ├── kpiUtils.ts
│       ├── metricsUtils.ts
│       ├── validation.ts
│       ├── pdf/
│       ├── upload/
│       └── admin/
│
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

---

# ESG Intelligence Capabilities

The platform automatically generates:

* ESG strengths
* Critical sustainability gaps
* Certification readiness insights
* Benchmark comparisons
* Sustainability recommendations
* Executive summaries
* Priority ESG roadmap
* Certification sequencing

---

# PDF Reporting System

The PDF export system generates:

* A4 enterprise reports
* ESG dashboards
* KPI scorecards
* Certification readiness summaries
* Emissions breakdowns
* Executive insights
* Roadmaps
* Benchmark analysis

Features:

* Custom templates
* Branded watermarking
* Multi-page layouting
* Professional formatting
* Downloadable reports

---

# Installation

## Clone Repository

```bash
git clone <repository-url>
```

---

## Install Dependencies

```bash
npm install
```

---
## Prisma Setup

```bash
npx prisma generate
npx prisma db push
npx prisma studio
```

---

## Run Development Server

```bash
npm run dev
```

---

# Future Scope

Planned future enhancements:

* AI-powered ESG recommendations
* Predictive sustainability analytics
* Real-time utility integrations
* IoT-based ESG monitoring
* Multi-tenant SaaS deployment
* ESG consultant collaboration workflows
* Regulatory automation
* Audit workflow management
* Advanced emissions intelligence
* Live benchmark datasets

---

# Contributors

## Developed By

- Karthika Suresh
- Karthik S
---

# License

MIT License

---

# Disclaimer

This platform provides indicative sustainability intelligence and readiness assessments. Results generated by the system do not replace accredited environmental audits, official certification assessments, or regulatory approvals.


