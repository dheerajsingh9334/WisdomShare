import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  enqueueAIBlogWriterAPI,
  generateBlogDirectAPI,
  enqueueAIRefineAPI,
  refineBlogDirectAPI,
  enqueueAISemanticSearchAPI,
  semanticSearchDirectAPI,
  enqueueAIGuestChatAPI,
  guestChatDirectAPI,
  enqueueAISummarizeAPI,
  summarizeBlogDirectAPI,
  getAITaskStatusAPI,
} from "../../APIServices/ai/aiAPI";

const TAB_KEYS = {
  writer: "writer",
  refine: "refine",
  search: "search",
  chat: "chat",
  summarize: "summarize",
};

const EXECUTION_MODE = {
  direct: "direct",
  queued: "queued",
};

const createIdempotencyKey = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const AIStudio = () => {
  const [activeTab, setActiveTab] = useState(TAB_KEYS.writer);
  const [mode, setMode] = useState(EXECUTION_MODE.direct);
  const [taskId, setTaskId] = useState(null);
  const [directResult, setDirectResult] = useState(null);

  const [writerForm, setWriterForm] = useState({
    topic: "",
    audience: "developers",
    tone: "clear",
    goal: "practical learning",
    includeSections: "Introduction,Core Ideas,Practical Steps,Conclusion",
    wordCount: 300,
  });

  const [refineForm, setRefineForm] = useState({
    draftText: "",
    instructions: "Improve structure and readability",
    wordCount: 300,
  });

  const [searchForm, setSearchForm] = useState({
    query: "",
    limit: 8,
  });

  const [chatForm, setChatForm] = useState({
    message: "Help me find blogs on React",
    postId: "",
  });

  const [summaryForm, setSummaryForm] = useState({
    postId: "",
    text: "",
    maxWords: 120,
  });

  const writerMutation = useMutation({
    mutationFn: ({ payload, idempotencyKey, executionMode }) =>
      executionMode === EXECUTION_MODE.direct
        ? generateBlogDirectAPI(payload)
        : enqueueAIBlogWriterAPI(payload, idempotencyKey),
    onSuccess: (resp) => {
      if (mode === EXECUTION_MODE.direct) {
        setTaskId(null);
        setDirectResult(resp?.data || null);
        return;
      }
      setDirectResult(null);
      setTaskId(resp?.data?.taskId || null);
    },
  });

  const refineMutation = useMutation({
    mutationFn: ({ payload, idempotencyKey, executionMode }) =>
      executionMode === EXECUTION_MODE.direct
        ? refineBlogDirectAPI(payload)
        : enqueueAIRefineAPI(payload, idempotencyKey),
    onSuccess: (resp) => {
      if (mode === EXECUTION_MODE.direct) {
        setTaskId(null);
        setDirectResult(resp?.data || null);
        return;
      }
      setDirectResult(null);
      setTaskId(resp?.data?.taskId || null);
    },
  });

  const semanticMutation = useMutation({
    mutationFn: ({ payload, idempotencyKey, executionMode }) =>
      executionMode === EXECUTION_MODE.direct
        ? semanticSearchDirectAPI(payload)
        : enqueueAISemanticSearchAPI(payload, idempotencyKey),
    onSuccess: (resp) => {
      if (mode === EXECUTION_MODE.direct) {
        setTaskId(null);
        setDirectResult(resp?.data || null);
        return;
      }
      setDirectResult(null);
      setTaskId(resp?.data?.taskId || null);
    },
  });

  const chatMutation = useMutation({
    mutationFn: ({ payload, idempotencyKey, executionMode }) =>
      executionMode === EXECUTION_MODE.direct
        ? guestChatDirectAPI(payload)
        : enqueueAIGuestChatAPI(payload, idempotencyKey),
    onSuccess: (resp) => {
      if (mode === EXECUTION_MODE.direct) {
        setTaskId(null);
        setDirectResult(resp?.data || null);
        return;
      }
      setDirectResult(null);
      setTaskId(resp?.data?.taskId || null);
    },
  });

  const summaryMutation = useMutation({
    mutationFn: ({ payload, idempotencyKey, executionMode }) =>
      executionMode === EXECUTION_MODE.direct
        ? summarizeBlogDirectAPI(payload)
        : enqueueAISummarizeAPI(payload, idempotencyKey),
    onSuccess: (resp) => {
      if (mode === EXECUTION_MODE.direct) {
        setTaskId(null);
        setDirectResult(resp?.data || null);
        return;
      }
      setDirectResult(null);
      setTaskId(resp?.data?.taskId || null);
    },
  });

  const {
    data: taskStatus,
    isFetching: isFetchingTask,
    refetch: refetchTask,
  } = useQuery({
    queryKey: ["ai-task-status", taskId],
    queryFn: () => getAITaskStatusAPI(taskId),
    enabled: Boolean(taskId),
    refetchInterval: (query) => {
      const status = query.state.data?.data?.status;
      if (!status) return 2000;
      return status === "queued" || status === "processing" ? 2000 : false;
    },
    refetchOnWindowFocus: false,
  });

  const taskResult = useMemo(
    () => taskStatus?.data?.result || null,
    [taskStatus],
  );
  const taskState = taskStatus?.data?.status || "idle";

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">
          AI Studio
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Use direct mode for instant output or queued mode for resilient
          background processing with task polling.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-300">Mode</span>
        <div className="inline-flex  border border-white/10 border-white/10 overflow-hidden">
          {[EXECUTION_MODE.direct, EXECUTION_MODE.queued].map((option) => (
            <button
              key={option}
              onClick={() => {
                setMode(option);
                setTaskId(null);
                setDirectResult(null);
              }}
              className={`px-3 py-1.5 text-sm capitalize ${
                mode === option
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-900/40 backdrop-blur-xl border border-white/10 text-white text-gray-700 dark:text-gray-200"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries({
          [TAB_KEYS.writer]: "Blog Writer",
          [TAB_KEYS.refine]: "Edit + Refine",
          [TAB_KEYS.search]: "Semantic Search",
          [TAB_KEYS.chat]: "AI Chatbot",
          [TAB_KEYS.summarize]: "Summarize",
        }).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-3 py-2  text-sm font-medium transition-colors ${
              activeTab === key
                ? "bg-blue-600 text-white"
                : "bg-white/5 text-white text-gray-700 dark:text-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-neutral-900/40 backdrop-blur-xl border border-white/10 text-white border border-white/10 border-white/10  p-4">
        {activeTab === TAB_KEYS.writer && (
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              writerMutation.mutate({
                payload: {
                  ...writerForm,
                  includeSections: writerForm.includeSections
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                },
                idempotencyKey: createIdempotencyKey("ai-writer"),
                executionMode: mode,
              });
            }}
          >
            <input
              value={writerForm.topic}
              onChange={(e) =>
                setWriterForm((p) => ({ ...p, topic: e.target.value }))
              }
              placeholder="Blog topic"
              className="w-full px-3 py-2  border bg-black"
              required
            />
            <div className="grid md:grid-cols-3 gap-3">
              <input
                value={writerForm.audience}
                onChange={(e) =>
                  setWriterForm((p) => ({ ...p, audience: e.target.value }))
                }
                placeholder="Audience"
                className="px-3 py-2  border bg-black"
              />
              <input
                value={writerForm.tone}
                onChange={(e) =>
                  setWriterForm((p) => ({ ...p, tone: e.target.value }))
                }
                placeholder="Tone"
                className="px-3 py-2  border bg-black"
              />
              <input
                type="number"
                value={writerForm.wordCount}
                onChange={(e) =>
                  setWriterForm((p) => ({
                    ...p,
                    wordCount: Number(e.target.value),
                  }))
                }
                placeholder="Word count"
                className="px-3 py-2  border bg-black"
              />
            </div>
            <input
              value={writerForm.goal}
              onChange={(e) =>
                setWriterForm((p) => ({ ...p, goal: e.target.value }))
              }
              placeholder="Goal"
              className="w-full px-3 py-2  border bg-black"
            />
            <input
              value={writerForm.includeSections}
              onChange={(e) =>
                setWriterForm((p) => ({
                  ...p,
                  includeSections: e.target.value,
                }))
              }
              placeholder="Sections (comma separated)"
              className="w-full px-3 py-2  border bg-black"
            />
            <button
              type="submit"
              className="px-4 py-2  bg-blue-600 text-white"
              disabled={writerMutation.isPending}
            >
              {writerMutation.isPending
                ? mode === EXECUTION_MODE.direct
                  ? "Generating..."
                  : "Queueing..."
                : mode === EXECUTION_MODE.direct
                  ? "Generate Blog (Direct)"
                  : "Generate Blog (Queued)"}
            </button>
          </form>
        )}

        {activeTab === TAB_KEYS.refine && (
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              refineMutation.mutate({
                payload: refineForm,
                idempotencyKey: createIdempotencyKey("ai-refine"),
                executionMode: mode,
              });
            }}
          >
            <textarea
              value={refineForm.draftText}
              onChange={(e) =>
                setRefineForm((p) => ({ ...p, draftText: e.target.value }))
              }
              rows={8}
              placeholder="Paste draft text"
              className="w-full px-3 py-2  border bg-black"
              required
            />
            <input
              value={refineForm.instructions}
              onChange={(e) =>
                setRefineForm((p) => ({ ...p, instructions: e.target.value }))
              }
              placeholder="Refine instructions"
              className="w-full px-3 py-2  border bg-black"
            />
            <button
              type="submit"
              className="px-4 py-2  bg-blue-600 text-white"
              disabled={refineMutation.isPending}
            >
              {refineMutation.isPending
                ? mode === EXECUTION_MODE.direct
                  ? "Refining..."
                  : "Queueing..."
                : mode === EXECUTION_MODE.direct
                  ? "Refine Draft (Direct)"
                  : "Refine Draft (Queued)"}
            </button>
          </form>
        )}

        {activeTab === TAB_KEYS.search && (
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              semanticMutation.mutate({
                payload: searchForm,
                idempotencyKey: createIdempotencyKey("ai-search"),
                executionMode: mode,
              });
            }}
          >
            <input
              value={searchForm.query}
              onChange={(e) =>
                setSearchForm((p) => ({ ...p, query: e.target.value }))
              }
              placeholder="Search by meaning (e.g. React performance patterns)"
              className="w-full px-3 py-2  border bg-black"
              required
            />
            <button
              type="submit"
              className="px-4 py-2  bg-blue-600 text-white"
              disabled={semanticMutation.isPending}
            >
              {semanticMutation.isPending
                ? mode === EXECUTION_MODE.direct
                  ? "Searching..."
                  : "Queueing..."
                : mode === EXECUTION_MODE.direct
                  ? "Run Semantic Search (Direct)"
                  : "Run Semantic Search (Queued)"}
            </button>
          </form>
        )}

        {activeTab === TAB_KEYS.chat && (
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              chatMutation.mutate({
                payload: chatForm,
                idempotencyKey: createIdempotencyKey("ai-chat"),
                executionMode: mode,
              });
            }}
          >
            <input
              value={chatForm.message}
              onChange={(e) =>
                setChatForm((p) => ({ ...p, message: e.target.value }))
              }
              placeholder="Help me find blogs on React"
              className="w-full px-3 py-2  border bg-black"
              required
            />
            <input
              value={chatForm.postId}
              onChange={(e) =>
                setChatForm((p) => ({ ...p, postId: e.target.value }))
              }
              placeholder="Optional postId for summarize intent"
              className="w-full px-3 py-2  border bg-black"
            />
            <button
              type="submit"
              className="px-4 py-2  bg-blue-600 text-white"
              disabled={chatMutation.isPending}
            >
              {chatMutation.isPending
                ? mode === EXECUTION_MODE.direct
                  ? "Thinking..."
                  : "Queueing..."
                : mode === EXECUTION_MODE.direct
                  ? "Ask AI Chat (Direct)"
                  : "Ask AI Chat (Queued)"}
            </button>
          </form>
        )}

        {activeTab === TAB_KEYS.summarize && (
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              summaryMutation.mutate({
                payload: summaryForm,
                idempotencyKey: createIdempotencyKey("ai-summary"),
                executionMode: mode,
              });
            }}
          >
            <input
              value={summaryForm.postId}
              onChange={(e) =>
                setSummaryForm((p) => ({ ...p, postId: e.target.value }))
              }
              placeholder="Post ID (optional if text is provided)"
              className="w-full px-3 py-2  border bg-black"
            />
            <textarea
              value={summaryForm.text}
              onChange={(e) =>
                setSummaryForm((p) => ({ ...p, text: e.target.value }))
              }
              rows={6}
              placeholder="Paste blog text (optional if postId is provided)"
              className="w-full px-3 py-2  border bg-black"
            />
            <button
              type="submit"
              className="px-4 py-2  bg-blue-600 text-white"
              disabled={summaryMutation.isPending}
            >
              {summaryMutation.isPending
                ? mode === EXECUTION_MODE.direct
                  ? "Summarizing..."
                  : "Queueing..."
                : mode === EXECUTION_MODE.direct
                  ? "Summarize Blog (Direct)"
                  : "Summarize Blog (Queued)"}
            </button>
          </form>
        )}
      </div>

      <div className="bg-black text-white border border-white/10 border-white/10  p-4">
        <h2 className="text-lg font-semibold text-white">
          Direct Result
        </h2>
        {!directResult ? (
          <p className="text-sm text-gray-400 mt-2">
            No direct result yet.
          </p>
        ) : (
          <pre className="mt-2 text-xs bg-neutral-900/40 backdrop-blur-xl border border-white/10 text-white border border-white/10 border-white/10  p-3 overflow-auto max-h-80">
            {JSON.stringify(directResult, null, 2)}
          </pre>
        )}
      </div>

      <div className="bg-black text-white border border-white/10 border-white/10  p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            Task Status
          </h2>
          {taskId && (
            <button
              onClick={refetchTask}
              className="text-sm text-blue-600 dark:text-blue-400"
            >
              Refresh
            </button>
          )}
        </div>

        {!taskId ? (
          <p className="text-sm text-gray-400 mt-2">
            No task queued yet.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            <p className="text-sm text-gray-300">
              Task: <span className="font-mono">{taskId}</span>
            </p>
            <p className="text-sm text-gray-300">
              State: <span className="font-semibold">{taskState}</span>
              {isFetchingTask ? " (updating...)" : ""}
            </p>
            {taskStatus?.data?.error && (
              <p className="text-sm text-red-500">
                Error: {taskStatus.data.error}
              </p>
            )}
            {taskResult && (
              <pre className="mt-2 text-xs bg-neutral-900/40 backdrop-blur-xl border border-white/10 text-white border border-white/10 border-white/10  p-3 overflow-auto max-h-80">
                {JSON.stringify(taskResult, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIStudio;
