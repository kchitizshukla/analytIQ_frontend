"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { AssistantPanel } from "@/components/assistant/AssistantPanel";
import { ConversationSidebar } from "@/components/assistant/ConversationSidebar";
import { NoDataset } from "@/components/ui/NoDataset";
import { useDatasetContext } from "@/hooks/useDatasetContext";
import { useToast } from "@/components/ui/Toast";
import {
  deleteConversation,
  errorMessage,
  getConversations,
  renameConversation,
} from "@/lib/api";
import type { Conversation } from "@/types";

export default function AssistantPage() {
  const { activeId: activeDatasetId, activeDataset, datasets } = useDatasetContext();
  const toast = useToast();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [activeConvId, setActiveConvId] = useState<string | null>(null); // null = new chat
  const [drawerOpen, setDrawerOpen] = useState(false);

  const loadConversations = useCallback(async () => {
    try {
      const data = await getConversations();
      setConversations(data);
    } catch (e) {
      toast.error("Unable to load conversations.", { description: errorMessage(e) });
    } finally {
      setListLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // The active conversation owns its dataset context; a new chat uses the
  // currently selected dataset.
  const activeConv = conversations.find((c) => c.id === activeConvId) ?? null;
  const panelDatasetId = activeConv ? activeConv.dataset_id : activeDatasetId;
  const panelDatasetName = activeConv ? activeConv.dataset_name : activeDataset?.name ?? null;

  const onNewChat = () => {
    setActiveConvId(null);
    setDrawerOpen(false);
  };
  const onSelect = (id: string) => {
    setActiveConvId(id);
    setDrawerOpen(false);
  };

  async function onRename(id: string, title: string) {
    try {
      await renameConversation(id, title);
      setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, title } : c)));
      toast.success("Conversation renamed.");
    } catch (e) {
      toast.error("Unable to rename the conversation.", { description: errorMessage(e) });
    }
  }

  async function onDelete(id: string) {
    try {
      await deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConvId === id) setActiveConvId(null);
      toast.success("Conversation deleted.");
    } catch (e) {
      toast.error("Unable to delete the conversation.", { description: errorMessage(e) });
    }
  }

  const sidebar = (
    <ConversationSidebar
      conversations={conversations}
      activeId={activeConvId}
      loading={listLoading}
      onNewChat={onNewChat}
      onSelect={onSelect}
      onRename={onRename}
      onDelete={onDelete}
    />
  );

  // Nothing to work with yet: no datasets uploaded and no past conversations.
  if (!listLoading && datasets.length === 0 && conversations.length === 0) {
    return <AppShell><NoDataset /></AppShell>;
  }

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-8rem)] min-h-[520px] gap-4">
        {/* desktop conversation sidebar */}
        <aside className="hidden w-72 shrink-0 lg:block xl:w-80">{sidebar}</aside>

        {/* chat panel */}
        <div className="min-w-0 flex-1">
          <AssistantPanel
            datasetId={panelDatasetId}
            datasetName={panelDatasetName}
            conversationId={activeConvId}
            onConversationCreated={(id) => setActiveConvId(id)}
            onActivity={loadConversations}
            onOpenHistory={() => setDrawerOpen(true)}
          />
        </div>
      </div>

      {/* mobile conversation drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              aria-hidden="true"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 z-50 flex w-80 max-w-[85%] flex-col bg-ink-50 p-3 lg:hidden"
              role="dialog"
              aria-label="Chat history"
            >
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="text-sm font-semibold text-ink-900">Chat history</span>
                <button
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close chat history"
                  className="grid h-9 w-9 place-items-center rounded-lg text-ink-500 transition hover:bg-ink-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="min-h-0 flex-1">{sidebar}</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
