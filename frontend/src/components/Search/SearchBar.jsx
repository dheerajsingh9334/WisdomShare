import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaTimes } from "react-icons/fa";
import { semanticSearchDirectAPI } from "../../APIServices/ai/aiAPI";
import { useQuery } from "@tanstack/react-query";

const SearchBar = ({
  className = "",
  placeholder = "Search posts, users, or content...",
  onSearchComplete,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 350);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["search-preview", debouncedSearchTerm],
    queryFn: () =>
      semanticSearchDirectAPI({
        query: debouncedSearchTerm,
        page: 1,
        limit: 5,
      }),
    enabled: debouncedSearchTerm.length >= 2,
    staleTime: 30000, // Cache for 30 seconds
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim().length >= 2) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setShowResults(false);
      setSearchTerm("");
      // Call the callback if provided
      if (onSearchComplete) {
        onSearchComplete();
      }
    }
  };

  const handleResultClick = (type, id) => {
    if (type === "post") {
      navigate(`/posts/${id}`);
    } else if (type === "user") {
      navigate(`/user/${id}`);
    }
    setShowResults(false);
    setSearchTerm("");
    // Call the callback if provided
    if (onSearchComplete) {
      onSearchComplete();
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowResults(value.length >= 2);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setShowResults(false);
  };

  const results = {
    posts: searchResults?.data?.results || [],
  };
  const hasResults = results.posts.length > 0;

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          className="w-full px-4 py-2 pl-10 pr-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
        {searchTerm && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <FaTimes className="text-sm" />
          </button>
        )}
      </form>

      {/* Search Results Dropdown */}
      {showResults && searchTerm.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-2 text-sm">Searching...</p>
            </div>
          ) : hasResults ? (
            <div>
              {/* Posts Results */}
              {results.posts.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Posts matched by meaning
                  </div>
                  {results.posts.map((post) => (
                    <button
                      key={post._id}
                      onClick={() => handleResultClick("post", post._id)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                    >
                      <div className="flex items-center space-x-3">
                        {post.image && (
                          <img
                            src={
                              typeof post.image === "string"
                                ? post.image
                                : post.image.url
                            }
                            alt={post.title}
                            className="w-8 h-8 rounded object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {post.title || post.description?.substring(0, 50)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            by {post.author?.username}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Users Results */}
              {results.users && results.users.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Users
                  </div>
                  {results.users.map((user) => (
                    <button
                      key={user._id}
                      onClick={() => handleResultClick("user", user._id)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                    >
                      <div className="flex items-center space-x-3">
                        {user.profilePicture ? (
                          <img
                            src={
                              user.profilePicture?.url ||
                              user.profilePicture?.path ||
                              user.profilePicture
                            }
                            alt={user.username}
                            className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextElementSibling.style.display =
                                "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center border border-gray-200 dark:border-gray-600 ${user.profilePicture ? "hidden" : "flex"}`}
                          style={{
                            display: user.profilePicture ? "none" : "flex",
                          }}
                        >
                          <span className="text-xs text-white font-medium">
                            {user.username?.charAt(0)?.toUpperCase() || "U"}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.username}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {user.posts?.length || 0} posts
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* View All Results */}
              <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-600">
                <button
                  onClick={() => {
                    navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
                    setShowResults(false);
                    setSearchTerm("");
                    // Call the callback if provided
                    if (onSearchComplete) {
                      onSearchComplete();
                    }
                  }}
                  className="w-full text-center text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
                >
                  View all results for "{searchTerm}"
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <p className="text-sm">No results found for "{searchTerm}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
