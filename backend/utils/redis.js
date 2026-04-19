const Redis = require("ioredis");

// BullMQ connection (maxRetriesPerRequest: null is required)
const redisConnection = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

redisConnection.on("connect", () => {
  console.log("✅ Redis (BullMQ) connected");
});

redisConnection.on("error", (err) => {
  console.error("❌ Redis (BullMQ) connection error:", err);
});

// Separate Redis client used only for caching
const redisCache = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

redisCache.on("connect", () => {
  console.log("✅ Redis (Cache) connected");
});

redisCache.on("error", (err) => {
  console.error("❌ Redis (Cache) connection error:", err);
});

// ─── Cache Helpers ─────────────────────────────────────────────────────────

/**
 * Get a cached JSON value. Returns null on miss or error.
 */
const getCache = async (key) => {
  try {
    const data = await redisCache.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error(`⚠️  Cache GET error [${key}]:`, err.message);
    return null;
  }
};

/**
 * Set a cache key with a TTL (seconds). Defaults to 60s.
 */
const setCache = async (key, value, ttl = 60) => {
  try {
    await redisCache.set(key, JSON.stringify(value), "EX", ttl);
  } catch (err) {
    console.error(`⚠️  Cache SET error [${key}]:`, err.message);
  }
};

/**
 * Delete a single cache key.
 */
const delCache = async (key) => {
  try {
    await redisCache.del(key);
  } catch (err) {
    console.error(`⚠️  Cache DEL error [${key}]:`, err.message);
  }
};

/**
 * Delete all cache keys matching a glob pattern (uses SCAN to avoid blocking).
 */
const delCachePattern = async (pattern) => {
  try {
    let cursor = "0";
    do {
      const [newCursor, keys] = await redisCache.scan(cursor, "MATCH", pattern, "COUNT", 100);
      cursor = newCursor;
      if (keys.length > 0) {
        await redisCache.del(...keys);
      }
    } while (cursor !== "0");
  } catch (err) {
    console.error(`⚠️  Cache DEL PATTERN error [${pattern}]:`, err.message);
  }
};

module.exports = redisConnection;
module.exports.redisCache = redisCache;
module.exports.getCache = getCache;
module.exports.setCache = setCache;
module.exports.delCache = delCache;
module.exports.delCachePattern = delCachePattern;
