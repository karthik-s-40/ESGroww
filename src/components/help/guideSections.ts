import type { GuideSection } from "./HelpComponents";
import { Sparkles, UserRound, Upload, LayoutDashboard, Gauge, Bot } from "lucide-react";

export const guideSections: GuideSection[] = [
  {
    id: "access-onboarding",
    eyebrow: "Getting started",
    title: "Access and onboarding",
    description:
      "Open the public screens first, create your account, verify access, and recover your password when needed.",
    icon: Sparkles,
    steps: [
      {
        step: "01",
        title: "Open the landing page",
        description: "Use the home screen to start the sign-up or sign-in flow.",
        result: "You begin from a clean entry point that introduces the platform and the two main account actions.",
        screenshots: [
          {
            src: "/help-shots/home.png",
            alt: "ESGroww home page hero with Get Started and Sign In actions",
          },
        ],
      },
      {
        step: "02",
        title: "Create your account",
        description: "Register with your name, email, organization details, sector, and password.",
        result: "Your organization profile is created at the same time as your user account, so future assessments stay aligned.",
        screenshots: [
          {
            src: "/help-shots/register.png",
            alt: "Registration form with organization and sector fields",
          },
        ],
      },
      {
        step: "03",
        title: "Log in with your verified account",
        description: "Use the login form to enter the workspace after registration or verification.",
        result: "You can return to the platform with the account that owns the assessment history and exports.",
        screenshots: [
          {
            src: "/help-shots/login.png",
            alt: "Log in form with email and password fields",
          },
        ],
      },
      {
        step: "04",
        title: "Reset access if you forget your password",
        description: "Request a reset link, then set a new password on the secure reset screen.",
        result: "You restore access without rebuilding the organization record or assessment history.",
        screenshots: [
          {
            src: "/help-shots/forgot-password.png",
            alt: "Forgot password form for requesting a reset email",
          },
          {
            src: "/help-shots/reset-password.png",
            alt: "Reset password form for choosing a new password",
          },
        ],
      },
    ],
    tips: [
      "Use an organization email address so account recovery and verification messages reach the right inbox.",
      "Keep the sector and country values accurate during registration because they shape benchmarks and onboarding context.",
      "If a reset link expires, request a new one instead of trying to reuse the old message.",
    ],
    mistakes: [
      "Leaving the password confirmation mismatched when creating the account.",
      "Expecting access to open before the email verification step is completed.",
      "Using a personal email or the wrong organization record, which makes later reporting harder to reconcile.",
    ],
  },
  {
    id: "profile-account",
    eyebrow: "Account settings",
    title: "Profile and organization details",
    description:
      "Keep the organization record current so scores, intensity metrics, and exports reflect the right facility data.",
    icon: UserRound,
    steps: [
      {
        step: "01",
        title: "Open your profile",
        description: "Use the user profile screen to review the organization context attached to your account.",
        result: "You can confirm the core hospital or facility metadata before editing anything.",
        screenshots: [
          {
            src: "/help-shots/profile.png",
            alt: "Profile page with organization summary and readiness overview",
          },
        ],
      },
      {
        step: "02",
        title: "Review facility metadata",
        description:
          "Check the hospital name, industry, country, state, built-up area, bed count, employee count, operating hours, and year established.",
        result: "These values flow into assessment logic, confidence signals, and downstream reporting.",
        screenshots: [
          {
            src: "/help-shots/profile.png",
            alt: "Profile page showing organization metadata cards",
          },
        ],
      },
      {
        step: "03",
        title: "Edit and save changes",
        description: "Open the edit modal, change the values you need, and save the updated profile.",
        result: "Future assessments and reports use the new organization metadata immediately after saving.",
        screenshots: [
          {
            src: "/help-shots/profile-edit.png",
            alt: "Profile edit modal with editable organization fields",
          },
        ],
      },
      {
        step: "04",
        title: "Return to the workspace",
        description: "Go back to uploads, summary, or results after making account changes.",
        result: "Your reporting context stays consistent because the profile and the active cycle still match.",
        screenshots: [
          {
            src: "/help-shots/assessment-workspace.png",
            alt: "Assessment workspace after returning from profile settings",
          },
        ],
      },
    ],
    tips: [
      "Update profile data before starting a new assessment cycle so every calculation uses the latest context.",
      "Keep built-up area and bed counts synchronized with the source record because KPI and benchmark logic depend on them.",
      "Treat profile edits as part of the reporting workflow, not just a cosmetic change.",
    ],
    mistakes: [
      "Editing organization details after exporting a report, which can create mismatches between the file and the live profile.",
      "Assuming profile fields are optional when they influence calculated results.",
      "Forgetting to save the profile after changing the modal values.",
    ],
  },
  {
    id: "assessment-workspace",
    eyebrow: "Core workflow",
    title: "Assessment workspace and governance",
    description:
      "Upload monthly data, manage assessment cycles, and complete the governance questionnaire that supports readiness scoring.",
    icon: Upload,
    steps: [
      {
        step: "01",
        title: "Start a new assessment cycle",
        description: "Create or switch the active cycle before uploading any records.",
        result: "The workspace is tied to the correct cycle, so uploads and reporting are grouped correctly from the start.",
        screenshots: [
          {
            src: "/help-shots/assessment-workspace.png",
            alt: "Assessment workspace with upload panels and side rail",
          },
        ],
      },
      {
        step: "02",
        title: "Upload operational records",
        description: "Add electricity, water, waste, and related monthly records through the upload workspace.",
        result: "Each valid upload extends the data history and moves the cycle toward summary readiness.",
        screenshots: [
          {
            src: "/help-shots/assessment-workspace.png",
            alt: "Upload workspace with category grid and recent uploads panel",
          },
        ],
      },
      {
        step: "03",
        title: "Watch the readiness gate",
        description: "Use the progress cues to see when there is enough data for stronger confidence.",
        result: "You know when the dataset is mature enough to read the summary and results with confidence.",
        screenshots: [
          {
            src: "/help-shots/assessment-workspace.png",
            alt: "Readiness indicators and recent upload status in the assessment workspace",
          },
        ],
      },
      {
        step: "04",
        title: "Complete the governance questionnaire",
        description: "Confirm policy, committee, audit, and compliance signals in the governance screen.",
        result: "Governance responses are stored with the assessment context and improve the overall readiness picture.",
        screenshots: [
          {
            src: "/help-shots/governance.png",
            alt: "Governance questionnaire with checkbox-style items and save action",
          },
        ],
      },
      {
        step: "05",
        title: "Review prior cycles when needed",
        description: "Open history to switch to an older assessment or compare how the current cycle has changed.",
        result: "You can move between cycles without rebuilding the assessment context manually.",
        screenshots: [
          {
            src: "/help-shots/history.png",
            alt: "Assessment history table with cycles and active status",
          },
        ],
      },
    ],
    tips: [
      "Incremental uploads are accepted, so you can keep building the cycle as data becomes available.",
      "Electricity, Water, and Waste are the most important categories for unlocking the readiness gate.",
      "Save the governance questionnaire after every update so the cycle remains synchronized.",
    ],
    mistakes: [
      "Uploading only one category and expecting the summary to behave as if the cycle were complete.",
      "Starting a new cycle before checking whether the current one already contains the needed data.",
      "Skipping governance because it looks optional in the moment.",
    ],
  },
  {
    id: "summary-results",
    eyebrow: "Reporting",
    title: "Summary, detailed results, and exports",
    description:
      "Move from the executive summary into the detailed report view, then export the PDFs you need for sharing.",
    icon: LayoutDashboard,
    steps: [
      {
        step: "01",
        title: "Review the summary first",
        description: "Open Summary to see the overall score, readiness stage, and the most important insights.",
        result: "You get a compact executive snapshot that explains the current state of the active cycle.",
        screenshots: [
          {
            src: "/help-shots/summary.png",
            alt: "Summary page with ESG Intelligence Center hero and readiness score",
          },
        ],
      },
      {
        step: "02",
        title: "Move to the detailed results dashboard",
        description: "Open the full dashboard when you need scoring detail, benchmarks, and the roadmap-style report view.",
        result: "You move from the short executive view into the full analytical report without losing context.",
        screenshots: [
          {
            src: "/help-shots/results.png",
            alt: "Results page with readiness gauge and report actions",
          },
          {
            src: "/help-shots/summary.png",
            alt: "Summary page used as the jump-off point for detailed results",
          },
        ],
      },
      {
        step: "03",
        title: "Download the summary PDF",
        description: "Use the summary export when stakeholders only need the concise executive version.",
        result: "The generated PDF gives you a fast way to share the current status with non-specialist readers.",
        screenshots: [
          {
            src: "/help-shots/summary.png",
            alt: "Summary page with download PDF action",
          },
        ],
      },
      {
        step: "04",
        title: "Download the full results report",
        description: "Use the report export for the longer-form dashboard output.",
        result: "You can share the more detailed report that mirrors the dashboard view.",
        screenshots: [
          {
            src: "/help-shots/results.png",
            alt: "Results page with download report action",
          },
        ],
      },
      {
        step: "05",
        title: "Book a consultation if needed",
        description: "Use the consultation action from Results when you want a guided follow-up review.",
        result: "The report becomes the starting point for a support conversation instead of a dead end.",
        screenshots: [
          {
            src: "/help-shots/results.png",
            alt: "Results page showing the consultation button for follow-up support",
          },
        ],
      },
    ],
    tips: [
      "Check the active cycle before exporting so the PDF matches the period you want to share.",
      "Use Summary for fast stakeholder updates and Results for deeper review.",
      "Review the on-screen report before downloading so obvious issues are caught early.",
    ],
    mistakes: [
      "Exporting before confirming that the right cycle is active.",
      "Expecting the summary PDF to contain the same detail as the results export.",
      "Skipping the on-screen review and assuming the PDF will fix data issues later.",
    ],
  },
  {
    id: "analytics-benchmarks",
    eyebrow: "Analysis",
    title: "Analytics and benchmark comparison",
    description:
      "Use KPI, Metrics, and Analysis together to interpret performance, completeness, confidence, and benchmark position.",
    icon: Gauge,
    steps: [
      {
        step: "01",
        title: "Open KPI for threshold-based scorecards",
        description: "Review the KPI dashboard to see how each metric maps against its target range.",
        result: "You can tell which values score fully, partially, or not at all without reading the raw tables first.",
        screenshots: [
          {
            src: "/help-shots/kpi.png",
            alt: "KPI dashboard with scorecards and status summary",
          },
        ],
      },
      {
        step: "02",
        title: "Open Metrics for completeness and confidence",
        description: "Use Metrics to compare category scores, completeness, confidence, and months uploaded.",
        result: "You see where the dataset is strong, where it is sparse, and which categories still need more history.",
        screenshots: [
          {
            src: "/help-shots/metrics.png",
            alt: "Metrics page with completeness and confidence charts",
          },
        ],
      },
      {
        step: "03",
        title: "Use the two views together",
        description: "Read KPI and Metrics as one workflow when deciding what to upload, fix, or communicate next.",
        result: "The analytics stack turns raw assessment output into practical next actions.",
        screenshots: [
          {
            src: "/help-shots/kpi.png",
            alt: "KPI scorecards used alongside the metrics page",
          },
          {
            src: "/help-shots/metrics.png",
            alt: "Metrics page used alongside KPI scorecards",
          },
        ],
      },
    ],
    tips: [
      "Read KPI first if you want a quick status check, then move to Metrics for data quality.",
      "Confidence and completeness are not the same thing.",
      "Use analytics after a fresh upload batch so the charts reflect the latest assessment data.",
    ],
    mistakes: [
      "Treating every score as if it uses the same logic.",
      "Reading zero values as failure without checking whether the upload cycle actually contains enough history.",
      "Skipping benchmark context and overinterpreting a single scorecard in isolation.",
    ],
  },
  {
    id: "reference-support",
    eyebrow: "Reference and support",
    title: "Glossary, history, chatbot, and help",
    description:
      "Use the support screens and assistant widget to look up terms, revisit older cycles, and get fast guidance while working.",
    icon: Bot,
    steps: [
      {
        step: "01",
        title: "Search the glossary",
        description: "Open Glossary when an acronym, certification label, or ESG term is unfamiliar.",
        result: "You can decode the platform vocabulary without leaving the application.",
        screenshots: [
          {
            src: "/help-shots/glossary.png",
            alt: "Glossary page with searchable ESG terms and abbreviation cards",
          },
        ],
      },
      {
        step: "02",
        title: "Revisit assessment history",
        description: "Use history when you need to compare cycles or switch the active context.",
        result: "Older snapshots remain available for audit, comparison, and result review.",
        screenshots: [
          {
            src: "/help-shots/history.png",
            alt: "Assessment history table with past cycles and status badges",
          },
        ],
      },
      {
        step: "03",
        title: "Ask Evio for guidance",
        description: "Use the floating chatbot on authenticated screens to ask about readiness gaps, compliance, certifications, or next steps.",
        result: "You get quick explanations in the general, regulatory, or certificate-focused modes.",
        screenshots: [
          {
            src: "/help-shots/chatbot-open.png",
            alt: "Evio chatbot open with mode selector and suggestions",
          },
        ],
      },
      {
        step: "04",
        title: "Return to the help center when you need the guide",
        description: "Use Help as the permanent reference for the user journey.",
        result: "This page stays available as a quick reminder of the full user-side flow.",
        screenshots: [
          {
            src: "/help-shots/help-page.png",
            alt: "Help center page with the user walkthrough sections",
          },
        ],
      },
    ],
    tips: [
      "Use History before Summary or Results if you want to confirm which cycle is active.",
      "Use the glossary whenever a label or certification abbreviation looks unfamiliar.",
      "Use Evio for explanations in plain language when a score or suggestion needs context.",
    ],
    mistakes: [
      "Treating Help as a replacement for the glossary or history screens instead of a guide to them.",
      "Using the chatbot on screens where it is intentionally hidden, such as login and reset flows.",
      "Looking for admin documentation here; this page is written for normal users.",
    ],
  },
];

export default guideSections;
