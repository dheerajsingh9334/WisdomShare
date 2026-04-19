const asyncHandler = require("express-async-handler");
const User = require("../../models/User/User");
const AITask = require("../../models/AI/AITask");
const aiQueue = require("../../utils/aiQueue");
const { callGemini } = require("../../utils/gemini");
const { searchPostsByMeaning } = require("../../utils/aiSemanticSearch");

const DAILY_BLOG_LIMITS = {
  free: 1,
  premium: 3,
  pro: 5,
};

const AI_WORD_LIMITS = {
  free: 250,
  premium: 500,
  pro: 800,
  guest: 100,
};

const AI_WORD_DEFAULTS = {
  free: 200,
  premium: 400,
  pro: 600,
  guest: 150,
};

const resolvePlanTier = async (userId) => {
  if (!userId) return "guest";
  const user = await User.findById(userId)
    .select("plan")
    .populate("plan", "tier planName")
    .lean();

  const tier = (user?.plan?.tier || user?.plan?.planName || "free")
    .toString()
    .toLowerCase();

  return ["free", "premium", "pro"].includes(tier) ? tier : "free";
};

const getGuestSessionId = (req) => {
  const headerValue = req.headers["x-guest-session-id"];
  if (headerValue && typeof headerValue === "string") return headerValue;
  return `guest:${req.ip}`;
};

const createQueuedTask = async ({
  req,
  type,
  requestPayload,
  userId = null,
  guestSessionId = null,
  planTier = "guest",
}) => {
  const idempotencyKey =
    req.headers["idempotency-key"] || req.body?.idempotencyKey || null;

  if (idempotencyKey) {
    const existing = await AITask.findOne({ idempotencyKey }).lean();
    if (existing) {
      return {
        reused: true,
        task: existing,
      };
    }
  }

  const task = await AITask.create({
    userId,
    guestSessionId,
    type,
    status: "queued",
    planTier,
    request: requestPayload,
    idempotencyKey,
  });

  const queueOptions = {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: true,
    removeOnFail: { age: 24 * 3600 },
  };

  if (idempotencyKey) {
    queueOptions.jobId = `ai:${idempotencyKey}`;
  }

  await aiQueue.add(type, { taskId: task._id.toString() }, queueOptions);

  return { reused: false, task };
};

const extractTaskIdempotencyKey = (req) =>
  req.headers["idempotency-key"] || req.body?.idempotencyKey || null;

const directResponse = (res, payload) =>
  res.json({
    success: true,
    mode: "direct",
    ...payload,
  });

const normalizeGuestSessionId = (req) => {
  const headerValue = req.headers["x-guest-session-id"];
  if (headerValue && typeof headerValue === "string") return headerValue;
  return `guest:${req.ip}`;
};

const aiController = {
  // AI blog writer (async)
  enqueueBlogWriter: asyncHandler(async (req, res) => {
    const userId = req.user;
    const planTier = await resolvePlanTier(userId);

    const { topic, audience, tone, goal, includeSections, wordCount } =
      req.body;

    if (!topic || !topic.trim()) {
      return res.status(400).json({
        success: false,
        message: "topic is required",
      });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayCount = await AITask.countDocuments({
      userId,
      type: "blog_writer",
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ["queued", "processing", "completed"] },
    });

    const dailyLimit = DAILY_BLOG_LIMITS[planTier] ?? DAILY_BLOG_LIMITS.free;
    if (todayCount >= dailyLimit) {
      return res.status(403).json({
        success: false,
        message: `Daily AI blog limit reached for ${planTier} plan`,
        limit: dailyLimit,
        used: todayCount,
      });
    }

    const maxWords = AI_WORD_LIMITS[planTier] ?? AI_WORD_LIMITS.free;
    const defaultWords = AI_WORD_DEFAULTS[planTier] ?? AI_WORD_DEFAULTS.free;
    const normalizedWordCount = Math.min(
      Math.max(parseInt(wordCount, 10) || defaultWords, 120),
      maxWords,
    );

    const payload = {
      topic: topic.trim(),
      audience: audience || "developers",
      tone: tone || "clear",
      goal: goal || "practical learning",
      includeSections: Array.isArray(includeSections) ? includeSections : [],
      wordCount: normalizedWordCount,
    };

    const { reused, task } = await createQueuedTask({
      req,
      type: "blog_writer",
      requestPayload: payload,
      userId,
      planTier,
    });

    return res.status(202).json({
      success: true,
      reused,
      message: reused
        ? "Using existing AI task for this idempotency key"
        : "AI blog generation queued",
      data: {
        taskId: task._id,
        status: task.status,
        planTier,
        limits: {
          daily: dailyLimit,
          used: todayCount + (reused ? 0 : 1),
          maxWords,
          appliedWords: normalizedWordCount,
        },
      },
    });
  }),

  generateBlogDirect: asyncHandler(async (req, res) => {
    const userId = req.user;
    const planTier = await resolvePlanTier(userId);
    const { topic, audience, tone, goal, includeSections, wordCount } =
      req.body;

    if (!topic || !topic.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "topic is required" });
    }

    const maxWords = AI_WORD_LIMITS[planTier] ?? AI_WORD_LIMITS.free;
    const defaultWords = AI_WORD_DEFAULTS[planTier] ?? AI_WORD_DEFAULTS.free;
    const normalizedWordCount = Math.min(
      Math.max(parseInt(wordCount, 10) || defaultWords, 120),
      maxWords,
    );

    const prompt = `Write a blog draft in markdown.
Topic: ${topic}
Audience: ${audience || "developers"}
Tone: ${tone || "clear"}
Goal: ${goal || "practical learning"}
Suggested sections: ${(includeSections || []).join(", ") || "Introduction, Core Ideas, Practical Steps, Conclusion"}
Word target: around ${normalizedWordCount} words.
Important: create a clean title as the first markdown heading, then write a helpful blog that can be edited in a CMS.`;

    const { text } = await callGemini({
      prompt,
      systemInstruction:
        "You are an expert blog writer. Return only the blog draft in markdown format. Do not wrap in code fences.",
      temperature: 0.8,
      maxOutputTokens: Math.min(800, normalizedWordCount * 2),
    });

    return directResponse(res, {
      data: {
        draft: text,
        appliedWordLimit: normalizedWordCount,
        planTier,
      },
    });
  }),

  refineDirect: asyncHandler(async (req, res) => {
    const userId = req.user;
    const planTier = await resolvePlanTier(userId);
    const { draftText, instructions, wordCount } = req.body;

    if (!draftText || !draftText.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "draftText is required" });
    }

    const maxWords = AI_WORD_LIMITS[planTier] ?? AI_WORD_LIMITS.free;
    const normalizedWordCount = Math.min(
      Math.max(parseInt(wordCount, 10) || maxWords, 120),
      maxWords,
    );

    const prompt = `Refine the following draft into a polished blog post.
Instructions: ${instructions || "Improve clarity, structure, and flow."}
Target length: up to ${normalizedWordCount} words.

Draft:
${draftText}`;

    const { text } = await callGemini({
      prompt,
      systemInstruction:
        "You are a careful editor. Preserve the original meaning while improving readability, structure, and polish.",
      temperature: 0.5,
      maxOutputTokens: Math.min(800, normalizedWordCount * 2),
    });

    return directResponse(res, {
      data: {
        refinedText: text,
        appliedWordLimit: normalizedWordCount,
        planTier,
      },
    });
  }),

  enqueueRefine: asyncHandler(async (req, res) => {
    const userId = req.user;
    const planTier = await resolvePlanTier(userId);
    const { draftText, instructions, wordCount } = req.body;

    if (!draftText || !draftText.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "draftText is required" });
    }

    const maxWords = AI_WORD_LIMITS[planTier] ?? AI_WORD_LIMITS.free;
    const normalizedWordCount = Math.min(
      Math.max(parseInt(wordCount, 10) || maxWords, 120),
      maxWords,
    );

    const { reused, task } = await createQueuedTask({
      req,
      type: "edit_refine",
      requestPayload: {
        draftText,
        instructions,
        wordCount: normalizedWordCount,
      },
      userId,
      planTier,
    });

    res.status(202).json({
      success: true,
      reused,
      message: "AI refine task queued",
      data: { taskId: task._id, status: task.status },
    });
  }),

  enqueueSemanticSearch: asyncHandler(async (req, res) => {
    const userId = req.user || null;
    const guestSessionId = userId ? null : getGuestSessionId(req);
    const planTier = userId ? await resolvePlanTier(userId) : "guest";

    const { query, limit } = req.body;
    if (!query || !query.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "query is required" });
    }

    const { reused, task } = await createQueuedTask({
      req,
      type: "semantic_search",
      requestPayload: {
        query: query.trim(),
        limit: Math.min(Math.max(parseInt(limit, 10) || 8, 1), 20),
      },
      userId,
      guestSessionId,
      planTier,
    });

    res.status(202).json({
      success: true,
      reused,
      message: "Semantic search task queued",
      data: { taskId: task._id, status: task.status },
    });
  }),

  semanticSearchDirect: asyncHandler(async (req, res) => {
    const { query, limit, page } = req.body;
    if (!query || !query.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "query is required" });
    }

    const results = await searchPostsByMeaning({
      query: query.trim(),
      limit: limit || 12,
      page: page || 1,
    });

    return directResponse(res, { data: results });
  }),

  enqueueGuestChat: asyncHandler(async (req, res) => {
    const userId = req.user || null;
    const guestSessionId = userId ? null : getGuestSessionId(req);
    const planTier = userId ? await resolvePlanTier(userId) : "guest";

    const { message, postId } = req.body;
    if (!message || !message.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "message is required" });
    }

    const { reused, task } = await createQueuedTask({
      req,
      type: "guest_chat",
      requestPayload: {
        message: message.trim(),
        postId: postId || null,
      },
      userId,
      guestSessionId,
      planTier,
    });

    res.status(202).json({
      success: true,
      reused,
      message: "Guest AI chat task queued",
      data: { taskId: task._id, status: task.status },
    });
  }),

  guestChatDirect: asyncHandler(async (req, res) => {
    const userId = req.user || null;
    const guestSessionId = userId ? null : normalizeGuestSessionId(req);
    const { message, postId } = req.body;

    if (!message || !message.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "message is required" });
    }

    const prompt = `You are a guest-support chatbot for a blogging platform.
User message: ${message}
Optional post context id: ${postId || "none"}

If the user asks to find blogs, answer with helpful search guidance and suggest topics.
If the user asks to summarize a blog, provide a concise summary.
If uncertain, politely guide the user to ask for blogs, summarization, or posting help.`;

    const { text } = await callGemini({
      prompt,
      systemInstruction:
        "You are a concise, helpful support assistant for blog discovery and summarization.",
      temperature: 0.6,
      maxOutputTokens: 512,
    });

    return directResponse(res, {
      data: {
        reply: text,
        guestSessionId,
      },
    });
  }),

  enqueueSummarizeBlog: asyncHandler(async (req, res) => {
    const userId = req.user || null;
    const guestSessionId = userId ? null : getGuestSessionId(req);
    const planTier = userId ? await resolvePlanTier(userId) : "guest";

    const { postId, text, maxWords } = req.body;

    if (!postId && !text) {
      return res
        .status(400)
        .json({ success: false, message: "Either postId or text is required" });
    }

    const maxCap = AI_WORD_LIMITS[planTier] ?? AI_WORD_LIMITS.guest;
    const normalizedWords = Math.min(
      Math.max(parseInt(maxWords, 10) || 160, 80),
      maxCap,
    );

    const { reused, task } = await createQueuedTask({
      req,
      type: "summarize_blog",
      requestPayload: {
        postId: postId || null,
        text: text || "",
        maxWords: normalizedWords,
      },
      userId,
      guestSessionId,
      planTier,
    });

    res.status(202).json({
      success: true,
      reused,
      message: "Summarization task queued",
      data: { taskId: task._id, status: task.status },
    });
  }),

  summarizeBlogDirect: asyncHandler(async (req, res) => {
    const userId = req.user || null;
    const guestSessionId = userId ? null : normalizeGuestSessionId(req);
    const { postId, text, maxWords } = req.body;

    if (!postId && !text) {
      return res
        .status(400)
        .json({ success: false, message: "Either postId or text is required" });
    }

    let sourceText = text || "";
    if (!sourceText && postId) {
      const Post = require("../../models/Post/Post");
      const post = await Post.findById(postId)
        .select("title description content")
        .lean();
      if (!post) {
        return res
          .status(404)
          .json({ success: false, message: "Post not found" });
      }
      sourceText = `${post.title || ""}\n${post.description || ""}\n${post.content || ""}`;
    }

    const maxCap = AI_WORD_LIMITS.free;
    const normalizedWords = Math.min(
      Math.max(parseInt(maxWords, 10) || 160, 80),
      maxCap,
    );

    const { text: summary } = await callGemini({
      prompt: `Summarize the following blog in a short, clear paragraph around ${normalizedWords} words or less. Keep the core meaning and main points intact:\n\n${sourceText}`,
      systemInstruction:
        "You are a careful summarizer. Return only the summary text.",
      temperature: 0.3,
      maxOutputTokens: 512,
    });

    return directResponse(res, {
      data: {
        summary,
        guestSessionId,
      },
    });
  }),

  getTaskStatus: asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const userId = req.user || null;
    const guestSessionId = userId ? null : getGuestSessionId(req);

    const task = await AITask.findById(taskId).lean();
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    const isOwnerUser =
      userId && task.userId && task.userId.toString() === userId.toString();
    const isOwnerGuest =
      !userId && task.guestSessionId && task.guestSessionId === guestSessionId;

    if (!isOwnerUser && !isOwnerGuest) {
      return res
        .status(403)
        .json({ success: false, message: "Not allowed to view this task" });
    }

    res.json({
      success: true,
      data: {
        taskId: task._id,
        type: task.type,
        status: task.status,
        result: task.result,
        error: task.error,
        attempts: task.attempts,
        createdAt: task.createdAt,
        completedAt: task.completedAt,
      },
    });
  }),
};

module.exports = aiController;
