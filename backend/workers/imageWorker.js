const { Worker } = require("bullmq");
const redisConnection = require("../utils/redis");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const imageWorker = new Worker(
  "image-upload-queue",
  async (job) => {
    console.log(`🖼️ Image worker processing job ${job.id}: ${job.name}`);
    const { filePath, folder, publicId } = job.data;

    if (job.name === "upload-image") {
      const options = {
        folder: folder || "wisdomshare",
        resource_type: "auto",
      };
      if (publicId) options.public_id = publicId;

      const result = await cloudinary.uploader.upload(filePath, options);
      console.log(`✅ Image uploaded to Cloudinary: ${result.secure_url}`);
      return { publicId: result.public_id, url: result.secure_url };
    }

    if (job.name === "delete-image") {
      const { cloudPublicId } = job.data;
      if (cloudPublicId) {
        await cloudinary.uploader.destroy(cloudPublicId);
        console.log(`🗑️ Cloudinary image deleted: ${cloudPublicId}`);
      }
      return { deleted: true };
    }
  },
  {
    connection: redisConnection,
    concurrency: 3, // Process up to 3 uploads simultaneously
  }
);

imageWorker.on("completed", (job, result) => {
  console.log(`✅ Image job ${job.id} completed:`, result?.url || result?.deleted);
});

imageWorker.on("failed", (job, err) => {
  console.error(`❌ Image job ${job.id} failed: ${err.message}`);
});

module.exports = imageWorker;
