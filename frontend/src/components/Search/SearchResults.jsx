import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { FaSearch, FaEye, FaHeart, FaComment } from "react-icons/fa";
import { semanticSearchDirectAPI } from "../../APIServices/ai/aiAPI";
import truncateString from "../../utils/truncateString";

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("all");
  const query = searchParams.get("q") || "";
  const type = searchParams.get("type") || "all";
  const page = parseInt(searchParams.get("page") || "1");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["search", { q: query, type, page }],
    queryFn: () => semanticSearchDirectAPI({ query, page, limit: 12 }),
    enabled: query.length >= 2,
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ q: query, type: tab, page: "1" });
  };

  const handlePageChange = (newPage) => {
    setSearchParams({ q: query, type, page: newPage.toString() });
  };

  if (!query || query.length < 2) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <FaSearch className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            Enter a search term
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Search for posts, users, or content across the platform.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Searching...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">
            Error: {error?.message}
          </p>
        </div>
      </div>
    );
  }

  const results = {
    posts: data?.data?.results || [],
    users: [],
  };
  const totalPosts = data?.data?.totalCount || results.posts.length || 0;
  const totalUsers = 0;
  const totalResults = totalPosts;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Search Results for "{query}"
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Found {totalResults} results
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTabChange("all")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "all"
                ? "border-green-500 text-green-600 dark:text-green-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            All ({totalResults})
          </button>
          <button
            onClick={() => handleTabChange("posts")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "posts"
                ? "border-green-500 text-green-600 dark:text-green-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Posts ({totalPosts})
          </button>
        </nav>
      </div>

      {/* Results */}
      <div className="space-y-8">
        {/* Posts Results */}
        {(activeTab === "all" || activeTab === "posts") &&
          results.posts &&
          results.posts.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Posts matched by meaning
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {results.posts.map((post) => (
                  <article
                    key={post._id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
                  >
                    {post.image && (
                      <div className="aspect-w-16 aspect-h-9">
                        <img
                          src={
                            typeof post.image === "string"
                              ? post.image
                              : post.image.url
                          }
                          alt={post.title}
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center mb-2">
                        {post.author?.profilePicture ? (
                          <img
                            src={
                              post.author?.profilePicture?.url ||
                              post.author?.profilePicture?.path ||
                              post.author?.profilePicture
                            }
                            alt={post.author?.username}
                            className="w-8 h-8 rounded-full mr-2 object-cover border border-gray-200 dark:border-gray-600"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextElementSibling.style.display =
                                "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center mr-2 border border-gray-200 dark:border-gray-600 ${post.author?.profilePicture ? "hidden" : "flex"}`}
                          style={{
                            display: post.author?.profilePicture
                              ? "none"
                              : "flex",
                          }}
                        >
                          <span className="text-xs text-white font-medium">
                            {post.author?.username?.charAt(0)?.toUpperCase() ||
                              "U"}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {post.author?.username}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        <Link
                          to={`/posts/${post._id}`}
                          className="hover:text-green-600 dark:hover:text-green-400"
                        >
                          {post.title || truncateString(post.description, 50)}
                        </Link>
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                        {truncateString(post.description, 120)}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <FaEye className="mr-1" />
                            {post.viewers?.length || 0}
                          </span>
                          <span className="flex items-center">
                            <FaHeart className="mr-1" />
                            {post.likes?.length || 0}
                          </span>
                          <span className="flex items-center">
                            <FaComment className="mr-1" />
                            {post.comments?.length || 0}
                          </span>
                        </div>
                        <span>
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

        {/* No Results */}
        {totalResults === 0 && (
          <div className="text-center py-12">
            <FaSearch className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No results found
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Try adjusting your search terms or browse our content.
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalResults > 0 && (
        <div className="mt-8 flex justify-center">
          <nav className="flex items-center space-x-2">
            {page > 1 && (
              <button
                onClick={() => handlePageChange(page - 1)}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                Previous
              </button>
            )}
            <span className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400">
              Page {page}
            </span>
            {totalResults > page * 20 && (
              <button
                onClick={() => handlePageChange(page + 1)}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                Next
              </button>
            )}
          </nav>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
