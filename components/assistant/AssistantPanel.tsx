"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, PanelLeft, Send, Sparkles } from "lucide-react";
import type { SuggestedQuestion, VisualizationResult } from "@/types";
import { getConversationMessages, sendAssistantMessage, errorMessage } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { stripExtension } from "@/lib/utils";
import { Spinner } from "@/components/ui/primitives";
import { AssistantMessage, TypingIndicator, type UiMessage } from "./AssistantMessage";

const DEFAULT_SUGGESTIONS: SuggestedQuestion[] = [
  { label: "Summarize", question: "Summarize this dataset" },
  { label: "Top items", question: "Show me the top performers" },
  { label: "Find anomalies", question: "Find unusual transactions" },
  { label: "Trends", question: "Show the trend over time" },
];

// Shown in the empty state of a new conversation.
const STARTER_QUESTIONS = [
  "What are the top 5 products by revenue?",
  "Which region has the highest growth?",
  "Show me the monthly sales trend.",
  "Find unusual or outlier transactions.",
];

function toUiMessage(role: "user" | "assistant", content: string, meta?: Record<string, any>): UiMessage {
  return {
    role,
    content,
    responseType: meta?.response_type,
    kpis: meta?.kpis,
    viz: (meta?.visualization as VisualizationResult) ?? null,
    data: meta?.data,
    error: meta?.response_type === "error",
  };
}

export function AssistantPanel({
  datasetId,
  datasetName,
  conversationId,
  onConversationCreated,
  onActivity,
  onOpenHistory,
  compact = false,
}: {
  datasetId: string | null;
  datasetName?: string | null;
  /** Controlled active conversation. `null` = new chat, `undefined` = uncontrolled (ephemeral). */
  conversationId?: string | null;
  onConversationCreated?: (id: string) => void;
  onActivity?: () => void;
  onOpenHistory?: () => void;
  compact?: boolean;
}) {
  const toast = useToast();
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(conversationId ?? null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [aiAvailable, setAiAvailable] = useState<boolean | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestedQuestion[]>(DEFAULT_SUGGESTIONS);
  const scrollRef = useRef<HTMLDivElement>(null);
  const loadedId = useRef<string | null>(null);

  const subtitleName = stripExtension(datasetName || "");
  const subtitle = subtitleName
    ? `Ask your queries related to "${subtitleName}"`
    : "Ask your queries related to your dataset";

  // Load (or clear) messages when the controlled conversation changes.
  useEffect(() => {
    if (conversationId === undefined) return; // uncontrolled: keep ephemeral state
    setSessionId(conversationId);
    if (conversationId === null) {
      loadedId.current = null;
      setMessages([]);
      setSuggestions(DEFAULT_SUGGESTIONS);
      setAiAvailable(null);
      return;
    }
    if (conversationId === loadedId.current) return; // already loaded (e.g. we just created it)
    loadedId.current = conversationId;
    setLoadingHistory(true);
    setMessages([]);
    getConversationMessages(conversationId)
      .then((history) => {
        setMessages(
          history.map((m) =>
            toUiMessage(m.role === "user" ? "user" : "assistant", m.content, m.metadata),
          ),
        );
      })
      .catch(() => toast.error("Unable to load conversation. Please try again."))
      .finally(() => setLoadingHistory(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return; // prevents duplicate submissions while generating
    if (!datasetId) {
      toast.error("Select a dataset before asking a question.");
      return;
    }
    setInput("");
    setMessages((m) => [...m, { role: "user", content: trimmed }]);
    setLoading(true);
    try {
      const res = await sendAssistantMessage(datasetId, trimmed, sessionId ?? undefined);
      setSessionId(res.session_id);
      setAiAvailable(res.ai_available);
      // A brand-new conversation was just created on the backend.
      if (conversationId !== undefined && conversationId === null) {
        loadedId.current = res.session_id;
        onConversationCreated?.(res.session_id);
      }
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: res.message,
          responseType: res.response_type,
          kpis: res.kpis,
          viz: res.visualization,
          data: res.data,
          error: res.response_type === "error",
        },
      ]);
      if (res.suggested_questions?.length) setSuggestions(res.suggested_questions);
      onActivity?.();
    } catch (e) {
      toast.error("Unable to send your message.", { description: errorMessage(e) });
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "The AnalytIQ Assistant is temporarily unavailable. You can still use the Visualization Builder and Analytics tools.",
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const showEmpty = !loadingHistory && messages.length === 0;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-ink-200 bg-ink-50/40">
      {/* header */}
      <div className="flex items-center justify-between gap-3 border-b border-ink-200 bg-surface px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              aria-label="Open chat history"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-ink-600 transition hover:bg-elevated lg:hidden"
            >
              <PanelLeft className="h-5 w-5" />
            </button>
          )}
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 text-white shadow-sm">
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-ink-900">AnalytIQ Assistant</h3>
            <p className="truncate text-xs text-ink-500">{subtitle}</p>
          </div>
        </div>
        {aiAvailable === false && (
          <span className="chip shrink-0 bg-amber-50 text-amber-700" title="LLM not configured — deterministic analytics still run">
            <AlertCircle className="h-3 w-3" /> Offline mode
          </span>
        )}
      </div>

      {/* messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4" style={{ minHeight: compact ? 320 : 360 }}>
        {loadingHistory ? (
          <div className="flex items-center gap-2 text-sm text-ink-500">
            <Spinner /> Loading conversation…
          </div>
        ) : showEmpty ? (
          <div className="mx-auto max-w-2xl">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-brand-600 to-accent-500 text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="rounded-2xl border border-ink-200 bg-surface px-4 py-2.5 text-sm text-ink-700">
                Ask anything about your data. Try one of these to get started:
              </div>
            </motion.div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {STARTER_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-xl border border-ink-200 bg-surface px-3.5 py-2.5 text-left text-sm text-ink-700 transition hover:border-brand-300 hover:bg-brand-50/40 disabled:opacity-50"
                >
                  <Sparkles className="h-3.5 w-3.5 shrink-0 text-brand-500" />
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => <AssistantMessage key={i} msg={m} />)
        )}
        {loading && <TypingIndicator />}
      </div>

      {/* in-conversation follow-up chips */}
      {!showEmpty && (
        <div className="flex flex-wrap gap-2 border-t border-ink-200 bg-surface px-4 pt-3">
          <AnimatePresence mode="popLayout">
            {suggestions.map((s) => (
              <motion.button
                key={s.question}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => send(s.question)}
                disabled={loading}
                className="chip bg-brand-50 text-brand-700 transition hover:bg-brand-100 disabled:opacity-50"
              >
                {s.label}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* input */}
      <form
        className="flex items-center gap-2 bg-surface p-4"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question…"
          className="input"
          disabled={loading}
          aria-label="Ask a question"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="btn-primary shrink-0"
          aria-label="Send"
        >
          {loading ? <Spinner /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}
