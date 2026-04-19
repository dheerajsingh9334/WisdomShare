import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import {
  FaEye,
  FaHeart,
  FaComment,
  FaRegBookmark,
  FaTimes,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { fetchAllPosts } from "../../APIServices/posts/postsAPI";
import { fetchCategoriesAPI } from "../../APIServices/category/categoryAPI";
import { truncateText } from "../../utils/responsiveUtils";
import {
  fetchTrendingPostsAPI,
  getPopularTagsAPI,
  likePostAPI,
} from "../../APIServices/posts/postsAPI";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import AdvancedAnalyticsButton from "../Analytics/AdvancedAnalyticsButton";
import { PostCard } from "../ui/post-card";
import { HeroSection } from "../ui/hero-odyssey";
import "./postCss.css";

const PostsList = () => {
  const [searchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(""); // Category name for display
  const [selectedCategoryId, setSelectedCategoryId] = useState(""); // Category ID for API
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  const [savedPosts, setSavedPosts] = useState(new Set()); // Track saved posts
  const [trendingIndex, setTrendingIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4); // 2 on mobile, 4 (two pairs) on larger
  const loadMoreRef = useRef(null);

  // Get current user from Redux
  const { userAuth } = useSelector((state) => state.auth);
  const currentUserId = userAuth?.userInfo?.data?.user?._id;
  const userPlan = userAuth?.userInfo?.data?.user?.plan || "Free";

  // Handle URL parameters for tag filtering
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tags = urlParams.get("tags");
    if (tags) {
      setSelectedTags(tags.split(",").filter(Boolean));
    }
  }, []);

  const postsLimit = 20;

  // Fetch posts with cursor-based pagination for infinite scroll
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: [
      "posts",
      searchTerm,
      selectedCategoryId,
      selectedTags,
      postsLimit,
    ],
    queryFn: async ({ pageParam = null }) => {
      const params = {
        limit: postsLimit,
      };

      if (pageParam) {
        params.cursor = pageParam;
      }

      if (searchTerm && searchTerm.trim()) {
        params.q = searchTerm.trim();
      }

      if (selectedCategoryId) {
        params.category = selectedCategoryId;
      }

      if (selectedTags.length > 0) {
        params.tags = selectedTags.join(",");
      }

      return fetchAllPosts(params);
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage?.hasMore) return undefined;
      return lastPage?.nextCursor || undefined;
    },
    initialPageParam: null,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const allPosts =
    data?.pages?.flatMap(
      (pageData) => pageData?.data || pageData?.posts || [],
    ) || [];
  const firstPage = data?.pages?.[0] || null;

  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: likePostAPI,
    onMutate: async (postId) => {
      // Optimistically update the cache
      queryClient.setQueriesData({ queryKey: ["posts"] }, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => {
            const items = page.data || page.posts || [];
            const mappedItems = items.map((p) => {
              if (p._id === postId) {
                const isCurrentlyLiked = p.likes?.includes(currentUserId);
                return {
                  ...p,
                  likes: isCurrentlyLiked
                    ? p.likes.filter((id) => id !== currentUserId)
                    : [...(p.likes || []), currentUserId],
                  likesCount: isCurrentlyLiked
                    ? Math.max(0, (p.likesCount || 0) - 1)
                    : (p.likesCount || 0) + 1,
                };
              }
              return p;
            });
            // return with exactly the key it came with
            return page.data ? { ...page, data: mappedItems } : { ...page, posts: mappedItems };
          }),
        };
      });
    },
    onSettled: () => {
      // Invalidate on settle to ensure consistency without breaking UI instantly
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const handleLikePost = (postId) => {
    if (!currentUserId) return;
    likeMutation.mutate(postId);
  };

  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Fetch trending posts for the carousel
  const {
    data: trendingData,
    isLoading: trendingLoading,
    error: trendingError,
  } = useQuery({
    queryKey: ["trending-inline"],
    queryFn: fetchTrendingPostsAPI,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch popular tags from backend
  const {
    data: popularTagsFromAPI,
    isLoading: popularTagsLoading,
    error: popularTagsError,
  } = useQuery({
    queryKey: ["popular-tags-api"],
    queryFn: () => getPopularTagsAPI(20), // Get top 20 tags
    staleTime: 5 * 60 * 1000,
  });

  // Determine how many trending items to show per view (2 on mobile, 4 on larger)
  useEffect(() => {
    const updateItemsPerView = () => {
      const width = window.innerWidth;
      const perView = width < 640 ? 2 : 4; // 2 on small, 4 (two pairs) otherwise
      setItemsPerView(perView);
      setTrendingIndex(0); // reset to start when layout changes
    };
    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

  const totalTrending = trendingData?.posts?.length || 0;
  const canPage = totalTrending > itemsPerView;
  const pageNext = () => {
    if (!totalTrending) return;
    setTrendingIndex((prev) => (prev + itemsPerView) % totalTrending);
  };
  const pagePrev = () => {
    if (!totalTrending) return;
    // Proper modulo wrap for negative
    const next =
      (((trendingIndex - itemsPerView) % totalTrending) + totalTrending) %
      totalTrending;
    setTrendingIndex(next);
  };

  // Compute visible slice with wrap-around to always show itemsPerView cards when possible
  const visibleTrending = (() => {
    if (!totalTrending) return [];
    if (totalTrending <= itemsPerView) return trendingData.posts;
    const end = trendingIndex + itemsPerView;
    if (end <= totalTrending) {
      return trendingData.posts.slice(trendingIndex, end);
    }
    // wrap
    const first = trendingData.posts.slice(trendingIndex);
    const second = trendingData.posts.slice(0, end - totalTrending);
    return [...first, ...second];
  })();

  // Debug logging
  console.log("Posts data:", data);
  console.log("Posts error:", error);
  console.log("Posts loading:", isLoading);

  // Fetch categories for the sidebar
  const {
    data: categoriesData,
    error: categoriesError,
    isLoading: categoriesLoading,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        console.log("🔍 Fetching categories...");
        const response = await fetchCategoriesAPI();
        console.log("📂 Categories response:", response);

        // Check if response has the expected structure
        if (response && response.categories) {
          console.log("✅ Categories found:", response.categories.length);
          return response;
        } else {
          console.warn(
            "⚠️ Unexpected categories response structure:",
            response,
          );
          return { categories: [] };
        }
      } catch (error) {
        console.error("❌ Error fetching categories:", error);
        return { categories: [] };
      }
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle category selection
  const handleCategorySelect = (category) => {
    console.log("🏷️ Category selected:", category);
    if (selectedCategory === category.categoryName) {
      // If same category is clicked, clear it
      setSelectedCategory("");
      setSelectedCategoryId("");
    } else {
      // Set new category
      setSelectedCategory(category.categoryName);
      setSelectedCategoryId(category._id);
    }
    setShowCategorySuggestions(false);
  };

  // Handle tag selection
  const handleTagSelect = (tag) => {
    console.log("🏷️ Tag selected:", tag);
    setSelectedTags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((t) => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  // Handle tag removal
  const handleTagRemove = (tagToRemove) => {
    console.log("🗑️ Tag removed:", tagToRemove);
    setSelectedTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  // Handle clear all categories
  const handleClearCategories = () => {
    console.log("🗑️ Clearing all categories");
    setSelectedCategory("");
    setSelectedCategoryId("");
    setShowCategorySuggestions(false);
  };

  // Handle save post
  const handleSavePost = (postId) => {
    setSavedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
        // Remove from localStorage
        const saved = JSON.parse(localStorage.getItem("savedPosts") || "[]");
        const filtered = saved.filter((id) => id !== postId);
        localStorage.setItem("savedPosts", JSON.stringify(filtered));
      } else {
        newSet.add(postId);
        // Add to localStorage
        const saved = JSON.parse(localStorage.getItem("savedPosts") || "[]");
        saved.push(postId);
        localStorage.setItem("savedPosts", JSON.stringify(saved));
      }
      return newSet;
    });
  };

  // Load saved posts from localStorage on component mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("savedPosts");
      if (saved) {
        const parsed = JSON.parse(saved);
        setSavedPosts(new Set(parsed));
        console.log("📚 Loaded saved posts from storage:", parsed.length);
      }
    } catch (error) {
      console.error("❌ Error loading saved posts from storage:", error);
      localStorage.removeItem("savedPosts");
    }
  }, []);

  const loadingSkeletonCount = 20;

  return (
    <div className="min-h-screen bg-black text-white w-full overflow-x-hidden">
      <HeroSection />

      {/* Main Content - Only Latest Stories Section */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Latest Stories Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Latest Stories
              </h2>
              <p className="text-sm sm:text-lg text-gray-400">
                {firstPage?.totalPosts
                  ? `${firstPage.totalPosts} stories found`
                  : "Discover amazing content from our community"}
              </p>
            </div>
          </div>

          {/* Posts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: loadingSkeletonCount }).map((_, index) => (
                <article key={index} className="animate-pulse">
                  <div className="mb-4 bg-gray-200 bg-white/5  h-48"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 bg-white/5  w-1/4"></div>
                    <div className="h-6 bg-gray-200 bg-white/5 "></div>
                    <div className="h-4 bg-gray-200 bg-white/5  w-3/4"></div>
                    <div className="h-4 bg-gray-200 bg-white/5  w-1/2"></div>
                  </div>
                </article>
              ))
            ) : allPosts.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  No posts found
                </h3>
                <p className="text-gray-400">
                  Start creating content to see it here!
                </p>
              </div>
            ) : (
              allPosts.map((post) => (
                <div key={post._id} className="flex flex-col h-full -[2rem] border border-blue-500/10 bg-[#1e293b]/30 p-2 shadow-2xl overflow-hidden hover:border-blue-500/30 transition-all duration-300">
                  <PostCard 
                    post={post} 
                    isLiked={post.likes?.includes(currentUserId)}
                    onLike={() => handleLikePost(post._id)}
                    isSaved={savedPosts.has(post._id)}
                    onSave={() => handleSavePost(post._id)}
                  />
                  {/* Category and Tags */}
                  <div className="mt-2 px-6 pb-4 flex flex-wrap items-center gap-2">
                    {post.category && (
                      <button
                        onClick={() => handleCategorySelect(post.category)}
                        className="px-2 py-1 bg-green-900 text-green-200 text-xs font-medium rounded-full hover:bg-green-800 transition-colors cursor-pointer"
                      >
                        {post.category.categoryName ||
                          post.category.name ||
                          "Uncategorized"}
                      </button>
                    )}
                    {post.tags &&
                      post.tags.slice(0, 3).map((tag, index) => (
                        <button
                          key={index}
                          onClick={() => handleTagSelect(tag)}
                          className={`px-2 py-1 text-xs font-medium rounded-full transition-colors cursor-pointer ${
                            selectedTags.includes(tag)
                              ? "bg-blue-500 text-white"
                              : "bg-blue-900 text-blue-200 hover:bg-blue-800"
                          }`}
                        >
                          #{tag}
                        </button>
                      ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Infinite scroll load status */}
          <div className="text-center mt-6 pt-6 border-t border-white/10 border-white/10">
            <p className="text-sm text-gray-400">
              Showing {allPosts.length} stories
              {firstPage?.totalPosts ? ` of ${firstPage.totalPosts}` : ""}
            </p>
            {isFetchingNextPage && (
              <p className="text-sm text-gray-400 mt-2">
                Loading more stories...
              </p>
            )}
            {!hasNextPage && allPosts.length > 0 && (
              <p className="text-sm text-gray-400 mt-2">
                You have reached the end.
              </p>
            )}
            <div ref={loadMoreRef} className="h-2 w-full" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {showCategorySuggestions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowCategorySuggestions(false);
          }}
        />
      )}
    </div>
  );
};

export default PostsList;
