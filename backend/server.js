require("dotenv").config();
const corse = require("cors");
const passport = require("./utils/passport-config");
const express = require("express");
const cron = require("node-cron");
const cookieParser = require("cookie-parser");
const connectDB = require("./utils/connectDB");
const postRouter = require("./router/post/postsRouter");
const usersRouter = require("./router/user/usersRouter");
const categoriesRouter = require("./router/category/categoriesRouter");
const planRouter = require("./router/plan/planRouter");
const stripePaymentRouter = require("./router/stripePayment/stripePaymentRouter");
const chatRouter = require("./router/chat/chatRouter");
const aiRouter = require("./router/ai/aiRouter");

const notificationRouter = require("./router/notification/notificationRouter");
const commentRouter = require("./router/comments/commentRouter");
const adminAuthRouter = require("./router/admin/adminAuthRouter");
const adminManagementRouter = require("./router/admin/adminManagementRouter");
// const { profileRouter } = require("./router/user/profile.route");

// Import post controller for scheduled posts
const postController = require("./controllers/posts/postController");
const User = require("./models/User/User");
const Notification = require("./models/Notification/Notification");

//call the db
connectDB();

//Schedule the task to run at 23:59 on the last day of every month
cron.schedule(
  "59 23 * * * ",
  async () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (today.getMonth() !== tomorrow.getMonth()) {
      // Earnings functionality removed
    }
  },
  {
    scheduled: true,
    timezone: "America/New_York",
  },
);

// Import BullMQ queue and worker
const postQueue = require("./utils/postQueue");
require("./workers/postWorker");
require("./workers/emailWorker");
require("./workers/notificationWorker");
require("./workers/imageWorker");
require("./workers/deleteWorker");
require("./workers/aiWorker");

// Schedule task to trigger BullMQ worker every minute for scheduled posts
cron.schedule(
  "* * * * *", // Every minute
  async () => {
    try {
      await postQueue.add(
        "publish-scheduled-posts",
        {},
        {
          removeOnComplete: true,
          removeOnFail: { age: 24 * 3600 }, // Keep failed jobs for 1 day
        },
      );
    } catch (error) {
      console.error("❌ Error adding job to post queue:", error);
    }
  },
  {
    scheduled: true,
    timezone: "America/New_York",
  },
);

// Daily job: deactivate users inactive for 30+ days
cron.schedule(
  "0 2 * * *", // every day at 02:00
  async () => {
    try {
      const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const result = await User.updateMany(
        { lastLogin: { $lt: cutoff }, isBanned: { $ne: true } },
        { $set: { isActive: false } },
      );
      if (result.modifiedCount > 0) {
        console.log(
          `⚠️ Deactivated ${result.modifiedCount} inactive user accounts`,
        );
      }
    } catch (err) {
      console.error("❌ Error deactivating inactive users:", err);
    }
  },
  { scheduled: true, timezone: "America/New_York" },
);

// Daily job: Expire subscription plans after 30 days
cron.schedule(
  "0 3 * * *", // every day at 03:00
  async () => {
    try {
      const Plan = require("./models/Plan/Plan");
      // Find the "Free" plan to reset to
      const freePlan = await Plan.findOne({ tier: "free" });
      
      const now = new Date();
      const result = await User.updateMany(
        { 
          planExpirationDate: { $lt: now },
          plan: { $ne: freePlan?._id } 
        },
        { 
          $set: { 
            hasSelectedPlan: true, 
            plan: freePlan?._id || null, // Reset to free plan if found, else null
            planExpirationDate: null 
          } 
        }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`🕒 Expired ${result.modifiedCount} subscription plans`);
      }
    } catch (err) {
      console.error("❌ Error expiring plans:", err);
    }
  },
  { scheduled: true, timezone: "America/New_York" }
);

const app = express();
//! PORT
const PORT = process.env.PORT || 5000;

//Middlewares
app.use(express.json()); //Pass json data
// trust proxy for correct secure cookies on Render
app.set("trust proxy", 1);
// cors middleware with dynamic origin allow-list
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
  process.env.ADMIN_FRONTEND_URL,
  ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(",") : []),
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    const isAllowed =
      allowedOrigins.includes(origin) ||
      /\.vercel\.app$/.test(origin) ||
      /localhost:\d+$/.test(origin);
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`CORS not allowed for origin: ${origin}`));
    }
  },
  credentials: true,
};
app.use(corse(corsOptions));
app.options("*", corse(corsOptions));
// Passport middleware
app.use(passport.initialize());
app.use(cookieParser()); //automattically parses the cookie
//!---Route handlers
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/categories", categoriesRouter);
app.use("/api/v1/plans", planRouter);
app.use("/api/v1/stripe", stripePaymentRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/chat", chatRouter);
app.use("/api/v1/ai", aiRouter);
app.use("/api/v1/admin/auth", adminAuthRouter);
app.use("/api/v1/admin", adminManagementRouter);
// app.use("/api/profile", profileRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Backend server is running",
    timestamp: new Date().toISOString(),
  });
});

//!Not found
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found on our server" });
});
//! Error handdling middleware
app.use((err, req, res, next) => {
  //prepare the error message
  const message = err.message;
  const stack = err.stack;
  res.status(500).json({
    message,
    stack,
  });
});

const http = require("http");
const { initSocket } = require("./utils/socket");

const server = http.createServer(app);
initSocket(server);

//!Start the server
server.listen(PORT, console.log(`Server is up and running on port ${PORT}`));
