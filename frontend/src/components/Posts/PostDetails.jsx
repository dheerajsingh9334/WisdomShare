import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState, useEffect } from "react";
import {
  FaThumbsUp,
  FaThumbsDown,
  FaEye,
  FaComment,
  FaBookmark,
  FaRegBookmark,
  FaShare,
  FaArrowLeft,
} from "react-icons/fa";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  dislikePostAPI,
  fetchPost,
  likePostAPI,
} from "../../APIServices/posts/postsAPI";
import {
  userProfileAPI,
  savePostAPI,
  unsavePostAPI,
} from "../../APIServices/users/usersAPI";
import { summarizeBlogDirectAPI } from "../../APIServices/ai/aiAPI";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { FaFacebook, FaTwitter } from "react-icons/fa";
import Avatar from "../User/Avatar";
import FollowButton from "../User/FollowButton";
import CommentList from "../Comments/CommentList";
import useViewTracker from "../../hooks/useViewTracker";
import AdvancedAnalyticsButton from "../Analytics/AdvancedAnalyticsButton";

const PostDetails = () => {
  const { postId } = useParams();
  const navigate = useNavigate();

  // Image getter
  const getImageUrl = (image) =>
    typeof image === "string" ? image : image?.path || "";

  // Fetch post
  const {
    isError,
    isLoading,
    data,
    error,
    refetch: refetchPost,
  } = useQuery({
    queryKey: ["post-details", postId],
    queryFn: () => fetchPost(postId),
  });

  // Fetch profile
  const { data: profileData, refetch: refetchProfile } = useQuery({
    queryKey: ["profile"],
    queryFn: userProfileAPI,
  });

  const post = data?.postFound;
  const image = getImageUrl(post?.image);
  const targetId = post?.author?._id;
  const userId = profileData?.user?._id;
  const isFollowing = profileData?.user?.following?.some(
    (user) => user?._id?.toString() === targetId?.toString(),
  );

  // Track view for analytics (only if user is authenticated)
  useViewTracker(postId, !!profileData?.user);

  // Local state for save status
  const [localIsSaved, setLocalIsSaved] = useState(false);
  const [summaryText, setSummaryText] = useState("");

  // Update local state when profile data changes
  useEffect(() => {
    if (profileData?.user?.savedPosts) {
      const savedStatus = profileData.user.savedPosts.some(
        (savedPostId) => savedPostId?.toString() === postId?.toString(),
      );
      setLocalIsSaved(savedStatus);
    }
  }, [profileData?.user?.savedPosts, postId]);

  // Calculate reading time
  const readingMins = useMemo(() => {
    if (!post?.description) return 1;
    const wordsPerMinute = 200;
    const wordCount = post.description.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }, [post?.description]);

  // Mutations
  const likePostMutation = useMutation({
    mutationFn: likePostAPI,
    onSuccess: () => refetchPost(),
  });
  const dislikePostMutation = useMutation({
    mutationFn: dislikePostAPI,
    onSuccess: () => refetchPost(),
  });
  const savePostMutation = useMutation({
    mutationFn: savePostAPI,
    onSuccess: () => {
      setLocalIsSaved(true);
      refetchProfile();
    },
  });
  const unsavePostMutation = useMutation({
    mutationFn: unsavePostAPI,
    onSuccess: () => {
      setLocalIsSaved(false);
      refetchProfile();
    },
  });
  const summarizeMutation = useMutation({
    mutationFn: ({ payload }) => summarizeBlogDirectAPI(payload),
    onSuccess: (response) => {
      setSummaryText(response?.data?.summary || "");
    },
    onError: (summarizeError) => {
      setSummaryText(
        summarizeError?.response?.data?.message ||
          summarizeError?.message ||
          "Failed to summarize this post",
      );
    },
  });

  // Handlers
  const likePostHandler = async () => {
    if (!userId) return;
    await likePostMutation.mutateAsync(postId);
  };

  const dislikesPostHandler = async () => {
    if (!userId) return;
    await dislikePostMutation.mutateAsync(postId);
  };

  const savePostHandler = async () => {
    if (!userId) return;

    if (localIsSaved) {
      await unsavePostMutation.mutateAsync(postId);
    } else {
      await savePostMutation.mutateAsync(postId);
    }
  };

  // Share handler
  const sharePostHandler = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        text: post?.description?.substring(0, 100) + "...",
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleSummarizePost = () => {
    if (!postId) return;
    setSummaryText("");
    summarizeMutation.mutate({
      payload: {
        postId,
        maxWords: 120,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading post...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-transparent text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">Error loading post</p>
          <p className="text-gray-600 dark:text-gray-300">{error.message}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white  hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-neutral-900/40 backdrop-blur-xl border border-white/10 text-white border-b border-white/10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-400 hover:text-white dark:hover:text-white transition-colors"
            >
              <FaArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </button>

            <div className="flex items-center gap-3">
              {userId && (
                <>
                  <button
                    onClick={savePostHandler}
                    disabled={
                      savePostMutation.isPending || unsavePostMutation.isPending
                    }
                    className={`p-2 rounded-full transition-colors ${
                      localIsSaved
                        ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
                        : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                    }`}
                    title={localIsSaved ? "Unsave post" : "Save post"}
                  >
                    {localIsSaved ? (
                      <FaBookmark className="h-4 w-4" />
                    ) : (
                      <FaRegBookmark className="h-4 w-4" />
                    )}
                  </button>

                  <button
                    onClick={sharePostHandler}
                    className="p-2 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Share post"
                  >
                    <FaShare className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
          <article className="bg-neutral-900/40 backdrop-blur-xl border border-white/10 text-white shadow-2xl overflow-hidden">
          {/* Hero Image */}
          {image && (
            <div className="relative h-48 sm:h-56 md:h-64 lg:h-80 xl:h-96 overflow-hidden">
              <img
                src={image}
                alt={post?.title || "Post image"}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          )}

          <div className="p-6 md:p-8">
            {/* Category */}
            {post?.category && (
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm font-medium rounded-full">
                  {post.category?.categoryName || post.category?.name}
                </span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
              {post?.title || "Untitled Post"}
            </h1>

            {/* Author Section */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10 border-white/10">
              <div className="flex items-center gap-4">
                <Link to={`/user/${targetId}`}>
                  <Avatar user={post?.author} size="lg" />
                </Link>
                <div>
                  <Link
                    to={`/user/${targetId}`}
                    className="block font-semibold text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {post?.author?.username || "Anonymous"}
                  </Link>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>
                      {new Date(post?.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <span>•</span>
                    <span>{readingMins} min read</span>
                  </div>
                  {post?.author?.bio && (
                    <p className="text-sm text-gray-400 mt-2 max-w-md">
                      {post.author.bio}
                    </p>
                  )}
                </div>
              </div>

              {targetId && userId && userId !== targetId && (
                <FollowButton
                  targetUserId={targetId}
                  currentUserId={userId}
                  isFollowing={isFollowing}
                  onFollowChange={() => refetchProfile()}
                  size="md"
                  variant="outline"
                />
              )}
            </div>

            <div className="mb-6 rounded-none border border-emerald-500/20 bg-emerald-900/10 backdrop-blur-md p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    AI Summary
                  </h3>
                  <p className="text-sm text-gray-400">
                    Summarize this blog with Gemini.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSummarizePost}
                  disabled={summarizeMutation.isPending}
                  className="px-4 py-2  bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
                >
                  {summarizeMutation.isPending
                    ? "Summarizing..."
                    : "Summarize Post"}
                </button>
              </div>
              {summaryText && (
                <p className="mt-3 text-sm text-gray-300 whitespace-pre-line">
                  {summaryText}
                </p>
              )}
            </div>

            {/* User Profile Info */}
            {post?.author && (
              <div className="mb-6 p-4 bg-white/5 backdrop-blur-md border border-white/10">
                <h3 className="text-sm font-medium text-gray-300 mb-3">
                  About the Author
                </h3>
                <div className="flex items-center gap-4">
                  <Avatar user={post.author} size="md" />
                  <div className="flex-1">
                    <h4 className="font-medium text-white">
                      {post.author.username || "Unknown User"}
                    </h4>
                    {post.author.email && (
                      <p className="text-sm text-gray-400">
                        {post.author.email}
                      </p>
                    )}
                    {post.author.bio && (
                      <p className="text-sm text-gray-400 mt-1">
                        {post.author.bio}
                      </p>
                    )}
                  </div>
                  {targetId && userId && userId !== targetId && (
                    <FollowButton
                      targetUserId={targetId}
                      currentUserId={userId}
                      isFollowing={isFollowing}
                      onFollowChange={() => refetchProfile()}
                      size="sm"
                      variant="default"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Content */}
            <div className="prose prose-lg max-w-none mb-8 dark:prose-invert">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
              >
                {post?.content ||
                  post?.description ||
                  "*No content available.*"}
              </ReactMarkdown>
            </div>

            {/* Tags */}
            {post?.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map((tag, index) => (
                  <Link
                    key={index}
                    to={`/?tag=${encodeURIComponent(tag)}`}
                    className="px-3 py-1 bg-gray-100 bg-white/5 text-gray-300 text-sm rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Engagement Section */}
            <div className="flex items-center justify-between py-6 border-t border-white/10 border-white/10">
              <div className="flex items-center gap-6">
                <button
                  onClick={likePostHandler}
                  disabled={!userId || likePostMutation.isPending}
                  className={`flex items-center gap-2 px-4 py-2  transition-colors ${
                    post?.likes?.includes(userId)
                      ? "bg-green-50 text-green-600 hover:bg-green-100"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                  } ${!userId ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <FaThumbsUp className="h-4 w-4" />
                  <span>{post?.likes?.length || 0}</span>
                </button>

                <button
                  onClick={dislikesPostHandler}
                  disabled={!userId || dislikePostMutation.isPending}
                  className={`flex items-center gap-2 px-4 py-2  transition-colors ${
                    post?.dislikes?.includes(userId)
                      ? "bg-red-50 text-red-600 hover:bg-red-100"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                  } ${!userId ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <FaThumbsDown className="h-4 w-4" />
                  <span>{post?.dislikes?.length || 0}</span>
                </button>

                <div className="flex items-center gap-2 text-gray-400">
                  <FaEye className="h-4 w-4" />
                  <span>{post?.viewers?.length || 0}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-400">
                  <FaComment className="h-4 w-4" />
                  <span>{post?.comments?.length || 0}</span>
                </div>

                {/* Analytics Button for Post Author */}
                {userId && targetId && userId === targetId && (
                  <AdvancedAnalyticsButton
                    post={post}
                    userPlan={profileData?.user?.plan}
                    isAuthor={true}
                  />
                )}
              </div>

              {/* Social Share */}
              <div className="flex items-center gap-3">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post?.title || "")}&url=${window.location.href}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50  transition-colors"
                  title="Share on Twitter"
                >
                  <FaTwitter className="h-4 w-4" />
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50  transition-colors"
                  title="Share on Facebook"
                >
                  <FaFacebook className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </article>

        {/* Comments Section */}
        <div className="mt-8">
          <CommentList
            comments={post?.comments || []}
            currentUserId={userId}
            postId={postId}
            onCommentUpdate={refetchPost}
          />
        </div>
      </div>
    </div>
  );
};

export default PostDetails;
