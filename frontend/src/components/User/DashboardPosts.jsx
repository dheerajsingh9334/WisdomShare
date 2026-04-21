import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FaEdit, FaEye, FaTrash, FaCalendar, FaClock, FaCheck, FaTimes, FaPlus, FaFilter } from "react-icons/fa";
import { getUserDraftsAPI, getUserScheduledPostsAPI, getUserPublishedPostsAPI, updatePostStatusAPI, deletePostAPI } from "../../APIServices/posts/postsAPI";
import AlertMessage from "../Alert/AlertMessage";
import { useSelector } from "react-redux";

const DashboardPosts = () => {
  const [activeTab, setActiveTab] = useState("published");
  const [page, setPage] = useState(1);
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const queryClient = useQueryClient();
  
  // Get auth state
  const { userAuth } = useSelector((state) => state.auth);
  
  // Debug authentication state
  console.log("🔐 Auth Debug:", { userAuth });
  console.log("🔐 User ID:", userAuth?._id);
  console.log("🔐 Is Authenticated:", !!userAuth);

  // Fetch user's published posts
  const { data: publishedPosts, isLoading: publishedLoading, error: publishedError } = useQuery({
    queryKey: ["user-published-posts", page],
    queryFn: () => getUserPublishedPostsAPI(page, 10),
    enabled: !!userAuth && !!userAuth._id,
    onError: (error) => {
      console.error("❌ Published posts API error:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
    },
    retry: 1,
  });

  // Fetch user's drafts
  const { data: draftsData, isLoading: draftsLoading, error: draftsError } = useQuery({
    queryKey: ["user-drafts", page],
    queryFn: () => getUserDraftsAPI(page, 10),
    enabled: !!userAuth && !!userAuth._id && activeTab === "drafts",
    onError: (error) => {
      console.error("❌ Drafts API error:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
    },
    retry: 1,
  });

  // Fetch user's scheduled posts
  const { data: scheduledData, isLoading: scheduledLoading, error: scheduledError } = useQuery({
    queryKey: ["user-scheduled-posts", page],
    queryFn: () => getUserScheduledPostsAPI(page, 10),
    enabled: !!userAuth && !!userAuth._id,
    onError: (error) => {
      console.error("❌ Scheduled posts API error:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
    },
    retry: 1,
  });

  // Function to get current data based on active tab
  const getCurrentData = useCallback(() => {
    switch (activeTab) {
      case "published":
        return {
          posts: publishedPosts?.posts || [],
          totalPosts: publishedPosts?.totalPosts || 0,
          isLoading: publishedLoading,
        };
      case "drafts":
        return {
          posts: draftsData?.drafts || [],
          totalPosts: draftsData?.totalDrafts || 0,
          isLoading: draftsLoading,
        };
      case "scheduled":
        return {
          posts: scheduledData?.scheduledPosts || [],
          totalPosts: scheduledData?.totalScheduled || 0,
          isLoading: scheduledLoading,
        };
      default:
        return { posts: [], totalPosts: 0, isLoading: false };
    }
  }, [activeTab, publishedPosts, draftsData, scheduledData, publishedLoading, draftsLoading, scheduledLoading]);

  // Extract tags from posts for filtering
  const extractTags = (posts) => {
    const allTags = [];
    posts.forEach(post => {
      if (post.tags && Array.isArray(post.tags)) {
        allTags.push(...post.tags);
      }
    });
    return [...new Set(allTags)].sort();
  };

  // Update available tags when posts change
  useEffect(() => {
    const currentPosts = getCurrentData().posts;
    const tags = extractTags(currentPosts);
    setAvailableTags(tags);
  }, [getCurrentData]);  // Debug logging
  console.log("Dashboard Posts Debug:");
  console.log("Published posts:", publishedPosts);
  console.log("Published error:", publishedError);
  console.log("Drafts:", draftsData);
  console.log("Drafts error:", draftsError);
  console.log("Scheduled:", scheduledData);
  console.log("Scheduled error:", scheduledError);

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: ({ postId, status, scheduledFor }) => updatePostStatusAPI(postId, status, scheduledFor),
    onSuccess: () => {
      queryClient.invalidateQueries(["user-published-posts"]);
      queryClient.invalidateQueries(["user-drafts"]);
      queryClient.invalidateQueries(["user-scheduled-posts"]);
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: deletePostAPI,
    onSuccess: () => {
      queryClient.invalidateQueries(["user-published-posts"]);
      queryClient.invalidateQueries(["user-drafts"]);
      queryClient.invalidateQueries(["user-scheduled-posts"]);
    },
  });

  const handleStatusUpdate = async (postId, newStatus, scheduledFor = null) => {
    try {
      console.log("🔄 Updating post status:", { postId, newStatus, scheduledFor });
      console.log("🔐 Current user ID:", userAuth?._id);
      
      const result = await updateStatusMutation.mutateAsync({ postId, status: newStatus, scheduledFor });
      console.log("✅ Status update successful:", result);
    } catch (error) {
      console.error("❌ Error updating post status:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      // Show user-friendly error message
      if (error.response?.status === 403) {
        alert("You can only update your own posts. Please check if you're logged in with the correct account.");
      } else {
        alert(`Failed to update post status: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      try {
        await deletePostMutation.mutateAsync(postId);
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  const { posts, totalPosts, isLoading } = getCurrentData();

  // Filter posts by selected tags
  const filteredPosts = selectedTags.length > 0 
    ? posts.filter(post => post.tags && post.tags.some(tag => selectedTags.includes(tag)))
    : posts;

  const getStatusBadge = (status) => {
    switch (status) {
      case "published":
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Published</span>;
      case "draft":
        return <span className="px-2 py-1 bg-gray-100 text-gray-100 text-xs rounded-full">Draft</span>;
      case "scheduled":
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center gap-1">
            <FaClock className="w-3 h-3" />
            Scheduled
          </span>
        );
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-100 text-xs rounded-full">{status}</span>;
    }
  };

  const getScheduledDate = (scheduledFor) => {
    if (!scheduledFor) return null;
    return new Date(scheduledFor).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const clearTagFilter = () => {
    setSelectedTags([]);
  };

  // Function to strip HTML tags from description
  const stripHtmlTags = (html) => {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, '');
  };

  return (
    <div className="min-h-screen bg-transparent text-white">
      {/* Header - Responsive layout */}
      <div className="bg-neutral-900/40 backdrop-blur-xl border border-white/10 text-white border-b border-white/10">
        <div className="max-w-none mx-auto px-3 sm:px-4 md:px-6 lg:px-4 xl:px-6 py-6 sm:py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">My Posts</h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">Manage your published posts, drafts, and scheduled content</p>
          </div>
          <Link
            to="/dashboard/create-post"
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white  hover:bg-green-700 transition-colors text-sm sm:text-base shrink-0"
          >
            <FaPlus className="w-4 h-4" /> New Post
          </Link>
        </div>
      </div>

      <div className="max-w-none mx-auto px-3 sm:px-4 md:px-6 lg:px-4 xl:px-6 py-6 sm:py-8">
        {/* Status Messages */}
        {updateStatusMutation.isSuccess && (
          <AlertMessage type="success" message="Post status updated successfully!" />
        )}
        {updateStatusMutation.isError && (
          <AlertMessage type="error" message={updateStatusMutation.error?.response?.data?.message || "Failed to update post status"} />
        )}
        {deletePostMutation.isSuccess && (
          <AlertMessage type="success" message="Post deleted successfully!" />
        )}
        {deletePostMutation.isError && (
          <AlertMessage type="error" message={deletePostMutation.error?.response?.data?.message || "Failed to delete post"} />
        )}

        {/* API Error Messages */}
        {publishedError && (
          <AlertMessage 
            type="error" 
            message={`Failed to load published posts: ${publishedError.response?.data?.message || publishedError.message}`} 
          />
        )}
        {draftsError && (
          <AlertMessage 
            type="error" 
            message={`Failed to load drafts: ${draftsError.response?.data?.message || draftsError.message}`} 
          />
        )}
        {scheduledError && (
          <AlertMessage 
            type="error" 
            message={`Failed to load scheduled posts: ${scheduledError.response?.data?.message || scheduledError.message}`} 
          />
        )}

        {/* Tabs - Responsive design */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex space-x-1 bg-gray-100 bg-white/5  p-1 flex-1">
            {[
              { id: "published", label: "Published", count: publishedPosts?.totalPosts || 0 },
              { id: "drafts", label: "Drafts", count: draftsData?.totalDrafts || 0 },
              { id: "scheduled", label: "Scheduled", count: scheduledData?.totalScheduled || 0 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setPage(1);
                  setSelectedTags([]); // Clear tag filter when switching tabs
                }}
                className={`flex-1 py-2 px-2 sm:px-4  text-xs sm:text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-neutral-900/60 backdrop-blur-xl border border-white/20 text-white shadow-lg"
                    : "text-gray-400 hover:text-white dark:hover:text-white"
                }`}
              >
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.charAt(0)}</span>
                <span className="ml-1">({tab.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tag Filter */}
        {availableTags.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <FaFilter className="text-gray-500" />
              <span className="text-sm font-medium text-gray-300">Filter by tags:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTags(selectedTags.includes(tag) ? selectedTags.filter(t => t !== tag) : [...selectedTags, tag])}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    selectedTags.includes(tag)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 bg-white/5 text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  #{tag}
                </button>
              ))}
              {selectedTags.length > 0 && (
                <button
                  onClick={clearTagFilter}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
                >
                  Clear Filter
                </button>
              )}
            </div>
            {selectedTags.length > 0 && (
              <p className="text-sm text-gray-400 mt-2">
                Showing posts tagged with <span className="font-medium">#{selectedTags.join(", ")}</span> ({filteredPosts.length} posts)
              </p>
            )}
          </div>
        )}

        {/* Posts List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading posts...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">
              {selectedTags.length > 0 ? "🏷️" : activeTab === "published" ? "📝" : activeTab === "drafts" ? "📄" : "📅"}
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {selectedTags.length > 0 
                ? `No posts found with tags #${selectedTags.join(", ")}`
                : `No ${activeTab} posts yet`
              }
            </h3>
            <p className="text-gray-400 mb-6">
              {selectedTags.length > 0 
                ? "Try selecting a different tag or clear the filter to see all posts."
                : activeTab === "published" 
                ? "Start writing to see your published posts here."
                : activeTab === "drafts"
                ? "Save your work as drafts to continue later."
                : "Schedule posts to be published automatically."
              }
            </p>
            {!selectedTags.length > 0 && (
              <Link
                to="/dashboard/create-post"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white  hover:bg-blue-700 transition-colors"
              >
                Create New Post
              </Link>
            )}
            {selectedTags.length > 0 && (
              <button
                onClick={clearTagFilter}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white  hover:bg-gray-700 transition-colors"
              >
                Clear Filter
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredPosts.map((post) => (
              <div
                key={post._id}
                className="bg-neutral-900/40 backdrop-blur-xl border border-white/10 text-white p-4 sm:p-6 hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Post Image */}
                    {post.image && (
                      <div className="mb-3">
                        <img 
                          src={typeof post.image === 'string' ? post.image : post.image.url || post.image.path || post.image} 
                          alt={post.title || "Post image"}
                          className="w-full h-32 sm:h-36 md:h-40 lg:h-48 object-cover "
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        {post.title || "Untitled Post"}
                      </h3>
                      {getStatusBadge(post.status)}
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                      {stripHtmlTags(post.description)}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>{post.category?.categoryName}</span>
                      <span>•</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      {post.scheduledFor && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <FaCalendar className="w-3 h-3" />
                            {getScheduledDate(post.scheduledFor)}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {post.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className={`px-2 py-1 text-xs rounded-full cursor-pointer transition-colors ${
                              selectedTags.includes(tag)
                                ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                                : "bg-gray-100 bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                            }`}
                            onClick={() => setSelectedTags(selectedTags.includes(tag) ? selectedTags.filter(t => t !== tag) : [...selectedTags, tag])}
                            title={`Click to filter by #${tag}`}
                          >
                            #{tag}
                          </span>
                        ))}
                        {post.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 bg-white/5 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                            +{post.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 ml-2 sm:ml-4">
                    {/* Action buttons - responsive layout */}
                    <div className="flex items-center gap-1 sm:gap-2">
                    {/* View Post */}
                    <Link
                      to={`/posts/${post._id}`}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30  transition-colors"
                      title="View post"
                    >
                      <FaEye className="w-4 h-4" />
                    </Link>

                    {/* Edit Post */}
                    <Link
                      to={`/edit-post/${post._id}`}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30  transition-colors"
                      title="Edit post"
                    >
                      <FaEdit className="w-4 h-4" />
                    </Link>

                    {/* Status Actions */}
                    {post.status === "draft" && (
                      <button
                        onClick={() => {
                          console.log("📝 Post details for status update:", {
                            postId: post._id,
                            postAuthor: post.author,
                            currentUser: userAuth?._id,
                            isOwner: post.author === userAuth?._id
                          });
                          handleStatusUpdate(post._id, "published");
                        }}
                        disabled={updateStatusMutation.isPending}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30  transition-colors"
                        title="Publish post"
                      >
                        <FaCheck className="w-4 h-4" />
                      </button>
                    )}

                    {post.status === "scheduled" && (
                      <button
                        onClick={() => handleStatusUpdate(post._id, "draft")}
                        disabled={updateStatusMutation.isPending}
                        className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/30  transition-colors"
                        title="Move to drafts"
                      >
                        <FaTimes className="w-4 h-4" />
                      </button>
                    )}

                    {/* Delete Post */}
                    <button
                      onClick={() => handleDeletePost(post._id)}
                      disabled={deletePostMutation.isPending}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30  transition-colors"
                      title="Delete post"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPosts > 10 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, Math.ceil(totalPosts / 10)) }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-10 h-10  font-medium transition-colors ${
                    pageNum === page
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <button
              disabled={page * 10 >= totalPosts}
              onClick={() => setPage(page + 1)}
              className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPosts;
