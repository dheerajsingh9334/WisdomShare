const express = require("express");
const multer = require("multer");
const postController = require("../../controllers/posts/postController");
const storage = require("../../utils/fileupload");
const isAuthenticated = require("../../middlewares/isAuthenticated");
const {
  checkUserPlan,
  checkPostLimit,
} = require("../../middlewares/checkUserPlan");
const optionalAuth = require("../../middlewares/optionalAuth");
const isAccountVerified = require("../../middlewares/isAccountVerified");
const checkUserBan = require("../../middlewares/checkUserBan");
const {
  commentRateLimiter,
  postRateLimiter,
} = require("../../middlewares/rateLimiter");

//create multer instance
const upload = multer({ storage });
//!create instance express router
const postRouter = express.Router();

//-----Create post----
postRouter.post(
  "/create",
  isAuthenticated,
  isAccountVerified,
  checkUserBan,
  checkUserPlan,
  checkPostLimit,
  postRateLimiter,
  upload.single("image"),
  postController.createPost,
);

//----lists all posts----
postRouter.get("/", optionalAuth, postController.fetchAllPosts);

//----search all (posts and users)----
postRouter.get("/search", optionalAuth, postController.searchAll);

// Add this route for trending posts
postRouter.get("/trending", postController.fetchTrendingPosts);

// Add this route with other authenticated routes
postRouter.get(
  "/following",
  isAuthenticated,
  postController.fetchPostsByFollowing,
);

// New routes for drafts and scheduled posts - MUST come before /:postId routes
postRouter.get(
  "/drafts",
  isAuthenticated,
  checkUserBan,
  postController.getUserDrafts,
);
postRouter.get(
  "/scheduled",
  isAuthenticated,
  checkUserBan,
  postController.getUserScheduledPosts,
);
postRouter.get(
  "/published",
  isAuthenticated,
  checkUserBan,
  postController.getUserPublishedPosts,
);

// Tag-related routes - MUST come before /:postId routes
postRouter.get("/search-by-tags", postController.searchPostsByTags);
postRouter.get("/popular-tags", postController.getPopularTags);

// Publish scheduled posts (admin/cron job)
postRouter.post(
  "/publish-scheduled",
  isAuthenticated,
  postController.publishScheduledPosts,
);

//----update post----
postRouter.put(
  "/:postId",
  isAuthenticated,
  checkUserBan,
  upload.single("image"),
  postController.update,
);

//--- get post---
postRouter.get("/:postId", optionalAuth, postController.getPost);

//---delete post---
postRouter.delete("/:postId", isAuthenticated, postController.delete);

//---like post----
postRouter.put(
  "/likes/:postId",
  isAuthenticated,
  isAccountVerified,
  checkUserBan,
  commentRateLimiter,
  postController.like,
);

//---dislike post----
postRouter.put(
  "/dislikes/:postId",
  isAuthenticated,
  isAccountVerified,
  checkUserBan,
  commentRateLimiter,
  postController.dislike,
);

//---track post view---
postRouter.post(
  "/track-view/:postId",
  isAuthenticated,
  postController.trackPostView,
);

//---get post analytics (author only)---
postRouter.get(
  "/analytics/:postId",
  isAuthenticated,
  postController.getPostAnalytics,
);

// Update post status (draft to published, schedule, etc.)
postRouter.patch(
  "/:postId/status",
  isAuthenticated,
  checkUserBan,
  postController.updatePostStatus,
);

module.exports = postRouter;
