"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, Loader2, RefreshCw, SendHorizonal, Sparkles, UserRound, X, FileCheck, Landmark, Lightbulb } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { sendMistralChatMessage, type ChatMessage } from "@/actions/chatbot.actions";

type ChatbotProps = {
  title?: string;
  description?: string;
  systemPrompt?: string;
  suggestions?: string[];
  className?: string;
};

const DEFAULT_SUGGESTIONS = [
  "Summarize the latest ESG readiness gaps.",
  "What actions should we prioritize this quarter?",
  "Explain the renewable energy score.",
];

const REGULATORY_SUGGESTIONS = [
  "What are our BRSR compliance requirements?",
  "Explain GRI standards and their application.",
  "What are the regulatory deadlines we need to meet?",
];

const GENERAL_SUGGESTIONS = [
  "What are our major ESG gaps?",
  "How does renewable energy impact our score?",
  "What sustainability actions should we prioritize?",
];

const SECTOR_OPTIONS = [
  {
    sectorName: "Hospital / Healthcare",
    certifications: ["NABH", "IGBC Healthcare", "LEED Healthcare", "WELL", "ISO 14001", "BRSR"],
  },
  {
    sectorName: "Commercial Building / Real Estate",
    certifications: ["IGBC", "LEED", "GRIHA", "EDGE", "WELL", "ISO 14001", "BRSR"],
  },
  {
    sectorName: "Manufacturing / Industrial",
    certifications: ["ISO 14001", "ISO 50001", "ISO 45001", "EcoVadis", "BRSR", "GRI"],
  },
  {
    sectorName: "Textile Industry",
    certifications: ["GOTS", "OEKO-TEX", "ZDHC", "Bluesign", "Higg Index", "SA8000", "Sedex"],
  },
  {
    sectorName: "Electronics Industry",
    certifications: ["CE", "RoHS", "WEEE", "ISO 14001", "ISO 27001", "RBA"],
  },
  {
    sectorName: "Food & Beverage",
    certifications: ["FSSAI", "HACCP", "ISO 22000", "ISO 14001"],
  },
  {
    sectorName: "Logistics & Supply Chain",
    certifications: ["EcoVadis", "GLEC", "ISO 14001", "GRI"],
  },
  {
    sectorName: "Educational Institution",
    certifications: ["IGBC", "WELL", "ISO 14001", "NAAC Sustainability"],
  },
  {
    sectorName: "NGO / Social Impact",
    certifications: ["GRI (NGO)", "UN SDG", "SROI"],
  },
  {
    sectorName: "General (All Other Organizations)",
    certifications: ["ISO 14001", "BRSR", "GRI", "CDP"],
  },
];

const INITIAL_ASSISTANT_MESSAGE =
  "Hi, I am Evio. I can help explain ESG scores, data coverage, and recommended actions. Ask me anything.";

function normalizeMessageContent(content: unknown) {
  if (typeof content === "string") {
    return content;
  }

  if (
    typeof content === "number" ||
    typeof content === "boolean" ||
    typeof content === "bigint"
  ) {
    return String(content);
  }

  if (content && typeof content === "object") {
    const record = content as {
      content?: unknown;
      detail?: unknown;
      message?: unknown;
    };

    if (typeof record.content === "string") {
      return record.content;
    }

    if (typeof record.detail === "string") {
      return record.detail;
    }

    if (typeof record.message === "string") {
      return record.message;
    }
  }

  return "";
}

function stripMarkdownFormatting(text: string) {
  return text
    .replace(/```[\s\S]*?```/g, (match) => match.replace(/```/g, ""))
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/[*_`]/g, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/\|/g, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function MistralChatbot({
  title = "Evio",
  description = "Evio — Ask about ESG readiness, scores, and practical next steps.",
  systemPrompt =
    "You are Evio, an ESG assistant for a sustainability readiness platform. Answer clearly, concisely, and in plain text only. Do not use markdown tables, bullets, numbering, emojis, code fences, or decorative symbols unless absolutely necessary.",
  suggestions = DEFAULT_SUGGESTIONS,
  className,
}: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isTranscriptVisible, setIsTranscriptVisible] = useState(false);
  const [activeMode, setActiveMode] = useState<
    "certificate" | "regulatory" | "general"
  >("general");
  const [messagesByMode, setMessagesByMode] = useState<
    Record<"certificate" | "regulatory" | "general", ChatMessage[]>
  >({
    certificate: [
      { role: "assistant", content: "Hi — I'm Evio. I can check certificate relevance and required evidence." },
    ],
    regulatory: [
      { role: "assistant", content: "Hi — I'm Evio. Ask me about regulatory compliance, standards (BRSR, GRI, ISO), and what your organization needs to do." },
    ],
    general: [
      { role: "assistant", content: "Hi — I'm Evio. I can help explain ESG scores, readiness gaps, recommendations, and practical next steps. Ask me anything." },
    ],
  });
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const [conversationIdsByMode, setConversationIdsByMode] = useState<
    Record<"certificate" | "regulatory" | "general", string | null>
  >({ certificate: null, regulatory: null, general: null });
  const [draftsByMode, setDraftsByMode] = useState<
    Record<"certificate" | "regulatory" | "general", string>
  >({ certificate: "", regulatory: "", general: "" });
  const [isSending, setIsSending] = useState(false);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [certificateSelection, setCertificateSelection] = useState<{
    sectorName: string;
    certification: string;
  }>({ sectorName: "", certification: "" });
  const [hasInteractedByMode, setHasInteractedByMode] = useState<Record<"certificate" | "regulatory" | "general", boolean>>({ certificate: false, regulatory: false, general: false });

  const conversation = useMemo(() => {
    const current = messagesByMode[activeMode] || [];
    return current.filter((message) => normalizeMessageContent(message.content).trim().length > 0);
  }, [messagesByMode, activeMode]);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [conversation, isSending]); // Added isSending to trigger scroll when typing animation appears

  async function handleSend(text: string) {
    const message = text.trim();

    if (!message || isSending) {
      return;
    }

    const current = messagesByMode[activeMode] || [];
    const nextMessages: ChatMessage[] = [...current, { role: "user", content: message }];

    setMessagesByMode((prev) => ({ ...prev, [activeMode]: nextMessages }));
    setDraftsByMode((prev) => ({ ...prev, [activeMode]: "" }));
    setIsTranscriptVisible(true);
    setIsSending(true);

    const MODE_PROMPTS: Record<
      "certificate" | "regulatory" | "general",
      string
    > = {
      certificate:
        "You are Evio, an assistant that performs Certificate Relevance Checks. Provide very brief responses (2-3 sentences max). For any certificate, state: (1) ESG relevance, (2) one key requirement, (3) one actionable next step. Keep it simple and direct.",
      regulatory:
        "You are Evio, an assistant for Regulatory FAQs. Answer regulatory and compliance questions in 2-3 sentences max. Always reference relevant standards (e.g., BRSR, GRI, ISO, local regulations) and explain what the organization needs to do. Focus on compliance requirements and deadlines.",
      general:
        "You are Evio, an ESG assistant for general sustainability queries. Answer in 2-3 sentences max about ESG readiness, scores, gaps, recommendations, or sustainability strategies. Be motivational, practical, and action-focused. Explain how it impacts the organization.",
    };

    const systemPromptForMode = MODE_PROMPTS[activeMode] || systemPrompt;

    const result = await sendMistralChatMessage({
      message,
      systemPrompt: systemPromptForMode,
      conversationId: conversationIdsByMode[activeMode] ?? undefined,
    });

    if (result.success) {
      if (result.conversationId) {
        setConversationIdsByMode((prev) => ({ ...prev, [activeMode]: result.conversationId }));
      }

      const reply = result.reply || "I could not generate a response right now.";

      setMessagesByMode((prev) => ({ ...prev, [activeMode]: [...(prev[activeMode] || []), { role: "assistant", content: reply }] }));
    } else {
      setMessagesByMode((prev) => ({ ...prev, [activeMode]: [...(prev[activeMode] || []), { role: "assistant", content: result.error || "I could not generate a response right now." }] }));
    }

    setIsSending(false);
  }

  function handleReset() {
    const resetMessage =
      activeMode === "certificate"
        ? "Hi — I'm Evio. I can check certificate relevance and required evidence."
        : activeMode === "regulatory"
        ? "Hi — I'm Evio. Ask me about regulatory compliance, standards (BRSR, GRI, ISO), and what your organization needs to do."
        : "Hi — I'm Evio. I can help explain ESG scores, readiness gaps, recommendations, and practical next steps. Ask me anything.";

    setMessagesByMode((prev) => ({ ...prev, [activeMode]: [{ role: "assistant", content: resetMessage }] }));
    setConversationIdsByMode((prev) => ({ ...prev, [activeMode]: null }));
    setDraftsByMode((prev) => ({ ...prev, [activeMode]: "" }));
  }

  function toggleOpen() {
    setIsOpen((current) => {
      if (!current) {
        setIsTranscriptVisible(true);
      }
      return !current;
    });
  }

  function handleClose() {
    setIsOpen(false);
  }

  function selectMode(mode: "certificate" | "regulatory" | "general") {
    setActiveMode(mode);
    setDraftsByMode((prev) => ({ ...prev, [mode]: prev[mode] ?? "" }));
    if (viewportRef.current) {
      viewportRef.current.scrollTop = 0;
    }
    if (inputRef.current) {
      inputRef.current.focus();
    }
    if (mode === "certificate") {
      setCertificateSelection({ sectorName: "", certification: "" });
    }
  }

  const currentDraft = draftsByMode[activeMode] ?? "";

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraftsByMode((prev) => ({ ...prev, [activeMode]: e.target.value }));
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`; // Max height 128px (8rem/h-32)
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className={cn("fixed bottom-6 right-6 z-[60]", className)}
          >
            <button
              type="button"
              onClick={toggleOpen}
              aria-label="Open Evio"
              title="Open Evio"
              className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/40 transition-all hover:scale-105 hover:shadow-emerald-500/60"
            >
              <span className="absolute inset-0 rounded-full bg-emerald-400/50 animate-ping opacity-75" />
              <Bot className="relative z-10 size-6 transition-transform group-hover:-rotate-12" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn("fixed bottom-6 right-6 z-[60] w-[min(24rem,calc(100vw-2rem))] origin-bottom-right", className)}
          >
            <Card className="border-0 bg-white/95 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col ring-1 ring-slate-200/50 sm:max-h-[85vh] max-h-[90vh]">
              <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 pb-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative flex size-10 items-center justify-center rounded-xl bg-white/20 text-white shadow-inner backdrop-blur-md">
                      <Bot className="size-5" />
                      <span className="absolute -bottom-1 -right-1 flex h-3 w-3 rounded-full bg-green-400 ring-2 ring-emerald-700"></span>
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-white tracking-tight">{title}</CardTitle>
                      <p className="text-xs text-emerald-100 font-medium">Online • ESG Assistant</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-full text-white/80 hover:bg-white/20 hover:text-white"
                      onClick={handleReset}
                      title="Reset Chat"
                    >
                      <RefreshCw className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-full text-white/80 hover:bg-white/20 hover:text-white"
                      onClick={handleClose}
                      title="Close"
                    >
                      <X className="size-5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-4 bg-slate-50/50 overflow-hidden min-h-[400px]">
                {/* Mode Selector */}
                <div className="flex p-1 bg-slate-200/60 rounded-xl mb-4 relative z-0 overflow-hidden shrink-0">
                  <div className="absolute inset-y-1 transition-all duration-300 ease-in-out bg-white rounded-lg shadow-sm z-[-1]"
                    style={{
                      width: 'calc(33.333% - 5px)',
                      left: activeMode === 'certificate' ? '4px' : activeMode === 'regulatory' ? 'calc(33.333% + 2px)' : 'calc(66.666% - 1px)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => selectMode("certificate")}
                    className={cn(
                      "flex-1 flex flex-col items-center justify-center py-2 px-1 text-[10px] sm:text-xs font-medium rounded-lg transition-colors z-10",
                      activeMode === "certificate" ? "text-emerald-700" : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    <FileCheck className="size-4 mb-1" />
                    <span className="text-center leading-tight">Certificate</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => selectMode("regulatory")}
                    className={cn(
                      "flex-1 flex flex-col items-center justify-center py-2 px-1 text-[10px] sm:text-xs font-medium rounded-lg transition-colors z-10",
                      activeMode === "regulatory" ? "text-emerald-700" : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    <Landmark className="size-4 mb-1" />
                    <span className="text-center leading-tight">Regulatory</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => selectMode("general")}
                    className={cn(
                      "flex-1 flex flex-col items-center justify-center py-2 px-1 text-[10px] sm:text-xs font-medium rounded-lg transition-colors z-10",
                      activeMode === "general" ? "text-emerald-700" : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    <Lightbulb className="size-4 mb-1" />
                    <span className="text-center leading-tight">General</span>
                  </button>
                </div>

                {/* Transcript area */}
                <div
                  ref={viewportRef}
                  className="flex-1 overflow-y-auto space-y-4 rounded-xl mb-4 pr-1 scrollbar-thin scrollbar-thumb-slate-200"
                  aria-live="polite"
                >
                  <AnimatePresence initial={false}>
                    {isTranscriptVisible && conversation.filter((message) => 
                      activeMode === "certificate" ? message.role === "assistant" : true
                    ).map((message, index) => (
                      <motion.div
                        key={`${message.role}-${index}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "flex gap-3",
                          message.role === "user" ? "justify-end" : "justify-start"
                        )}
                      >
                        {message.role === "assistant" && (
                          <div className="mt-auto flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700 shadow-sm border border-emerald-200/50">
                            <Sparkles className="size-4" />
                          </div>
                        )}

                        <div
                          className={cn(
                            "max-w-[85%] px-4 py-2.5 text-sm leading-relaxed shadow-sm",
                            message.role === "user"
                              ? "rounded-2xl rounded-br-sm bg-emerald-600 text-white"
                              : "rounded-2xl rounded-bl-sm border border-slate-200/60 bg-white text-slate-700"
                          )}
                        >
                          {stripMarkdownFormatting(normalizeMessageContent(message.content))}
                        </div>

                        {message.role === "user" && (
                          <div className="mt-auto flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-white shadow-sm border border-slate-700">
                            <UserRound className="size-4" />
                          </div>
                        )}
                      </motion.div>
                    ))}

                    {isSending && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex gap-3 justify-start"
                      >
                        <div className="mt-auto flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700 shadow-sm border border-emerald-200/50">
                          <Loader2 className="size-4 animate-spin" />
                        </div>
                        <div className="rounded-2xl rounded-bl-sm border border-slate-200/60 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm flex items-center gap-1.5 h-10">
                          <span className="size-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="size-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="size-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Suggestions: show only until the user interacts (focus or sends) for regulatory/general */}
                {!hasInteractedByMode[activeMode] && (activeMode === "regulatory" || activeMode === "general") && (
                  <div className="flex flex-wrap gap-2 mb-3 shrink-0">
                    {activeMode === "regulatory" && REGULATORY_SUGGESTIONS.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors shadow-sm text-left line-clamp-1"
                        onClick={() => {
                          setHasInteractedByMode((prev) => ({ ...prev, [activeMode]: true }));
                          void handleSend(prompt);
                        }}
                        disabled={isSending}
                      >
                        {prompt}
                      </button>
                    ))}

                    {activeMode === "general" && GENERAL_SUGGESTIONS.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors shadow-sm text-left line-clamp-1"
                        onClick={() => {
                          setHasInteractedByMode((prev) => ({ ...prev, [activeMode]: true }));
                          void handleSend(prompt);
                        }}
                        disabled={isSending}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}

                <form
                  className="mt-auto shrink-0"
                  onSubmit={(event) => {
                    event.preventDefault();
                    setHasInteractedByMode((prev) => ({ ...prev, [activeMode]: true }));
                    if (activeMode === "certificate") {
                      const msg = `Let's explore how the "${certificateSelection.certification}" certification can strengthen our ESG commitment in the "${certificateSelection.sectorName}" sector. What makes it relevant for ESG, what are the key requirements, and how can we leverage it to drive meaningful sustainability outcomes?`;
                      void handleSend(msg);
                    } else {
                      void handleSend(currentDraft);
                    }
                  }}
                >
                  {activeMode === "certificate" ? (
                    <div className="space-y-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 block ml-1">Select Sector</label>
                        <select
                          value={certificateSelection.sectorName}
                          onChange={(e) => {
                            const sector = SECTOR_OPTIONS.find((s) => s.sectorName === e.target.value)!;
                            setCertificateSelection({ sectorName: sector.sectorName, certification: sector.certifications[0] });
                          }}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                        >
                          <option value="" disabled>Choose your industry...</option>
                          {SECTOR_OPTIONS.map((s) => (
                            <option key={s.sectorName} value={s.sectorName}>
                              {s.sectorName}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 block ml-1">Select Certification</label>
                        <select
                          value={certificateSelection.certification}
                          onChange={(e) => setCertificateSelection((prev) => ({ ...prev, certification: e.target.value }))}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all disabled:opacity-50"
                          disabled={!certificateSelection.sectorName}
                        >
                          <option value="" disabled>Choose a framework...</option>
                          {SECTOR_OPTIONS.find((s) => s.sectorName === certificateSelection.sectorName)?.certifications.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="relative flex items-end gap-2 bg-white rounded-2xl border border-slate-200 p-1 pl-2 shadow-sm focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
                      <textarea
                        ref={inputRef}
                        value={currentDraft}
                        onChange={handleTextareaChange}
                        onFocus={() => setHasInteractedByMode((prev) => ({ ...prev, [activeMode]: true }))}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            setHasInteractedByMode((prev) => ({ ...prev, [activeMode]: true }));
                            void handleSend(currentDraft);
                            event.currentTarget.style.height = 'auto'; // Reset height on send
                          }
                        }}
                        placeholder={
                          activeMode === "regulatory"
                            ? "Ask about compliance, standards..."
                            : "Ask about ESG gaps, recommendations..."
                        }
                        className="max-h-32 min-h-[44px] w-full resize-none bg-transparent py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 scrollbar-thin"
                        aria-label="Chat message"
                        rows={1}
                      />
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between pl-1">
                    {activeMode !== "certificate" ? (
                      <p className="text-[10px] text-slate-400 font-medium">⏎ to send • Shift+⏎ for new line</p>
                    ) : (
                      <div />
                    )}

                    <Button
                      type="submit"
                      size="sm"
                      className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 rounded-full px-5 transition-all"
                      disabled={isSending || (activeMode === "certificate" ? !certificateSelection.sectorName || !certificateSelection.certification : !currentDraft.trim())}
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="mr-2 size-4 animate-spin" />
                          Sending
                        </>
                      ) : (
                        <>
                          <SendHorizonal className="mr-2 size-4" />
                          Send
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}