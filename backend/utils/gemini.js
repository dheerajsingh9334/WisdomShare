const fetchFn = globalThis.fetch ? globalThis.fetch.bind(globalThis) : null;

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isGeminiConfigured = () => Boolean(GEMINI_API_KEY);

const extractGeminiText = (payload) => {
  const candidates = payload?.candidates || [];
  const parts = candidates[0]?.content?.parts || [];
  return parts
    .map((part) => part.text || "")
    .join("")
    .trim();
};

const callGemini = async ({
  prompt,
  model = GEMINI_MODEL,
  systemInstruction = "",
  temperature = 0.7,
  maxOutputTokens = 1024,
  responseMimeType = "text/plain",
  retries = 3,
}) => {
  if (!isGeminiConfigured()) {
    throw new Error("Gemini API key is not configured");
  }

  if (!fetchFn) {
    throw new Error("Fetch API is not available in this Node runtime");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature,
      maxOutputTokens,
      responseMimeType,
    },
  };

  if (systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  let lastError = null;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetchFn(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error("Gemini API Error Detail:", JSON.stringify(data, null, 2));
        throw new Error(
          data?.error?.message ||
            `Gemini request failed with status ${response.status}`,
        );
      }

      const text = extractGeminiText(data);
      if (!text) {
        throw new Error("Gemini returned an empty response");
      }

      return { text, raw: data };
    } catch (error) {
      console.error(`Gemini Attempt ${attempt + 1} failed:`, error.message);
      lastError = error;
      if (attempt < retries) {
        await sleep(500 * Math.pow(2, attempt));
      }
    }
  }

  throw lastError || new Error("Gemini request failed");
};

const callGeminiJson = async (params) => {
  const { text } = await callGemini({
    ...params,
    responseMimeType: "application/json",
  });

  const match = text.match(/\{[\s\S]*\}/);
  const jsonText = match ? match[0] : text;
  return JSON.parse(jsonText);
};

module.exports = {
  callGemini,
  callGeminiJson,
  isGeminiConfigured,
};
