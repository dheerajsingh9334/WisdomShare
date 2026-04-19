const { Worker } = require("bullmq");
const redisConnection = require("../utils/redis");
const AITask = require("../models/AI/AITask");
const Post = require("../models/Post/Post");
const { callGemini, isGeminiConfigured } = require("../utils/gemini");
const { searchPostsByMeaning } = require("../utils/aiSemanticSearch");

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "to",
  "of",
  "in",
  "on",
  "for",
  "with",
  "is",
  "are",
  "was",
  "were",
  "be",
  "this",
  "that",
  "how",
  "what",
  "about",
]);

const SYNONYMS = {
  react: ["react", "frontend", "ui", "component", "hooks", "jsx"],
  node: ["node", "backend", "api", "express", "server"],
  javascript: ["javascript", "js", "ecmascript"],
  performance: ["performance", "optimization", "speed", "fast", "latency"],
  database: ["database", "mongodb", "sql", "query", "index"],
  security: ["security", "auth", "jwt", "oauth", "encryption"],
};

const tokenize = (text = "") =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t && !STOP_WORDS.has(t));

const expandSemanticTokens = (tokens) => {
  const expanded = new Set(tokens);
  tokens.forEach((token) => {
    Object.values(SYNONYMS).forEach((group) => {
      if (group.includes(token)) {
        group.forEach((t) => expanded.add(t));
      }
    });
  });
  return expanded;
};

const scoreDocument = (queryTokenSet, post) => {
  const docTokens = tokenize(
    `${post.title || ""} ${post.description || ""} ${post.content || ""} ${(post.tags || []).join(" ")}`,
  );
  if (!docTokens.length) return 0;

  const docSet = new Set(docTokens);
  let overlap = 0;
  queryTokenSet.forEach((token) => {
    if (docSet.has(token)) overlap += 1;
  });

  // Add small score boost if query appears in title
  const titleTokens = new Set(tokenize(post.title || ""));
  let titleBoost = 0;
  queryTokenSet.forEach((token) => {
    if (titleTokens.has(token)) titleBoost += 0.5;
  });

  return overlap + titleBoost;
};

const buildBlogFromPrompt = ({
  topic,
  audience,
  tone,
  goal,
  includeSections,
  wordCount,
}) => {
  const sections = includeSections?.length
    ? includeSections
    : ["Introduction", "Core Ideas", "Practical Steps", "Conclusion"];

  const intro = `# ${topic}\n\nWriting for ${audience || "developers"} in a ${tone || "clear"} tone, this article focuses on ${goal || "practical understanding"}.`;

  const body = sections
    .map((section) => {
      if (section.toLowerCase().includes("introduction")) {
        return `## ${section}\n${topic} matters because it helps teams build dependable outcomes faster. In this section, we align the problem, expected impact, and constraints.`;
      }
      if (section.toLowerCase().includes("core")) {
        return `## ${section}\nBreak the topic into simple principles, then connect each principle to a real decision. This avoids shallow content and improves retention.`;
      }
      if (section.toLowerCase().includes("step")) {
        return `## ${section}\n1. Define a measurable goal.\n2. Start with a small implementation.\n3. Validate with feedback.\n4. Iterate using data.`;
      }
      return `## ${section}\nSummarize the key takeaway in one sentence, then give one actionable next step readers can apply immediately.`;
    })
    .join("\n\n");

  const draft = `${intro}\n\n${body}`;
  const words = draft.split(/\s+/).filter(Boolean);
  if (wordCount && words.length > wordCount) {
    return words.slice(0, wordCount).join(" ");
  }
  return draft;
};

const refineDraft = ({ draftText, instructions, wordCount }) => {
  const normalized = (draftText || "").replace(/\s+/g, " ").trim();
  const instructionBlock = instructions
    ? `\n\nRefinement goals applied: ${instructions}`
    : "\n\nRefinement goals applied: clarity, structure, concise phrasing.";
  let output = `${normalized}${instructionBlock}`;

  if (wordCount) {
    const words = output.split(/\s+/).filter(Boolean);
    if (words.length > wordCount) {
      output = words.slice(0, wordCount).join(" ");
    }
  }

  return output;
};

const summarizeBlogContent = async ({ postId, text, maxWords = 160 }) => {
  let sourceText = text || "";

  if (!sourceText && postId) {
    const post = await Post.findById(postId)
      .select("title description content")
      .lean();
    if (!post) throw new Error("Post not found for summary");
    sourceText = `${post.title || ""}. ${post.description || ""}. ${post.content || ""}`;
  }

  const words = sourceText.split(/\s+/).filter(Boolean);
  if (!words.length) {
    return "No content found to summarize.";
  }

  const short = words.slice(0, maxWords).join(" ");
  return `Summary: ${short}${words.length > maxWords ? "..." : ""}`;
};

const runSemanticSearch = async ({ query, limit = 8 }) => {
  const posts = await Post.find({
    isBlocked: { $ne: true },
    status: "published",
    "options.visibility": { $ne: "private" },
  })
    .select("title description content tags author createdAt")
    .populate("author", "username")
    .sort({ publishedAt: -1, createdAt: -1 })
    .limit(250)
    .lean();

  const queryTokens = tokenize(query);
  const expanded = expandSemanticTokens(queryTokens);

  const ranked = posts
    .map((post) => ({
      post,
      score: scoreDocument(expanded, post),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(1, Math.min(limit, 20)))
    .map(({ post, score }) => ({
      _id: post._id,
      title: post.title,
      excerpt: post.description,
      tags: post.tags || [],
      author: post.author,
      score,
    }));

  return {
    query,
    count: ranked.length,
    results: ranked,
  };
};

const runGuestChat = async ({ message, postId }) => {
  if (isGeminiConfigured()) {
    const context = postId ? `Optional postId context: ${postId}` : "";
    const { text } = await callGemini({
      prompt: `You are a guest support assistant for a blogging platform.\nUser message: ${message}\n${context}\nRespond helpfully, briefly, and practically. If the user asks to find blogs, suggest meaningful search topics and examples. If they ask for a summary, explain that they can paste a post or provide a post ID.`,
      systemInstruction:
        "You are a concise, helpful guest support assistant for a blogging platform.",
      temperature: 0.5,
      maxOutputTokens: 512,
    });

    return { reply: text };
  }

  const msg = (message || "").toLowerCase();

  if (msg.includes("find") && msg.includes("blog")) {
    const topic = msg
      .replace(/help me /g, "")
      .replace(/find blogs on/gi, "")
      .replace(/find blog on/gi, "")
      .trim();

    const semantic = await runSemanticSearch({
      query: topic || "technology",
      limit: 5,
    });

    return {
      reply: `I found ${semantic.count} blog(s) that semantically match \"${topic || "technology"}\".`,
      suggestions: semantic.results,
    };
  }

  if (msg.includes("summarize") && msg.includes("blog")) {
    const summary = await summarizeBlogContent({ postId, maxWords: 120 });
    return { reply: summary };
  }

  return {
    reply:
      "I can help you find blogs by meaning or summarize a blog. Try: 'Help me find blogs on React' or 'Summarize this blog'.",
  };
};

const aiWorker = new Worker(
  "ai-task-queue",
  async (job) => {
    const { taskId } = job.data || {};
    if (!taskId) return;

    const task = await AITask.findById(taskId);
    if (!task) return;

    task.status = "processing";
    task.attempts = (task.attempts || 0) + 1;
    task.error = null;
    await task.save();

    try {
      let result;

      if (task.type === "blog_writer") {
        if (isGeminiConfigured()) {
          const request = task.request || {};
          const { text } = await callGemini({
            prompt: `Write a blog draft in markdown.\nTopic: ${request.topic || "Untitled"}\nAudience: ${request.audience || "developers"}\nTone: ${request.tone || "clear"}\nGoal: ${request.goal || "practical learning"}\nSections: ${(request.includeSections || []).join(", ") || "Introduction, Core Ideas, Practical Steps, Conclusion"}\nWord target: around ${request.wordCount || 300} words.\nReturn a clean title as the first markdown heading and then a helpful draft that a user can edit.`,
            systemInstruction:
              "You are an expert blog writer. Return only markdown content, no code fences.",
            temperature: 0.8,
            maxOutputTokens: Math.min(2048, (request.wordCount || 300) * 2),
          });
          result = { draft: text, appliedWordLimit: task.request?.wordCount };
        } else {
          result = {
            draft: buildBlogFromPrompt(task.request || {}),
            appliedWordLimit: task.request?.wordCount,
          };
        }
      } else if (task.type === "edit_refine") {
        if (isGeminiConfigured()) {
          const request = task.request || {};
          const { text } = await callGemini({
            prompt: `Refine this draft into a polished blog post.\nInstructions: ${request.instructions || "Improve clarity, structure, and flow."}\nTarget length: up to ${request.wordCount || 300} words.\n\nDraft:\n${request.draftText || ""}`,
            systemInstruction:
              "You are a careful editor. Preserve the core meaning and improve readability.",
            temperature: 0.5,
            maxOutputTokens: Math.min(2048, (request.wordCount || 300) * 2),
          });
          result = { refinedText: text };
        } else {
          result = {
            refinedText: refineDraft(task.request || {}),
          };
        }
      } else if (task.type === "semantic_search") {
        result = await searchPostsByMeaning(task.request || {});
      } else if (task.type === "summarize_blog") {
        if (isGeminiConfigured()) {
          const request = task.request || {};
          let sourceText = request.text || "";
          if (!sourceText && request.postId) {
            const post = await Post.findById(request.postId)
              .select("title description content")
              .lean();
            if (!post) {
              throw new Error("Post not found for summary");
            }
            sourceText = `${post.title || ""}\n${post.description || ""}\n${post.content || ""}`;
          }
          const { text } = await callGemini({
            prompt: `Summarize the following blog in a clear, concise paragraph under ${request.maxWords || 160} words.\n\n${sourceText}`,
            systemInstruction:
              "You are a concise summarizer. Return only the summary text.",
            temperature: 0.3,
            maxOutputTokens: 512,
          });
          result = { summary: text };
        } else {
          result = {
            summary: await summarizeBlogContent(task.request || {}),
          };
        }
      } else if (task.type === "guest_chat") {
        result = await runGuestChat(task.request || {});
      } else {
        throw new Error(`Unsupported AI task type: ${task.type}`);
      }

      task.status = "completed";
      task.result = result;
      task.completedAt = new Date();
      await task.save();

      return { taskId: task._id, status: task.status };
    } catch (error) {
      task.status = "failed";
      task.error = error.message;
      await task.save();
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 3,
  },
);

aiWorker.on("completed", (job) => {
  console.log(`✅ AI job ${job.id} completed`);
});

aiWorker.on("failed", (job, err) => {
  console.error(`❌ AI job ${job?.id} failed: ${err.message}`);
});

module.exports = aiWorker;
