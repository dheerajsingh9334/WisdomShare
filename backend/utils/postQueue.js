const { Queue } = require("bullmq");
const redisConnection = require("./redis");

const postQueue = new Queue("post-queue", {
  connection: redisConnection,
});

module.exports = postQueue;
