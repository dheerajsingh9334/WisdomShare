const { Queue } = require("bullmq");
const redisConnection = require("./redis");

const deleteQueue = new Queue("delete-queue", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: true,
    removeOnFail: { age: 24 * 3600 },
  },
});

module.exports = deleteQueue;
