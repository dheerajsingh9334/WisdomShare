const express = require("express");
const aiController = require("../../controllers/ai/aiController");
const isAuthenticated = require("../../middlewares/isAuthenticated");
const optionalAuth = require("../../middlewares/optionalAuth");

const aiRouter = express.Router();

// AI blog writer + refine (auth required)
aiRouter.post("/writer", isAuthenticated, aiController.enqueueBlogWriter);
aiRouter.post("/refine", isAuthenticated, aiController.enqueueRefine);

// Guest-friendly AI endpoints
aiRouter.post(
  "/writer/direct",
  isAuthenticated,
  aiController.generateBlogDirect,
);
aiRouter.post("/refine/direct", isAuthenticated, aiController.refineDirect);
aiRouter.post(
  "/semantic-search",
  optionalAuth,
  aiController.enqueueSemanticSearch,
);
aiRouter.post("/chat", optionalAuth, aiController.enqueueGuestChat);
aiRouter.post("/summarize", optionalAuth, aiController.enqueueSummarizeBlog);
aiRouter.post(
  "/semantic-search/direct",
  optionalAuth,
  aiController.semanticSearchDirect,
);
aiRouter.post("/chat/direct", optionalAuth, aiController.guestChatDirect);
aiRouter.post(
  "/summarize/direct",
  optionalAuth,
  aiController.summarizeBlogDirect,
);

// Task polling endpoint (works for auth + guest)
aiRouter.get("/tasks/:taskId", optionalAuth, aiController.getTaskStatus);

module.exports = aiRouter;
