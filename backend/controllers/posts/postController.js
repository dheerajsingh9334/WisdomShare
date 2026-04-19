const asyncHandler = require("express-async-handler");
const Post = require("../../models/Post/Post");
const Category = require("../../models/Category/Category");
const User = require("../../models/User/User");
const Notification = require("../../models/Notification/Notification");
const sendNotificatiomMsg = require("../../utils/sendNotificatiomMsg");
const {
  getCache,
  setCache,
  delCache,
  delCachePattern,
} = require("../../utils/redis");
const notificationQueue = require("../../utils/notificationQueue");
const emailQueue = require("../../utils/emailQueue");
const deleteQueue = require("../../utils/deleteQueue");

const PLAN_CHAR_LIMITS = { free: 1500, premium: 5000, pro: 10000 };

const getPlanTier = (userDoc) => {
  return (userDoc?.plan?.tier || userDoc?.plan?.planName || "free")
    .toString()
    .toLowerCase();
};

const getPlanCharLimit = (userDoc) =>
  PLAN_CHAR_LIMITS[getPlanTier(userDoc)] ?? PLAN_CHAR_LIMITS.free;

const postController = {
  createPost: asyncHandler(async (req, res) => {
    let postCreated = null;
    let categoryFound = null;
    let userFound = null;
    let fallbackDraftPayload = null;

    try {
      const {
        title,
        description,
        content,
        category,
        tags,
        status,
        scheduledFor,
        slug,
        excerpt,
      } = req.body;
      // Optional nested fields (may arrive as JSON strings in multipart requests)
      let { options, seo } = req.body;
      const image = req.file;

      // Validate required fields
      if (!title || !description) {
        return res.status(400).json({
          message: "Title and description are required.",
        });
      }

      if (!image || !image.path) {
        return res.status(400).json({
          message: "Image is required and must be uploaded properly.",
        });
      }

      const imageUrl = image.path?.startsWith("http")
        ? image.path
        : `${req.protocol}://${req.get("host")}/${image.path}`;

      categoryFound = await Category.findById(category);
      if (!categoryFound) {
        return res.status(404).json({ message: "Category not found" });
      }

      userFound = await User.findById(req.user).populate("plan");
      if (!userFound) {
        return res.status(404).json({ message: "User not found" });
      }

      // Plan checking is handled by middleware. Here we enforce per-plan character limits.
      const planTier = getPlanTier(userFound);
      const charLimit = getPlanCharLimit(userFound);
      const bodyText =
        (content && content.trim().length > 0 ? content : description) || "";
      if (bodyText.length > charLimit) {
        return res.status(400).json({
          message: `Content exceeds plan limit. Max ${charLimit} characters for your plan (${userFound.plan?.planName || planTier}).`,
          limit: charLimit,
          provided: bodyText.length,
        });
      }

      // Parse options/seo if provided as JSON strings
      try {
        if (typeof options === "string") options = JSON.parse(options);
      } catch {
        /* ignore parse errors */
      }
      try {
        if (typeof seo === "string") seo = JSON.parse(seo);
      } catch {
        /* ignore parse errors */
      }

      // Coerce boolean-like values in options
      const coerceBool = (v, def = undefined) =>
        typeof v === "string" ? v === "true" : typeof v === "boolean" ? v : def;
      const normalizedOptions = {
        commentsEnabled: coerceBool(options?.commentsEnabled, true),
        reactionsEnabled: coerceBool(options?.reactionsEnabled, true),
        allowSharing: coerceBool(options?.allowSharing, true),
        pinToProfile: coerceBool(options?.pinToProfile, false),
        featured: coerceBool(options?.featured, false),
        nsfw: coerceBool(options?.nsfw, false),
        visibility: ["public", "unlisted", "private"].includes(
          options?.visibility,
        )
          ? options.visibility
          : "public",
      };

      // Basic SEO normalization
      const normalizedSeo = {
        metaTitle:
          seo?.metaTitle?.toString().trim()?.slice(0, 120) || undefined,
        metaDescription:
          seo?.metaDescription?.toString().trim()?.slice(0, 200) || undefined,
        canonicalUrl: seo?.canonicalUrl?.toString().trim() || undefined,
      };

      // Generate slug from title if not provided
      const slugify = (str) =>
        str
          .toString()
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-");
      const finalSlug =
        slug && slug.toString().trim().length > 0
          ? slugify(slug)
          : slugify(title);

      // Compute reading time (approx. 200 wpm)
      const words = bodyText.trim().split(/\s+/).filter(Boolean).length;
      const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));

      // Process tags - convert to lowercase and remove duplicates
      let processedTags = [];
      if (tags) {
        // Handle both array and comma-separated string
        const tagArray = Array.isArray(tags)
          ? tags
          : tags.split(",").map((tag) => tag.trim());
        processedTags = [
          ...new Set(
            tagArray
              .map((tag) => tag.toLowerCase().trim())
              .filter((tag) => tag.length > 0),
          ),
        ];
      }

      // Determine post status and publishing - simplify this logic
      let postStatus = status || "published"; // Default to published
      let publishedAt = new Date(); // Always set publishedAt
      // visibility from options takes precedence over isPublic default
      let isPublic = normalizedOptions.visibility === "public";

      console.log("🔍 Post Creation Debug:");
      console.log("Requested status:", status);
      console.log("Requested scheduledFor:", scheduledFor);

      // Only set to draft if explicitly requested
      if (status === "draft") {
        postStatus = "draft";
        isPublic = false;
        console.log("✅ Setting post to DRAFT");
      } else if (status === "scheduled" && scheduledFor) {
        postStatus = "scheduled";
        isPublic = false;
        publishedAt = null; // Don't set publishedAt for scheduled posts
        console.log("✅ Setting post to SCHEDULED for:", scheduledFor);
      } else {
        console.log("✅ Setting post to PUBLISHED");
      }

      console.log("Final postStatus:", postStatus);
      console.log("Final isPublic:", isPublic);
      console.log("Final publishedAt:", publishedAt);

      fallbackDraftPayload = {
        title,
        description,
        content: content || description,
        contentLength: bodyText.length,
        slug: finalSlug,
        image: imageUrl,
        author: req.user,
        category,
        tags: processedTags,
        excerpt:
          excerpt && excerpt.toString().trim().length > 0
            ? excerpt.toString().trim().slice(0, 500)
            : description
              ? description.toString().trim().slice(0, 200)
              : undefined,
        options: normalizedOptions,
        seo: normalizedSeo,
        readingTimeMinutes,
      };

      postCreated = await Post.create({
        ...fallbackDraftPayload,
        title,
        description,
        status: postStatus,
        publishedAt,
        scheduledFor: scheduledFor || null,
        isPublic,
      });

      // Push post to category and user
      categoryFound.posts.push(postCreated._id);
      await categoryFound.save();

      userFound.posts.push(postCreated._id);
      await userFound.save();

      // Invalidate posts cache on new post
      await delCachePattern("posts:all:*").catch(() => {});

      // Create notification only for published posts
      if (postStatus === "published") {
        try {
          // Queue author notification
          await notificationQueue.add("create-notification", {
            userId: req.user,
            postId: postCreated._id,
            title: "Post Published",
            message: `New post published by ${userFound.username}`,
            type: "system_announcement",
          });

          // Send admin notification for new post
          try {
            const AdminNotificationService = require("../../utils/adminNotificationService");
            await AdminNotificationService.notifyNewPost(
              postCreated,
              userFound,
            );
          } catch (adminNotificationError) {
            console.error(
              "Failed to send admin notification for new post:",
              adminNotificationError,
            );
          }

          // Queue email + in-app notifications for followers via BullMQ
          if (userFound.followers && userFound.followers.length > 0) {
            const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
            for (const followerId of userFound.followers) {
              try {
                const follower =
                  await User.findById(followerId).select("email username");
                if (!follower) continue;

                // Queue email
                if (follower.email) {
                  await emailQueue.add("send-notification", {
                    to: follower.email,
                    subject: `📝 New post from ${userFound.username}`,
                    html: `
                    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
                      <h2 style="color:#6366f1;">New post from ${userFound.username}</h2>
                      <h3>${title}</h3>
                      <p>${postCreated.excerpt || description?.slice(0, 200) || ""}</p>
                      <a href="${baseUrl}/posts/${postCreated._id}"
                         style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
                        Read Post
                      </a>
                    </div>
                  `,
                  });
                }

                // Queue in-app notification
                await notificationQueue.add("create-notification", {
                  userId: followerId,
                  postId: postCreated._id,
                  title: "New Post from Someone You Follow",
                  message: `${userFound.username} published: "${title}"`,
                  type: "new_post_from_following",
                  metadata: {
                    actorId: req.user,
                    actorName: userFound.username,
                    actorAvatar: userFound.profilePicture,
                    action: "published",
                    targetType: "post",
                    targetId: postCreated._id,
                  },
                });
              } catch (followerErr) {
                console.error(
                  "Failed to queue notification for follower:",
                  followerId,
                  followerErr,
                );
              }
            }
          }
        } catch (notificationError) {
          console.error("Failed to queue notifications:", notificationError);
        }
      }

      // Compute today's usage for response
      try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        const postsToday = await Post.countDocuments({
          author: req.user,
          createdAt: { $gte: startOfDay, $lte: endOfDay },
        });
        const tierDefaults = { free: 20, premium: 50, pro: 200 };
        const planTierResp = (
          userFound.plan?.tier ||
          userFound.plan?.planName ||
          "free"
        )
          .toString()
          .toLowerCase();
        const effectiveDailyLimit =
          typeof userFound.plan?.postLimit === "number"
            ? userFound.plan.postLimit
            : (tierDefaults[planTierResp] ?? 20);
        res.status(201).json({
          status: "success",
          message: `Post ${postStatus === "draft" ? "saved as draft" : postStatus === "scheduled" ? "scheduled for publishing" : "published"} successfully`,
          postCreated,
          planUsage: {
            plan: userFound.plan?.planName || planTierResp,
            charLimit,
            today: {
              count: postsToday,
              limit: effectiveDailyLimit,
              remaining: Math.max(0, effectiveDailyLimit - postsToday),
            },
          },
        });
      } catch (_) {
        // Fallback response if usage calculation fails
        res.status(201).json({
          status: "success",
          message: `Post ${postStatus === "draft" ? "saved as draft" : postStatus === "scheduled" ? "scheduled for publishing" : "published"} successfully`,
          postCreated,
        });
      }
    } catch (error) {
      console.error("🔥 Create Post Error:", error.message);
      console.error(error.stack);

      // Crash-safety fallback: preserve user content as draft if publish flow failed before save.
      if (!postCreated && fallbackDraftPayload && req.user) {
        try {
          const draftPost = await Post.create({
            ...fallbackDraftPayload,
            status: "draft",
            publishedAt: null,
            scheduledFor: null,
            isPublic: false,
            options: {
              ...(fallbackDraftPayload.options || {}),
              visibility: "private",
            },
          });

          if (categoryFound?._id) {
            await Category.findByIdAndUpdate(categoryFound._id, {
              $addToSet: { posts: draftPost._id },
            });
          }

          if (userFound?._id) {
            await User.findByIdAndUpdate(userFound._id, {
              $addToSet: { posts: draftPost._id },
            });
          }

          await delCachePattern("posts:all:*").catch(() => {});

          return res.status(201).json({
            status: "warning",
            message:
              "Publish flow failed, but your post was auto-saved as a draft.",
            postCreated: draftPost,
            autoSavedAsDraft: true,
          });
        } catch (draftError) {
          console.error("❌ Draft fallback failed:", draftError.message);
        }
      }

      res.status(500).json({
        message: error.message || "Internal Server Error",
      });
    }
  }),

  //! List all posts — cursor-based pagination + plan gating + standardized response
  fetchAllPosts: asyncHandler(async (req, res) => {
    const {
      category,
      q, // full-text search query
      title, // legacy regex title search (still supported)
      cursor, // ISO date string of last seen publishedAt for infinite scroll
      limit: rawLimit = 20,
      tags,
    } = req.query;

    const limit = Math.min(parseInt(rawLimit, 10) || 20, 50); // cap at 50

    // Determine requesting user plan tier (if authenticated)
    let userPlanTier = "free";
    if (req.user) {
      try {
        const reqUser = await User.findById(req.user)
          .select("plan")
          .populate("plan", "tier planName");
        userPlanTier = getPlanTier(reqUser);
      } catch (_) {
        /* default to free */
      }
    }

    // Build cache key
    const cacheKey = `posts:all:v2:cursor:${cursor || "start"}:limit:${limit}:cat:${category || ""}:q:${q || ""}:title:${title || ""}:tags:${tags || ""}:plan:${userPlanTier}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      console.log(`🎯 Cache hit: ${cacheKey}`);
      return res.json({ ...cached, fromCache: true });
    }

    // --- Build filter ---
    const filter = {
      isBlocked: { $ne: true },
      status: "published",
      "options.visibility": { $ne: "private" },
    };

    // Cursor: fetch posts published before the cursor date (infinite scroll)
    if (cursor) {
      const cursorDate = new Date(cursor);
      if (!Number.isNaN(cursorDate.getTime())) {
        filter.publishedAt = { $lt: cursorDate };
      }
    }

    if (category) filter.category = category;

    if (tags) {
      const tagArray = tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);
      if (tagArray.length) filter.tags = { $in: tagArray };
    }

    // Full-text search takes priority over regex title search
    if (q && q.trim()) {
      filter.$text = { $search: q.trim() };
    } else if (title && title.trim()) {
      filter.title = { $regex: title.trim(), $options: "i" };
    }

    // --- Projection: only return fields we actually need ---
    const projection = {
      title: 1,
      excerpt: 1,
      image: 1,
      author: 1,
      category: 1,
      tags: 1,
      viewsCount: 1,
      contentLength: 1,
      description: 1,
      publishedAt: 1,
      createdAt: 1,
      status: 1,
      readingTimeMinutes: 1,
      "options.visibility": 1,
    };

    // Score projection for text search
    if (q && q.trim()) {
      projection.score = { $meta: "textScore" };
    }

    // --- Query ---
    let query = Post.find(filter, projection)
      .populate("category", "categoryName")
      .populate("author", "username profilePicture")
      .limit(limit + 1); // fetch one extra to determine hasMore

    // Sort: text-score first when searching, otherwise newest-first
    if (q && q.trim()) {
      query = query.sort({ score: { $meta: "textScore" }, publishedAt: -1 });
    } else {
      query = query.sort({ publishedAt: -1, createdAt: -1 });
    }

    const rawPosts = await query.lean();

    const hasMore = rawPosts.length > limit;
    const posts = hasMore ? rawPosts.slice(0, limit) : rawPosts;

    // Determine nextCursor from the last returned post
    const nextCursor =
      hasMore && posts.length > 0
        ? posts[posts.length - 1].publishedAt?.toISOString()
        : null;

    // --- Plan-based content locking ---
    const userCharLimit =
      PLAN_CHAR_LIMITS[userPlanTier] ?? PLAN_CHAR_LIMITS.free;

    const processedPosts = posts.map((post) => {
      const bodyLen = post.contentLength || (post.description || "").length;
      const locked = bodyLen > userCharLimit;
      const result = { ...post };
      if (locked) {
        // List endpoint signals lock state; full body stays in single-post endpoint
        result.locked = true;
        result.requiredPlan =
          bodyLen > PLAN_CHAR_LIMITS.premium ? "pro" : "premium";
      }
      return result;
    });

    const responseData = {
      success: true,
      data: processedPosts,
      nextCursor,
      hasMore,
      // legacy fields for backward compat with existing frontend pagination
      message: "Posts fetched successfully",
      posts: processedPosts,
      totalPosts: null, // not counted in cursor mode to avoid expensive countDocuments
      currentPage: null,
      totalPages: null,
      hasNextPage: hasMore,
    };

    // Cache for 60 seconds
    await setCache(cacheKey, responseData, 60);

    res.json(responseData);
  }),

  //! get a post
  getPost: asyncHandler(async (req, res) => {
    //get the post id from params
    const postId = req.params.postId;
    //check for login user
    const userId = req.user ? req.user : null;
    //find the post
    const postFound = await Post.findById(postId)
      .populate("author", "username profilePicture followers following")
      .populate("category", "categoryName")
      .populate({
        path: "comments",
        populate: [
          {
            path: "author",
            select: "username profilePicture",
          },
          {
            path: "replies",
            populate: [
              {
                path: "author",
                select: "username profilePicture",
              },
              {
                path: "replies",
                populate: {
                  path: "author",
                  select: "username profilePicture",
                },
              },
            ],
          },
        ],
      });
    if (!postFound) {
      throw new Error("Post not found");
    }
    if (userId) {
      await Post.findByIdAndUpdate(
        postId,
        {
          $addToSet: { viewers: userId },
        },
        {
          new: true,
        },
      );
    }

    // Plan-based body visibility: viewers only see full content according to plan, authors always can.
    let viewerPlanTier = "free";
    if (userId) {
      const viewer = await User.findById(userId)
        .select("plan")
        .populate("plan", "tier planName");
      viewerPlanTier = getPlanTier(viewer);
    }

    const authorId =
      postFound.author?._id?.toString?.() || postFound.author?.toString?.();
    const isAuthor = Boolean(
      userId && authorId && authorId === userId.toString(),
    );
    const effectiveBody = (
      postFound.content ||
      postFound.description ||
      ""
    ).toString();
    const bodyLength = postFound.contentLength || effectiveBody.length;
    const maxAllowed =
      PLAN_CHAR_LIMITS[viewerPlanTier] ?? PLAN_CHAR_LIMITS.free;

    if (!isAuthor && bodyLength > maxAllowed) {
      postFound.content = `${effectiveBody.slice(0, maxAllowed)}…`;
      postFound.locked = true;
      postFound.requiredPlan =
        bodyLength > PLAN_CHAR_LIMITS.premium ? "pro" : "premium";
    }

    res.json({
      success: true,
      data: postFound,
      message: "Post fetched successfully",
      postFound,
    });
  }),
  //! delete
  delete: asyncHandler(async (req, res) => {
    const postId = req.params.postId;

    // Find post to get Cloudinary public_id and relations
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Extract Cloudinary public_id from stored image object
    const cloudinaryPublicId = post.image?.public_id || null;

    // Queue full cleanup (Cloudinary + DB + cache) via BullMQ
    await deleteQueue.add("delete-post", {
      postId: postId.toString(),
      authorId: post.author?.toString(),
      categoryId: post.category?.toString(),
      cloudinaryPublicId,
    });

    res.json({
      status: "success",
      message: "Post deletion queued successfully",
    });
  }),
  //! Update post
  update: asyncHandler(async (req, res) => {
    //get the post id from params
    const postId = req.params.postId;

    //find the post
    const postFound = await Post.findById(postId);
    if (!postFound) {
      throw new Error("Post not found");
    }

    // Check if user owns the post
    if (postFound.author.toString() !== req.user) {
      return res
        .status(403)
        .json({ message: "You can only update your own posts" });
    }

    // Validate category is provided
    if (!req.body.category) {
      return res.status(400).json({ message: "Category is required" });
    }

    // Verify category exists
    const categoryFound = await Category.findById(req.body.category);
    if (!categoryFound) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Prepare update data
    const updateData = {};

    if (req.body.title) {
      updateData.title = req.body.title;
    }

    if (req.body.description) {
      updateData.description = req.body.description;
    }

    if (req.body.category) {
      updateData.category = req.body.category;
    }

    // Optional fields updates
    if (req.body.slug) {
      const slugify = (str) =>
        str
          .toString()
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-");
      updateData.slug = slugify(req.body.slug);
    }

    if (req.body.excerpt) {
      updateData.excerpt = req.body.excerpt.toString().trim().slice(0, 500);
    }

    if (req.file) {
      const imageUrl = req.file.path?.startsWith("http")
        ? req.file.path
        : `${req.protocol}://${req.get("host")}/${req.file.path}`;
      updateData.image = imageUrl;
    }

    // Process tags if provided
    if (req.body.tags) {
      const processedTags = [
        ...new Set(
          req.body.tags.split(",").map((tag) => tag.toLowerCase().trim()),
        ),
      ];
      updateData.tags = processedTags;
    }

    // Options and SEO may arrive as JSON strings
    let { options, seo } = req.body;
    try {
      if (typeof options === "string") options = JSON.parse(options);
    } catch {}
    try {
      if (typeof seo === "string") seo = JSON.parse(seo);
    } catch {}
    if (options) {
      const coerceBool = (v, def = undefined) =>
        typeof v === "string" ? v === "true" : typeof v === "boolean" ? v : def;
      updateData.options = {
        commentsEnabled: coerceBool(
          options.commentsEnabled,
          postFound.options?.commentsEnabled ?? true,
        ),
        reactionsEnabled: coerceBool(
          options.reactionsEnabled,
          postFound.options?.reactionsEnabled ?? true,
        ),
        allowSharing: coerceBool(
          options.allowSharing,
          postFound.options?.allowSharing ?? true,
        ),
        pinToProfile: coerceBool(
          options.pinToProfile,
          postFound.options?.pinToProfile ?? false,
        ),
        featured: coerceBool(
          options.featured,
          postFound.options?.featured ?? false,
        ),
        nsfw: coerceBool(options.nsfw, postFound.options?.nsfw ?? false),
        visibility: ["public", "unlisted", "private"].includes(
          options.visibility,
        )
          ? options.visibility
          : (postFound.options?.visibility ?? "public"),
      };
    }
    if (seo) {
      updateData.seo = {
        metaTitle: seo.metaTitle?.toString().trim().slice(0, 120),
        metaDescription: seo.metaDescription?.toString().trim().slice(0, 200),
        canonicalUrl: seo.canonicalUrl?.toString().trim(),
      };
    }

    // Handle status changes
    if (req.body.status) {
      const newStatus = req.body.status;
      const oldStatus = postFound.status;

      updateData.status = newStatus;

      // Handle status-specific logic
      if (newStatus === "published") {
        updateData.publishedAt = new Date();
        updateData.isPublic = true;
      } else if (newStatus === "draft") {
        updateData.isPublic = false;
        updateData.publishedAt = null;
        updateData.scheduledFor = null;
      } else if (newStatus === "scheduled") {
        if (!req.body.scheduledFor) {
          return res.status(400).json({
            message: "Scheduled date is required for scheduled posts",
          });
        }

        const scheduledDate = new Date(req.body.scheduledFor);
        if (scheduledDate <= new Date()) {
          return res
            .status(400)
            .json({ message: "Scheduled date must be in the future" });
        }

        updateData.scheduledFor = scheduledDate;
        updateData.isPublic = false;
        updateData.publishedAt = null;
      }
    }

    // Handle scheduledFor separately if status is not being changed
    if (req.body.scheduledFor && req.body.status === "scheduled") {
      const scheduledDate = new Date(req.body.scheduledFor);
      if (scheduledDate <= new Date()) {
        return res
          .status(400)
          .json({ message: "Scheduled date must be in the future" });
      }
      updateData.scheduledFor = scheduledDate;
    }

    // If content/description are being updated, enforce plan character limit
    let bodyChanged = false;
    if (req.body.description || req.body.content) {
      const author = postFound.author;
      const authorWithPlan = await User.findById(author).populate("plan");
      const planTier = getPlanTier(authorWithPlan);
      const charLimit = getPlanCharLimit(authorWithPlan);
      const newBody =
        (req.body.content && req.body.content.trim().length > 0
          ? req.body.content
          : req.body.description || postFound.description) || "";
      if (newBody.length > charLimit) {
        return res.status(400).json({
          message: `Content exceeds plan limit. Max ${charLimit} characters for your plan (${authorWithPlan.plan?.planName || planTier}).`,
          limit: charLimit,
          provided: newBody.length,
        });
      }
      bodyChanged = true;
      // If description provided, update it; same for content
      if (req.body.description) updateData.description = req.body.description;
      if (req.body.content) updateData.content = req.body.content;
    }

    //update
    // Recompute reading time if body changed
    if (bodyChanged) {
      const text = (
        updateData.content ||
        updateData.description ||
        postFound.content ||
        postFound.description ||
        ""
      ).toString();
      const words = text.trim().split(/\s+/).filter(Boolean).length;
      updateData.readingTimeMinutes = Math.max(1, Math.ceil(words / 200));
      updateData.contentLength = text.length;
    }

    const postUpdated = await Post.findByIdAndUpdate(postId, updateData, {
      new: true,
    })
      .populate("category", "categoryName")
      .populate("author", "username profilePicture");

    // Create notification for status changes to published
    if (req.body.status === "published" && postFound.status !== "published") {
      try {
        const userFound = await User.findById(req.user);
        await Notification.create({
          userId: req.user,
          postId: postUpdated._id,
          title: "Post Published",
          message: `Your post "${postUpdated.title}" has been published`,
          type: "system_announcement",
        });

        // Send email notifications to followers
        if (userFound.followers && userFound.followers.length > 0) {
          userFound.followers.forEach(async (followerId) => {
            try {
              const follower = await User.findById(followerId);
              if (follower && follower.email) {
                await sendNotificatiomMsg(follower.email, postUpdated._id);
              }
            } catch (emailError) {
              console.error(
                "Failed to send email notification to follower:",
                followerId,
                emailError,
              );
            }
          });
        }
      } catch (notificationError) {
        console.error("Failed to create notification:", notificationError);
      }
    }

    res.json({
      status: "success",
      message: `Post ${req.body.status === "draft" ? "saved as draft" : req.body.status === "scheduled" ? "scheduled for publishing" : "updated"} successfully`,
      postUpdated,
    });
  }),
  //like post
  like: asyncHandler(async (req, res) => {
    //Post id
    const postId = req.params.postId;
    //user liking a post
    const userId = req.user;
    //Find the post
    const post = await Post.findById(postId);
    //Check if a user has already disliked the post
    if (post?.dislikes.includes(userId)) {
      post?.dislikes?.pull(userId);
    }
    //Check if a user has already liked the post
    if (post?.likes.includes(userId)) {
      post?.likes?.pull(userId);
    } else {
      post?.likes?.push(userId);
    }
    //resave the post
    await post.save();
    //send the response
    res.json({
      message: "Post Liked",
    });
  }),
  //like post
  dislike: asyncHandler(async (req, res) => {
    //Post id
    const postId = req.params.postId;
    //user disliking a post
    const userId = req.user;
    //Find the post
    const post = await Post.findById(postId);
    //Check if a user has already liked the post
    if (post?.likes.includes(userId)) {
      post?.likes?.pull(userId);
    }
    //Check if a user has already disliked the post
    if (post?.dislikes.includes(userId)) {
      post?.dislikes?.pull(userId);
    } else {
      post?.dislikes?.push(userId);
    }
    await post.save();
    res.json({
      status: "success",
      message: "Post disliked successfully",
    });
  }),

  //! Get user published posts
  getUserPublishedPosts: asyncHandler(async (req, res) => {
    const userId = req.user;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    console.log("🔍 getUserPublishedPosts Debug:");
    console.log("User ID:", userId);
    console.log("Page:", page, "Limit:", limit);

    // More flexible filter - show posts that are published or don't have status field
    // Also handle ObjectId comparison properly and exclude admin-managed posts
    const filter = {
      author: userId,
      adminManaged: { $ne: true }, // Exclude admin-managed posts
      $or: [
        { status: "published" },
        { status: { $exists: false } },
        { status: null },
        { status: { $nin: ["draft", "scheduled", "archived"] } }, // Show posts with any other status
      ],
    };

    console.log("Filter:", JSON.stringify(filter, null, 2));

    const publishedPosts = await Post.find(filter)
      .populate("category", "categoryName")
      .populate("likes", "username profilePicture")
      .populate("viewers", "username profilePicture")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "username profilePicture",
        },
      })
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    console.log("Found posts:", publishedPosts.length);

    const totalPublished = await Post.countDocuments(filter);

    console.log("Total published:", totalPublished);

    res.json({
      status: "success",
      message: "Published posts fetched successfully",
      posts: publishedPosts,
      currentPage: Number(page),
      perPage: Number(limit),
      totalPages: Math.ceil(totalPublished / limit),
      totalPosts: totalPublished,
    });
  }),

  //! Get user drafts
  getUserDrafts: asyncHandler(async (req, res) => {
    const userId = req.user;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    console.log("🔍 getUserDrafts Debug:");
    console.log("User ID:", userId);
    console.log("Page:", page, "Limit:", limit);

    const filter = {
      author: userId,
      status: "draft",
    };

    console.log("Filter:", JSON.stringify(filter, null, 2));

    const drafts = await Post.find(filter)
      .populate("category", "categoryName")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    console.log("Found drafts:", drafts.length);

    const totalDrafts = await Post.countDocuments(filter);

    console.log("Total drafts:", totalDrafts);

    res.json({
      status: "success",
      message: "Drafts fetched successfully",
      drafts,
      currentPage: Number(page),
      perPage: Number(limit),
      totalPages: Math.ceil(totalDrafts / limit),
      totalDrafts,
    });
  }),

  //! Get user scheduled posts
  getUserScheduledPosts: asyncHandler(async (req, res) => {
    const userId = req.user;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    console.log("🔍 getUserScheduledPosts Debug:");
    console.log("User ID:", userId);
    console.log("Page:", page, "Limit:", limit);

    const filter = {
      author: userId,
      status: "scheduled",
    };

    console.log("Filter:", JSON.stringify(filter, null, 2));

    const scheduledPosts = await Post.find(filter)
      .populate("category", "categoryName")
      .sort({ scheduledFor: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    console.log("Found scheduled posts:", scheduledPosts.length);

    const totalScheduled = await Post.countDocuments(filter);

    console.log("Total scheduled:", totalScheduled);

    res.json({
      status: "success",
      message: "Scheduled posts fetched successfully",
      scheduledPosts,
      currentPage: Number(page),
      perPage: Number(limit),
      totalPages: Math.ceil(totalScheduled / limit),
      totalScheduled,
    });
  }),

  //! Update post status (draft to published, schedule, etc.)
  updatePostStatus: asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const { status, scheduledFor } = req.body;
    const userId = req.user;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user owns the post
    if (post.author.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You can only update your own posts" });
    }

    let updateData = { status };
    let isPublic = false;
    let publishedAt = null;

    if (status === "published") {
      updateData.publishedAt = new Date();
      updateData.isPublic = true;
      updateData.scheduledFor = null; // Clear scheduled date if publishing now
    } else if (status === "scheduled") {
      if (!scheduledFor) {
        return res
          .status(400)
          .json({ message: "Scheduled date is required for scheduled posts" });
      }
      updateData.scheduledFor = new Date(scheduledFor);
      updateData.isPublic = false;
    } else if (status === "draft") {
      updateData.isPublic = false;
      updateData.scheduledFor = null;
    }

    const updatedPost = await Post.findByIdAndUpdate(postId, updateData, {
      new: true,
    }).populate("category", "categoryName");

    res.json({
      status: "success",
      message: `Post status updated to ${status}`,
      post: updatedPost,
    });
  }),

  //! Search posts by tags
  searchPostsByTags: asyncHandler(async (req, res) => {
    const { tags, page = 1, limit = 20 } = req.query;

    if (!tags) {
      return res.status(400).json({ message: "Tags parameter is required" });
    }

    const tagArray = tags.split(",").map((tag) => tag.trim().toLowerCase());

    const posts = await Post.find({
      tags: { $in: tagArray },
      status: "published",
      isPublic: true,
    })
      .populate("category", "categoryName")
      .populate("author", "username profilePicture")
      .sort({ publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalPosts = await Post.countDocuments({
      tags: { $in: tagArray },
      status: "published",
      isPublic: true,
    });

    res.json({
      status: "success",
      message: "Posts found by tags",
      posts,
      currentPage: Number(page),
      perPage: Number(limit),
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts,
      searchedTags: tagArray,
    });
  }),

  //! Get popular tags
  getPopularTags: asyncHandler(async (req, res) => {
    const { limit = 20 } = req.query;

    const popularTags = await Post.aggregate([
      {
        $match: {
          $or: [
            { status: "published" },
            { status: { $exists: false } },
            { status: null },
            { status: { $nin: ["draft", "scheduled", "archived"] } },
          ],
        },
      },
      { $unwind: "$tags" },
      {
        $group: {
          _id: "$tags",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) },
    ]);

    res.json({
      status: "success",
      message: "Popular tags fetched successfully",
      popularTags,
    });
  }),

  //! Publish scheduled posts (cron job function)
  publishScheduledPosts: asyncHandler(async (req, res) => {
    const now = new Date();

    const scheduledPosts = await Post.find({
      status: "scheduled",
      scheduledFor: { $lte: now },
      isPublic: false,
    });

    let publishedCount = 0;

    for (const post of scheduledPosts) {
      await Post.findByIdAndUpdate(post._id, {
        status: "published",
        publishedAt: now,
        isPublic: true,
      });

      // Create notification
      await Notification.create({
        userId: post.author,
        postId: post._id,
        message: `Your scheduled post "${post.title}" has been published`,
      });

      publishedCount++;
    }

    res.json({
      status: "success",
      message: `${publishedCount} scheduled posts published`,
      publishedCount,
    });
  }),

  //! trending posts
  fetchTrendingPosts: asyncHandler(async (req, res) => {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      // More flexible filter - show posts that are published or don't have status field
      const trendingPosts = await Post.find({
        createdAt: { $gte: oneWeekAgo },
        $or: [
          { status: "published" },
          { status: { $exists: false } },
          { status: null },
          { status: { $nin: ["draft", "scheduled", "archived"] } },
        ],
      })
        .sort({ likes: -1, viewsCount: -1 })
        .limit(10)
        .populate("author", "username profilePicture")
        .populate("category", "categoryName")
        .populate("comments"); // To get comments count

      res.json({
        status: "success",
        posts: trendingPosts,
      });
    } catch (err) {
      console.error("🔥 Trending Fetch Error:", err.message);
      res.status(500).json({ error: "Failed to fetch trending posts." });
    }
  }),

  //! Fetch posts from users the current user follows
  fetchPostsByFollowing: asyncHandler(async (req, res) => {
    try {
      // Get the current user
      const user = await User.findById(req.user).populate("following");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get IDs of followed users
      const followingIds = user.following.map((user) => user._id);

      // Find posts from followed users, sorted by newest first
      const posts = await Post.find({
        author: { $in: followingIds },
        status: "published",
        isPublic: true,
      })
        .sort({ createdAt: -1 })
        .populate("author", "username profilePicture")
        .populate("category", "categoryName")
        .populate("comments");

      res.json({
        status: "success",
        message: "Posts from followed users fetched successfully",
        posts,
      });
    } catch (error) {
      console.error("Error fetching posts from following:", error);
      res.status(500).json({
        message: error.message || "Failed to fetch posts from followed users",
      });
    }
  }),

  //! Comprehensive search - posts and users
  searchAll: asyncHandler(async (req, res) => {
    const { q: searchQuery, type = "all", page = 1, limit = 20 } = req.query;

    if (!searchQuery || searchQuery.trim().length < 2) {
      return res.status(400).json({
        status: "error",
        message: "Search query must be at least 2 characters long",
      });
    }

    const normalizedQuery = searchQuery.trim();
    const searchRegex = new RegExp(
      normalizedQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "i",
    );
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.min(Math.max(1, parseInt(limit, 10) || 20), 50);
    const skip = (parsedPage - 1) * parsedLimit;

    try {
      const results = {
        posts: [],
        users: [],
        totalPosts: 0,
        totalUsers: 0,
        currentPage: parsedPage,
        perPage: parsedLimit,
      };

      // Search posts if type is 'all' or 'posts'
      if (type === "all" || type === "posts") {
        const postFilter = {
          isBlocked: { $ne: true },
          status: "published",
          "options.visibility": { $ne: "private" },
        };

        // Prefer text index for performance; regex fallback for short/partial strings.
        if (normalizedQuery.length >= 3) {
          postFilter.$text = { $search: normalizedQuery };
        } else {
          postFilter.$or = [
            { title: searchRegex },
            { description: searchRegex },
          ];
        }

        const projection = {
          title: 1,
          excerpt: 1,
          image: 1,
          author: 1,
          category: 1,
          viewsCount: 1,
          contentLength: 1,
          createdAt: 1,
        };

        if (postFilter.$text) {
          projection.score = { $meta: "textScore" };
        }

        let postQuery = Post.find(postFilter, projection)
          .populate("author", "username profilePicture")
          .populate("category", "categoryName")
          .lean()
          .skip(skip)
          .limit(parsedLimit);

        postQuery = postFilter.$text
          ? postQuery.sort({ score: { $meta: "textScore" }, createdAt: -1 })
          : postQuery.sort({ createdAt: -1 });

        const posts = await postQuery;

        const totalPosts = await Post.countDocuments(postFilter);

        results.posts = posts;
        results.totalPosts = totalPosts;
      }

      // Search users if type is 'all' or 'users'
      if (type === "all" || type === "users") {
        const users = await User.find({
          $or: [{ username: searchRegex }, { email: searchRegex }],
        })
          .select("username profilePicture followers following posts")
          .lean()
          .sort({ username: 1 })
          .skip(skip)
          .limit(parsedLimit);

        const totalUsers = await User.countDocuments({
          $or: [{ username: searchRegex }, { email: searchRegex }],
        });

        results.users = users;
        results.totalUsers = totalUsers;
      }

      const totalResults = results.totalPosts + results.totalUsers;
      const hasMore = totalResults > parsedPage * parsedLimit;
      res.json({
        success: true,
        data: results,
        nextCursor: hasMore ? String(parsedPage + 1) : null,
        hasMore,
        message: "Search completed successfully",
        results,
        query: normalizedQuery,
        type,
      });
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({
        success: false,
        message: "Search failed",
        error: error.message,
      });
    }
  }),

  //! Track post view (add user to viewers array)
  trackPostView: asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const userId = req.user;

    try {
      // Find post and check if user already viewed
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      // Add user to viewers if not already present
      if (!post.viewers.includes(userId)) {
        post.viewers.push(userId);
        post.viewsCount = (post.viewsCount || 0) + 1;
        await post.save();
      }

      res.json({
        status: "success",
        message: "View tracked successfully",
        viewsCount: post.viewsCount,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Failed to track view",
        error: error.message,
      });
    }
  }),

  //! Get post analytics for author
  getPostAnalytics: asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const userId = req.user;

    try {
      const post = await Post.findById(postId)
        .populate("likes", "username profilePicture createdAt")
        .populate("viewers", "username profilePicture")
        .populate({
          path: "comments",
          populate: {
            path: "author",
            select: "username profilePicture",
          },
        });

      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      // Check if user is the author
      if (post.author.toString() !== userId.toString()) {
        return res
          .status(403)
          .json({ message: "Only post author can view analytics" });
      }

      // Check if post is admin-managed
      if (post.adminManaged) {
        return res
          .status(403)
          .json({ message: "Analytics not available for admin-managed posts" });
      }

      const analytics = {
        totalViews: post.viewsCount || 0,
        totalLikes: post.likes?.length || 0,
        totalComments: post.comments?.length || 0,
        viewers: post.viewers || [],
        likers: post.likes || [],
        comments: post.comments || [],
      };

      res.json({
        status: "success",
        message: "Analytics fetched successfully",
        analytics,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Failed to fetch analytics",
        error: error.message,
      });
    }
  }),
};

module.exports = postController;
