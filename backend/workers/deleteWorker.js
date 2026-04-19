const { Worker } = require("bullmq");
const redisConnection = require("../utils/redis");
const cloudinary = require("cloudinary").v2;
const Post = require("../models/Post/Post");
const User = require("../models/User/User");
const Category = require("../models/Category/Category");
const { delCachePattern } = require("../utils/redis");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const deleteWorker = new Worker(
  "delete-queue",
  async (job) => {
    console.log(`🗑️ Delete worker processing job ${job.id}: ${job.name}`);

    if (job.name === "delete-post") {
      const { postId, authorId, categoryId, cloudinaryPublicId } = job.data;

      // Delete Cloudinary image if public_id exists
      if (cloudinaryPublicId) {
        try {
          await cloudinary.uploader.destroy(cloudinaryPublicId);
          console.log(`🗑️ Cloudinary asset deleted: ${cloudinaryPublicId}`);
        } catch (cloudErr) {
          console.warn("⚠️  Cloudinary deletion failed:", cloudErr.message);
        }
      }

      // Remove post reference from User
      if (authorId) {
        await User.findByIdAndUpdate(authorId, {
          $pull: { posts: postId },
          $inc: { totalPosts: -1 },
        });
      }

      // Remove post reference from Category
      if (categoryId) {
        await Category.findByIdAndUpdate(categoryId, {
          $pull: { posts: postId },
        });
      }

      // Delete post document
      await Post.findByIdAndDelete(postId);

      // Invalidate post cache
      await delCachePattern(`post:${postId}*`);
      await delCachePattern("posts:all:*");

      console.log(`✅ Post ${postId} fully deleted with cleanup`);
      return { deleted: postId };
    }
  },
  {
    connection: redisConnection,
    concurrency: 2,
  }
);

deleteWorker.on("completed", (job, result) => {
  console.log(`✅ Delete job ${job.id} completed:`, result?.deleted);
});

deleteWorker.on("failed", (job, err) => {
  console.error(`❌ Delete job ${job.id} failed: ${err.message}`);
});

module.exports = deleteWorker;
