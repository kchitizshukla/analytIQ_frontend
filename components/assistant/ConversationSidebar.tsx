"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check, MessageSquare, MoreVertical, Pencil, Plus, Search, Trash2,
} from "lucide-react";
import type { Conversation } from "@/types";
import { cn, relativeTime } from "@/lib/utils";
import { Skeleton } from "@/components/ui/primitives";

export function ConversationSidebar({
  conversations,
  activeId,
  loading,
  onNewChat,
  onSelect,
  onRename,
  onDelete,
}: {
  conversations: Conversation[];
  activeId: string | null;
  loading: boolean;
  onNewChat: () => void;
  onSelect: (id: string) => void;
  onRename: (id: string, title: string) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
}) {
  const [query, setQuery] = useState("");
  const [menuId, setMenuId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Conversation | null>(null);
  const [deleting, setDeleting] = useState(false);
  const renameRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.dataset_name ?? "").toLowerCase().includes(q),
    );
  }, [conversations, query]);

  function startRename(c: Conversation) {
    setMenuId(null);
    setRenamingId(c.id);
    setRenameValue(c.title);
    requestAnimationFrame(() => renameRef.current?.select());
  }

  async function commitRename(id: string) {
    const title = renameValue.trim();
    setRenamingId(null);
    if (title && title !== conversations.find((c) => c.id === id)?.title) {
      await onRename(id, title);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await onDelete(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col rounded-2xl border border-ink-200 bg-sidebar">
      {/* top: new chat + search */}
      <div className="space-y-3 border-b border-ink-100 p-3">
        <button onClick={onNewChat} className="btn-primary w-full">
          <Plus className="h-4 w-4" /> New Chat
        </button>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations…"
            className="input pl-9"
            aria-label="Search conversations"
          />
        </div>
      </div>

      {/* list */}
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        <div className="px-2 pb-1 pt-1 text-xs font-semibold uppercase tracking-wide text-ink-400">
          Recent Chats
        </div>

        {loading ? (
          <div className="space-y-2 p-1">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-3 py-8 text-center text-sm text-ink-400">
            {query ? "No conversations match your search." : "No conversations yet. Start a new chat."}
          </div>
        ) : (
          <ul className="space-y-0.5">
            {filtered.map((c) => {
              const active = c.id === activeId;
              return (
                <li key={c.id} className="group relative">
                  {renamingId === c.id ? (
                    <div className="flex items-center gap-1 px-2 py-1.5">
                      <input
                        ref={renameRef}
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitRename(c.id);
                          if (e.key === "Escape") setRenamingId(null);
                        }}
                        onBlur={() => commitRename(c.id)}
                        className="input py-1.5 text-sm"
                        aria-label="Rename conversation"
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => onSelect(c.id)}
                      className={cn(
                        "flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition",
                        active ? "bg-brand-50" : "hover:bg-elevated",
                      )}
                    >
                      <MessageSquare
                        className={cn("mt-0.5 h-4 w-4 shrink-0", active ? "text-brand-600" : "text-ink-400")}
                      />
                      <span className="min-w-0 flex-1">
                        <span className={cn("block truncate text-sm font-medium", active ? "text-brand-800" : "text-ink-800")}>
                          {c.title}
                        </span>
                        <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-ink-400">
                          <span className="whitespace-nowrap">{relativeTime(c.updated_at)}</span>
                          {c.dataset_name && (
                            <>
                              <span aria-hidden>·</span>
                              <span className="truncate">{c.dataset_name}</span>
                            </>
                          )}
                        </span>
                      </span>
                    </button>
                  )}

                  {/* ... menu trigger */}
                  {renamingId !== c.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuId((id) => (id === c.id ? null : c.id));
                      }}
                      aria-label="Conversation options"
                      className={cn(
                        "absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-md text-ink-400 transition hover:bg-ink-100 hover:text-ink-700",
                        menuId === c.id ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus:opacity-100",
                      )}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  )}

                  <AnimatePresence>
                    {menuId === c.id && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.12 }}
                        role="menu"
                        className="absolute right-1.5 top-9 z-20 w-36 overflow-hidden rounded-lg border border-ink-200 bg-surface p-1 shadow-glow"
                      >
                        <button
                          role="menuitem"
                          onClick={() => startRename(c)}
                          className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm text-ink-700 hover:bg-elevated"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Rename
                        </button>
                        <button
                          role="menuitem"
                          onClick={() => {
                            setMenuId(null);
                            setDeleteTarget(c);
                          }}
                          className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* click-away backdrop for the ... menu */}
      {menuId && <div className="fixed inset-0 z-10" onClick={() => setMenuId(null)} aria-hidden="true" />}

      {/* delete confirmation */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
            onClick={() => !deleting && setDeleteTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="card w-full max-w-sm p-6"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <h3 className="text-base font-semibold text-ink-900">Delete conversation?</h3>
              <p className="mt-2 text-sm text-ink-500">
                “{deleteTarget.title}” and its messages will be permanently deleted. This can’t be undone.
              </p>
              <div className="mt-6 flex justify-end gap-2">
                <button onClick={() => setDeleteTarget(null)} disabled={deleting} className="btn-ghost">
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="btn bg-red-600 text-white hover:bg-red-700"
                >
                  {deleting ? <Check className="h-4 w-4 animate-pulse" /> : <Trash2 className="h-4 w-4" />}
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
