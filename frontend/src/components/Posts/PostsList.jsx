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
} from "../../APIServices/posts/postsAPI";
import AdvancedAnalyticsButton from "../Analytics/AdvancedAnalyticsButton";
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
    <div className="min-h-screen bg-white dark:bg-gray-900 w-full overflow-x-hidden">
      {/* Search Section - Improved Mobile Layout */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-3 sm:py-4 lg:py-6">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex flex-col space-y-3 sm:space-y-4">
            {/* Website Slogan */}
            <div className="text-center py-4">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Share Knowledge, Inspire Growth
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Discover trending content and explore the most popular topics in
                our community
              </p>
            </div>

            {/* Popular Tags Section */}
            {!popularTagsLoading &&
              !popularTagsError &&
              popularTagsFromAPI?.popularTags &&
              popularTagsFromAPI.popularTags.length > 0 && (
                <section
                  aria-label="Popular Tags"
                  className="popular-tags-section"
                >
                  <div className="text-center mb-4">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      🏷️ Most Popular Tags
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Explore the top {popularTagsFromAPI.popularTags.length}{" "}
                      trending topics
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 sm:gap-3 max-w-4xl mx-auto">
                    {popularTagsFromAPI.popularTags.map((tagData) => (
                      <button
                        key={tagData._id}
                        onClick={() => handleTagSelect(tagData._id)}
                        className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                          selectedTags.includes(tagData._id)
                            ? "bg-blue-600 text-white shadow-lg scale-105"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-800 hover:text-blue-700 dark:hover:text-blue-300 hover:scale-105"
                        }`}
                        title={`${tagData.count} posts tagged with #${tagData._id}`}
                      >
                        <span className="mr-1">#{tagData._id}</span>
                        <span className="bg-white dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">
                          {tagData.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              )}

            {/* Trending carousel (paged: 2 on mobile, 4 on larger) */}
            {!trendingLoading && !trendingError && totalTrending > 0 && (
              <section
                aria-label="Trending"
                className="trending-carousel-container"
              >
                <div className="flex items-center justify-between mb-2 px-1">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    Trending
                  </h2>
                </div>
                <div className="w-full relative">
                  {/* Left/Right overlay buttons */}
                  <button
                    type="button"
                    onClick={pagePrev}
                    className="trending-nav-btn absolute -left-2 sm:-left-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-full text-gray-700 dark:text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500"
                    aria-label="Previous"
                    disabled={!canPage}
                  >
                    <FaChevronLeft />
                  </button>
                  <button
                    type="button"
                    onClick={pageNext}
                    className="trending-nav-btn absolute -right-2 sm:-right-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-full text-gray-700 dark:text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500"
                    aria-label="Next"
                    disabled={!canPage}
                  >
                    <FaChevronRight />
                  </button>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    {visibleTrending.map((post, idx) => {
                      const imageUrl =
                        typeof post.image === "string"
                          ? post.image
                          : post.image?.url || "";
                      const rank = (trendingIndex + idx) % totalTrending;
                      return (
                        <Link
                          to={`/posts/${post._id}`}
                          key={`${post._id}-${rank}`}
                          className="trending-carousel-item"
                          title={post.title || "Post"}
                        >
                          <div className="relative w-full h-[124px] sm:h-[146px] overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-800">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={post.title || "Post image"}
                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                No image
                              </div>
                            )}
                            {rank < 3 && (
                              <span className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full bg-red-600 text-white shadow">
                                #{rank + 1}
                              </span>
                            )}
                          </div>
                          <div className="mt-2">
                            <h3 className="text-sm font-semibold line-clamp-2 text-gray-900 dark:text-gray-100">
                              {truncateText(post.title || "Untitled", 70)}
                            </h3>
                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <FaEye />
                                {post.viewers?.length || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <FaHeart className="text-red-500" />
                                {post.likes?.length || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <FaComment className="text-green-600" />
                                {post.comments?.length || 0}
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {/* Categories - Improved Mobile Layout */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4 justify-center items-center">
              {/* Categories Dropdown - Better Mobile Positioning */}
              <div className="relative w-full sm:w-auto">
                <button
                  onClick={() =>
                    setShowCategorySuggestions(!showCategorySuggestions)
                  }
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center sm:justify-start space-x-2 text-sm"
                >
                  <FaFilter className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Categories</span>
                  <svg
                    className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${showCategorySuggestions ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {showCategorySuggestions && (
                  <div className="absolute top-full left-0 mt-2 w-full sm:w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-60 overflow-y-auto">
                    {categoriesLoading ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        Loading categories...
                      </div>
                    ) : categoriesError ? (
                      <div className="p-4 text-center text-red-500">
                        Error loading categories
                      </div>
                    ) : categoriesData?.categories &&
                      categoriesData.categories.length > 0 ? (
                      <>
                        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                          <button
                            onClick={handleClearCategories}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              selectedCategory === ""
                                ? "bg-green-500 text-white"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                          >
                            All Categories
                          </button>
                        </div>
                        {categoriesData.categories.map((category) => (
                          <button
                            key={category._id}
                            onClick={() => handleCategorySelect(category)}
                            className={`w-full text-left px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${
                              selectedCategory === category.categoryName
                                ? "bg-green-500 text-white"
                                : "text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {category.categoryName}
                          </button>
                        ))}
                      </>
                    ) : (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        No categories found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Selected Tags Display */}
            {(selectedCategory || selectedTags.length > 0) && (
              <div className="flex flex-wrap justify-center gap-2 sm:gap-2">
                {/* Selected Category */}
                {selectedCategory && (
                  <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                    📂 {selectedCategory}
                    <button
                      onClick={() => setSelectedCategory("")}
                      className="ml-1 sm:ml-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                    >
                      <FaTimes className="h-3 w-3" />
                    </button>
                  </span>
                )}

                {/* Selected Tags */}
                {selectedTags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                  >
                    #{tag}
                    <button
                      onClick={() => handleTagRemove(tag)}
                      className="ml-1 sm:ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                    >
                      <FaTimes className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Only Latest Stories Section */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Latest Stories Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                Latest Stories
              </h2>
              <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-400">
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
                  <div className="mb-4 bg-gray-200 dark:bg-gray-700 rounded-lg h-48"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </article>
              ))
            ) : allPosts.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  No posts found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Start creating content to see it here!
                </p>
              </div>
            ) : (
              allPosts.map((post) => (
                <article
                  key={post._id}
                  className="group bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  {/* Post Image */}
                  <div className="relative overflow-hidden">
                    {post.image ? (
                      <img
                        src={post.image.url || post.image.path || post.image}
                        alt={post.title}
                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
                        <span className="text-4xl">📝</span>
                      </div>
                    )}
                  </div>

                  {/* Post Content */}
                  <div className="p-4 space-y-3">
                    {/* Title */}
                    <Link to={`/posts/${post._id}`}>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors line-clamp-2 leading-tight">
                        {post.title}
                      </h3>
                    </Link>

                    {/* Excerpt */}
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-3">
                      {truncateText(
                        post.excerpt || post.description || post.content || "",
                        120,
                      )}
                    </p>

                    {/* Author & Meta */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center space-x-3">
                        <Link
                          to={`/user/${post.author?._id}`}
                          className="flex-shrink-0"
                        >
                          {post.author?.profilePicture ? (
                            <img
                              src={
                                post.author.profilePicture.url ||
                                post.author.profilePicture.path ||
                                post.author.profilePicture
                              }
                              alt={post.author.name || post.author.username}
                              className="w-8 h-8 rounded-full object-cover hover:ring-2 hover:ring-blue-500 transition-all"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center hover:ring-2 hover:ring-blue-500 transition-all">
                              <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                                {(
                                  post.author?.name ||
                                  post.author?.username ||
                                  "U"
                                )
                                  .charAt(0)
                                  .toUpperCase()}
                              </span>
                            </div>
                          )}
                        </Link>
                        <div>
                          <Link
                            to={`/user/${post.author?._id}`}
                            className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            {post.author?.name ||
                              post.author?.username ||
                              "Anonymous"}
                          </Link>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(post.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Save Button - Fixed Responsiveness */}
                      <button
                        onClick={() => handleSavePost(post._id)}
                        className={`text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full flex-shrink-0 ${
                          savedPosts.has(post._id)
                            ? "bg-green-500 text-white"
                            : ""
                        }`}
                        aria-label="Save post"
                      >
                        <FaRegBookmark className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center space-x-1">
                          <FaEye className="h-3 w-3" />
                          <span>{post.viewsCount || 0}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <FaHeart className="h-3 w-3" />
                          <span>{post.likesCount || 0}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <FaComment className="h-3 w-3" />
                          <span>{post.commentsCount || 0}</span>
                        </span>
                      </div>

                      {/* Advanced Analytics Button for Authors */}
                      {currentUserId && post.author?._id === currentUserId && (
                        <AdvancedAnalyticsButton
                          post={post}
                          userPlan={userPlan}
                          isAuthor={true}
                        />
                      )}
                    </div>
                  </div>

                  {/* Category and Tags - Outside the card */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {post.category && (
                      <button
                        onClick={() => handleCategorySelect(post.category)}
                        className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium rounded-full hover:bg-green-200 dark:hover:bg-green-800 transition-colors cursor-pointer"
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
                              : "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800"
                          }`}
                        >
                          #{tag}
                        </button>
                      ))}
                  </div>
                </article>
              ))
            )}
          </div>

          {/* Infinite scroll load status */}
          <div className="text-center mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {allPosts.length} stories
              {firstPage?.totalPosts ? ` of ${firstPage.totalPosts}` : ""}
            </p>
            {isFetchingNextPage && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Loading more stories...
              </p>
            )}
            {!hasNextPage && allPosts.length > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
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
