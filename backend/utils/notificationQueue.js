const { Queue } = require("bullmq");
const redisConnection = require("./redis");

const notificationQueue = new Queue("notification-queue", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: true,
    removeOnFail: { age: 24 * 3600 },
  },
});

module.exports = notificationQueue;
