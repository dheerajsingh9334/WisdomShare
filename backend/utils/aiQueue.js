const { Queue } = require("bullmq");
const redisConnection = require("./redis");

const aiQueue = new Queue("ai-task-queue", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: true,
    removeOnFail: { age: 24 * 3600 },
  },
});

module.exports = aiQueue;
