const { Worker } = require("bullmq");
const redisConnection = require("../utils/redis");
const Post = require("../models/Post/Post");
const Notification = require("../models/Notification/Notification");
const User = require("../models/User/User");
const emailQueue = require("../utils/emailQueue");
const notificationQueue = require("../utils/notificationQueue");

const postWorker = new Worker(
  "post-queue",
  async (job) => {
    if (job.name === "publish-scheduled-posts") {
      try {
        const now = new Date();
        const scheduledPosts = await Post.find({
          status: "scheduled",
          scheduledFor: { $lte: now },
          isPublic: false,
        }).populate("author", "username email followers profilePicture");

        let publishedCount = 0;

        for (const post of scheduledPosts) {
          try {
            await Post.findByIdAndUpdate(post._id, {
              status: "published",
              publishedAt: now,
              isPublic: true,
            });

            // Queue author notification
            await notificationQueue.add("create-notification", {
              userId: post.author._id,
              postId: post._id,
              title: "Post Published",
              message: `Your scheduled post "${post.title}" has been published`,
              type: "system_announcement",
            });

            // Queue follower email + notification jobs
            if (post.author.followers && post.author.followers.length > 0) {
              const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
              const followers = await User.find({
                _id: { $in: post.author.followers },
              }).select("email username");

              for (const follower of followers) {
                // Queue email for follower
                if (follower.email) {
                  await emailQueue.add("send-notification", {
                    to: follower.email,
                    subject: `📝 New post from ${post.author.username}`,
                    html: `
                      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #6366f1;">New post from ${post.author.username}</h2>
                        <h3>${post.title}</h3>
                        <p>${post.excerpt || post.description?.slice(0, 200) || ""}</p>
                        <a href="${baseUrl}/posts/${post._id}"
                           style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
                          Read Post
                        </a>
                      </div>
                    `,
                  });
                }

                // Queue in-app notification for follower
                await notificationQueue.add("create-notification", {
                  userId: follower._id,
                  postId: post._id,
                  title: "New Post from Someone You Follow",
                  message: `${post.author.username} published: "${post.title}"`,
                  type: "new_post_from_following",
                  metadata: {
                    actorId: post.author._id,
                    actorName: post.author.username,
                    actorAvatar: post.author.profilePicture,
                    action: "published",
                    targetType: "post",
                    targetId: post._id,
                  },
                });
              }
            }

            publishedCount++;
            console.log(`✅ Published scheduled post: ${post.title}`);
          } catch (postError) {
            console.error(`❌ Error publishing post ${post._id}:`, postError);
          }
        }

        return { publishedCount };
      } catch (error) {
        console.error("❌ Error in post worker:", error);
        throw error;
      }
    }
  },
  {
    connection: redisConnection,
  }
);

postWorker.on("completed", (job, result) => {
  if (result && result.publishedCount > 0) {
    console.log(`✅ Post job ${job.id} completed! Published ${result.publishedCount} posts.`);
  } else if (job.name !== "publish-scheduled-posts") {
    console.log(`✅ Post job ${job.id} completed!`);
  }
});

postWorker.on("failed", (job, err) => {
  console.error(`❌ Post job ${job.id} failed: ${err.message}`);
});

module.exports = postWorker;
