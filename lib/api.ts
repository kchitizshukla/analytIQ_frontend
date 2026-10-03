// Centralized API client. No fetch calls scattered across components.
// Handles: JSON parsing, HTTP errors, network errors, timeouts, and error
// normalization into a single ApiError shape. The UI layer never sees raw
// backend implementation details.
import { APP_NAME } from "@/lib/branding";
import type {
  AssistantResponse,
  AuthUser,
  ChatMessage,
  Conversation,
  ColumnsResponse,
  DataProfile,
  DatasetDetail,
  DatasetPreview,
  DatasetSummary,
  HealthStatus,
  InsightsResponse,
  VisualizationConfig,
  VisualizationResult,
} from "@/types";

// Requests go through the Next.js rewrite proxy at /api/* -> FastAPI.
const BASE = "";
const DEFAULT_TIMEOUT = 30_000;

export interface ApiErrorShape {
  message: string;
  code?: string;
  status?: number;
}

export class ApiError extends Error {
  code?: string;
  status?: number;
  constructor({ message, code, status }: ApiErrorShape) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

/** Extract a clean, user-safe message from any backend error body shape. */
function normalizeErrorBody(body: unknown, status: number): { message: string; code?: string } {
  const fallback = `Request failed (${status})`;
  if (body && typeof body === "object" && "detail" in body) {
    const detail = (body as { detail: unknown }).detail;
    // Structured: { code, message }
    if (detail && typeof detail === "object" && !Array.isArray(detail)) {
      const d = detail as { code?: string; message?: string };
      if (d.message) return { message: d.message, code: d.code };
    }
    // FastAPI validation errors: [{ msg, ... }]
    if (Array.isArray(detail) && detail.length) {
      const first = detail[0] as { msg?: string };
      const msg = (first?.msg ?? "").replace(/^Value error,\s*/i, "");
      if (msg) return { message: msg, code: "VALIDATION_ERROR" };
    }
    // Plain string detail (legacy endpoints)
    if (typeof detail === "string" && detail) return { message: detail };
  }
  return { message: fallback };
}

// ---- Global loading counter (for the branded GlobalApiLoader) ----
// Only requests flagged `{ global: true }` participate, so small/background
// requests never block the whole app. The count is decremented on every exit
// path (success, error, timeout, abort) so the loader can never get stuck.
let _activeGlobal = 0;
const _loadingListeners = new Set<(n: number) => void>();

export function subscribeGlobalLoading(cb: (n: number) => void): () => void {
  _loadingListeners.add(cb);
  cb(_activeGlobal);
  return () => _loadingListeners.delete(cb);
}
export function getGlobalLoadingCount(): number {
  return _activeGlobal;
}
function bumpGlobal(delta: number) {
  _activeGlobal = Math.max(0, _activeGlobal + delta);
  _loadingListeners.forEach((l) => l(_activeGlobal));
}

async function http<T>(
  path: string,
  init?: RequestInit & { timeout?: number; global?: boolean },
): Promise<T> {
  const isGlobal = init?.global === true;
  if (isGlobal) bumpGlobal(1);
  const controller = new AbortController();
  const timeout = init?.timeout ?? DEFAULT_TIMEOUT;
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    let res: Response;
    try {
      res = await fetch(`${BASE}${path}`, {
        ...init,
        signal: controller.signal,
        credentials: "include",
        headers: {
          ...(init?.body && !(init.body instanceof FormData)
            ? { "Content-Type": "application/json" }
            : {}),
          ...init?.headers,
        },
        cache: "no-store",
      });
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        throw new ApiError({ message: `The request timed out. Please try again.`, code: "TIMEOUT" });
      }
      throw new ApiError({
        message: `Unable to connect to ${APP_NAME}. Please check your connection and try again.`,
        code: "NETWORK_ERROR",
      });
    }

    if (!res.ok) {
      let body: unknown = null;
      try {
        body = await res.json();
      } catch {
        /* non-JSON error body */
      }
      const { message, code } = normalizeErrorBody(body, res.status);
      throw new ApiError({ message, code, status: res.status });
    }

    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
    if (isGlobal) bumpGlobal(-1);
  }
}

/** Convenience: turn any thrown value into a user-safe message. */
export function errorMessage(e: unknown, fallback = "Something went wrong. Please try again."): string {
  if (e instanceof ApiError) return e.message;
  if (e instanceof Error && e.message) return e.message;
  return fallback;
}

// ---- Auth ----
export const login = (email: string, password: string) =>
  http<{ user: AuthUser }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const signup = (name: string, email: string, password: string) =>
  http<{ user: AuthUser }>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });

export const logout = () => http<{ ok: boolean }>("/api/auth/logout", { method: "POST" });

export const getCurrentUser = () => http<AuthUser>("/api/auth/me");

export const changePassword = (currentPassword: string, newPassword: string) =>
  http<{ ok: boolean }>("/api/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  });

// ---- Health ----
export const getHealth = () => http<HealthStatus>("/api/health");

// ---- Datasets ----
export const getDatasets = () => http<DatasetSummary[]>("/api/datasets");
export const getDataset = (id: string) => http<DatasetDetail>(`/api/datasets/${id}`);
export const getColumns = (id: string) => http<ColumnsResponse>(`/api/datasets/${id}/columns`);
export const getPreview = (id: string, page = 1, pageSize = 50) =>
  http<DatasetPreview>(`/api/datasets/${id}/preview?page=${page}&page_size=${pageSize}`);

export async function uploadDataset(file: File, name?: string): Promise<DatasetDetail> {
  const form = new FormData();
  form.append("file", file);
  if (name) form.append("name", name);
  // Uploads can take longer than a regular request — show the global loader.
  return http<DatasetDetail>("/api/datasets/upload", { method: "POST", body: form, timeout: 120_000, global: true });
}

/** Download the original uploaded file, triggering a browser save with its name. */
export async function downloadDataset(id: string, filename: string): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`/api/datasets/${id}/download`, { credentials: "include", cache: "no-store" });
  } catch {
    throw new ApiError({
      message: `Unable to connect to ${APP_NAME}. Please try again.`,
      code: "NETWORK_ERROR",
    });
  }
  if (!res.ok) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      /* non-JSON error body */
    }
    const { message, code } = normalizeErrorBody(body, res.status);
    throw new ApiError({ message, code, status: res.status });
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "dataset";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ---- Analysis ----
// Profiling gates the Dashboard / Analytics views — show the global loader.
export const getProfile = (datasetId: string) =>
  http<DataProfile>("/api/analysis/profile", {
    method: "POST",
    body: JSON.stringify({ dataset_id: datasetId }),
    global: true,
  });

// ---- Visualization ----
// `global` is opt-in: the builder's deliberate "Generate" shows the loader,
// but the dashboard's background charts (which have their own skeletons) don't.
export const generateVisualization = (config: VisualizationConfig, opts?: { global?: boolean }) =>
  http<VisualizationResult>("/api/visualizations/preview", {
    method: "POST",
    body: JSON.stringify(config),
    global: opts?.global === true,
  });

// ---- Insights ----
export const generateInsights = (datasetId: string, refresh = false) =>
  http<InsightsResponse>("/api/insights/generate", {
    method: "POST",
    body: JSON.stringify({ dataset_id: datasetId, refresh }),
    timeout: 60_000,
    global: true,
  });

// ---- Assistant: conversations ----
export const getConversations = (datasetId?: string) =>
  http<Conversation[]>(`/api/assistant/conversations${datasetId ? `?dataset_id=${datasetId}` : ""}`);

export const createConversation = (datasetId?: string, title?: string) =>
  http<Conversation>("/api/assistant/conversations", {
    method: "POST",
    body: JSON.stringify({ dataset_id: datasetId ?? null, title }),
  });

export const renameConversation = (id: string, title: string) =>
  http<Conversation>(`/api/assistant/conversations/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ title }),
  });

export const deleteConversation = (id: string) =>
  http<void>(`/api/assistant/conversations/${id}`, { method: "DELETE" });

export const getConversationMessages = (id: string) =>
  http<ChatMessage[]>(`/api/assistant/conversations/${id}/messages`);

// ---- Assistant: chat (analytics + AI pipeline) ----
export const sendAssistantMessage = (
  datasetId: string,
  message: string,
  conversationId?: string,
) =>
  http<AssistantResponse>("/api/assistant/chat", {
    method: "POST",
    body: JSON.stringify({ dataset_id: datasetId, message, session_id: conversationId }),
    timeout: 60_000,
  });
