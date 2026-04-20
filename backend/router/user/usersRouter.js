const express = require("express");
const multer = require("multer");
const userController = require("../../controllers/users/userController");
const isAuthenticated = require("../../middlewares/isAuthenticated");
const isAccountVerified = require("../../middlewares/isAccountVerified");
const storage = require("../../utils/fileupload");

const usersRouter = express.Router();
//create multer instance
const upload = multer({ storage });

//! Register
usersRouter.post("/register", userController.register);
usersRouter.post("/login", userController.login);
usersRouter.get("/auth/google", userController.googleAuth);
usersRouter.get("/auth/google/callback", userController.googleAuthCallback);
usersRouter.get("/checkAuthenticated", userController.checkAuthenticated);
usersRouter.post("/logout", userController.logout);
usersRouter.get("/profile", isAuthenticated, userController.profile);
usersRouter.put(
  "/follow/:followId",
  isAuthenticated,
  isAccountVerified,
  userController.followUser
);
usersRouter.put("/update-email", isAuthenticated, userController.updateEmail);

usersRouter.put(
  "/upload-profile-picture",
  isAuthenticated,
  upload.single("image"),
  userController.updateProfilePic
);

// Update user profile
usersRouter.put(
  "/profile",
  isAuthenticated,
  userController.updateProfile
);
usersRouter.put(
  "/unfollow/:unfollowId",
  isAuthenticated,
  isAccountVerified,
  userController.unFollowUser
);
usersRouter.put(
  "/account-verification-email",
  isAuthenticated,
  userController.verifyEmailAccount
);
usersRouter.put(
  "/verify-account/:verifyToken",
  isAuthenticated,
  userController.verifyEmailAcc
);
usersRouter.post("/forgot-password", userController.forgotPassword);
usersRouter.post(
  "/reset-password",
  isAuthenticated, // <-- this sets req.user
  userController.resetPassword
);
usersRouter.put(
  "/change-password",
  isAuthenticated,
  userController.changePassword
);

// Delete user account
usersRouter.delete(
  "/delete-account",
  isAuthenticated,
  userController.deleteAccount
);
// Get public profile of a user by ID
usersRouter.get("/profile/:userId", userController.getUserProfileById);

// Get user's current plan and usage
usersRouter.get("/plan-usage", isAuthenticated, userController.getUserPlanAndUsage);

// Get user's plan change history
usersRouter.get("/plan-history", isAuthenticated, userController.getUserPlanHistory);

// Get lightweight user stats for sidebar
usersRouter.get("/stats", isAuthenticated, userController.getUserStats);

// Save post routes
usersRouter.put("/save-post/:postId", isAuthenticated, userController.savePost);
usersRouter.put("/unsave-post/:postId", isAuthenticated, userController.unsavePost);
usersRouter.get("/saved-posts", isAuthenticated, userController.getSavedPosts);

// Get all users for ranking (public endpoint)
usersRouter.get("/all", userController.getAllUsers);

// Get users ranked by most followers
usersRouter.get("/ranking/followers", userController.getUsersByFollowers);

// Get posts ranked by most likes
usersRouter.get("/ranking/likes", userController.getPostsByLikes);

// Get posts ranked by most views
usersRouter.get("/ranking/views", userController.getPostsByViews);

module.exports = usersRouter;
