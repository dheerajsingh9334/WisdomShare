const Post = require("../models/Post/Post");
const { callGeminiJson, isGeminiConfigured } = require("./gemini");

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

  const titleTokens = new Set(tokenize(post.title || ""));
  let titleBoost = 0;
  queryTokenSet.forEach((token) => {
    if (titleTokens.has(token)) titleBoost += 0.5;
  });

  return overlap + titleBoost;
};

const getGeminiExpandedTerms = async (query) => {
  if (!isGeminiConfigured()) return [];

  const response = await callGeminiJson({
    prompt: `You are helping semantic search. Expand the user's intent into short search terms, topics, and synonyms.
Return JSON only with this exact shape: {"expandedTerms":["term1","term2"],"intent":"short label"}
User query: ${query}`,
    temperature: 0.2,
    maxOutputTokens: 256,
  });

  const expandedTerms = Array.isArray(response?.expandedTerms)
    ? response.expandedTerms
        .map((term) =>
          String(term || "")
            .toLowerCase()
            .trim(),
        )
        .filter(Boolean)
    : [];

  return expandedTerms;
};

const searchPostsByMeaning = async ({ query, page = 1, limit = 12 }) => {
  const posts = await Post.find({
    isBlocked: { $ne: true },
    status: "published",
    "options.visibility": { $ne: "private" },
  })
    .select(
      "title description content tags author createdAt image viewsCount likes comments",
    )
    .populate("author", "username profilePicture")
    .sort({ publishedAt: -1, createdAt: -1 })
    .limit(250)
    .lean();

  const queryTokens = tokenize(query);
  let expandedTokens = [...expandSemanticTokens(queryTokens)];

  try {
    const geminiTerms = await getGeminiExpandedTerms(query);
    expandedTokens = [
      ...new Set([...expandedTokens, ...geminiTerms, ...queryTokens]),
    ];
  } catch (error) {
    // Fallback to local semantic expansion if Gemini fails
  }

  const expandedTokenSet = new Set(expandedTokens);

  const ranked = posts
    .map((post) => ({
      ...post,
      score: scoreDocument(expandedTokenSet, post),
    }))
    .filter((item) => item.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score || new Date(b.createdAt) - new Date(a.createdAt),
    );

  const totalCount = ranked.length;
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.max(1, Math.min(parseInt(limit, 10) || 12, 20));
  const startIndex = (safePage - 1) * safeLimit;
  const pagedResults = ranked.slice(startIndex, startIndex + safeLimit);

  return {
    query,
    totalCount,
    page: safePage,
    limit: safeLimit,
    hasMore: startIndex + safeLimit < totalCount,
    results: pagedResults,
  };
};

module.exports = {
  searchPostsByMeaning,
  tokenize,
  expandSemanticTokens,
};
