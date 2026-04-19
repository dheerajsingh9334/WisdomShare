import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { FaSearch, FaEye, FaHeart, FaComment, FaUser, FaClock } from "react-icons/fa";
import { motion } from "framer-motion";
import { semanticSearchDirectAPI } from "../../APIServices/ai/aiAPI";
import { searchAllAPI } from "../../APIServices/posts/postsAPI";
import truncateString from "../../utils/truncateString";

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("all");
  
  // Handle both 'q' and 'query' param aliases for maximum compatibility
  const query = searchParams.get("q") || searchParams.get("query") || "";
  const tag = searchParams.get("tag") || "";
  const type = searchParams.get("type") || "all";
  const page = parseInt(searchParams.get("page") || "1");

  // Determine effective search term (either explicit query or tag)
  const effectiveQuery = tag ? `#${tag}` : query;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["search", { q: query, tag, type, page }],
    queryFn: () => {
      // If a tag is provided, we can use a specialized tag search or general search
      if (tag) {
        return searchAllAPI({ q: tag, type: 'tag', page, limit: 12 });
      }
      // Otherwise use general search
      return searchAllAPI({ q: query, type, page, limit: 12 });
    },
    enabled: query.length >= 1 || tag.length > 0,
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ q: query, tag, type: tab, page: "1" });
  };

  const handlePageChange = (newPage) => {
    setSearchParams({ q: query, tag, type, page: newPage.toString() });
  };

  if ((!query || query.length < 1) && !tag) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-black min-h-screen">
        <div className="text-center">
          <FaSearch className="mx-auto h-16 w-16 text-white/10" />
          <h3 className="mt-6 text-xs font-bold text-white uppercase tracking-[0.3em]">
            System Ready
          </h3>
          <p className="mt-2 text-[10px] text-gray-500 uppercase tracking-widest">
            Enter search terms to probe the network
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-black min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-none h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-8 text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">Scanning Database</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-black min-h-screen">
        <div className="text-center">
          <p className="text-white text-xs font-bold uppercase tracking-widest mb-4">
            ⚠️ Network Failure
          </p>
          <p className="text-gray-500 text-[10px] uppercase tracking-widest">{error?.message}</p>
        </div>
      </div>
    );
  }

  // Robust parsing for various response shapes
  const results = data?.results || data?.data || {};
  const posts = results.posts || data?.posts || [];
  const users = results.users || data?.users || [];
  const totalPosts = results.totalPosts || data?.totalPosts || posts.length || 0;
  const totalUsers = results.totalUsers || data?.totalUsers || users.length || 0;
  const totalResults = totalPosts + totalUsers;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-black min-h-screen">
      {/* Search Header */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-white mb-4 tracking-tighter uppercase flex items-center gap-4">
          <span className="text-gray-600">Results for</span> 
          <span>"{effectiveQuery}"</span>
        </h1>
        <div className="h-px bg-white/10 w-full"></div>
      </div>

      {/* Tabs - Sharp Monochromatic */}
      <div className="mb-12 border-b border-white/5">
        <nav className="flex space-x-12">
          <button
            onClick={() => handleTabChange("all")}
            className={`pb-4 px-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative ${
              activeTab === "all"
                ? "text-white"
                : "text-gray-500 hover:text-white"
            }`}
          >
            All Results ({totalResults})
            {activeTab === "all" && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
          </button>
          <button
            onClick={() => handleTabChange("posts")}
            className={`pb-4 px-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative ${
              activeTab === "posts"
                ? "text-white"
                : "text-gray-500 hover:text-white"
            }`}
          >
            Writings ({totalPosts})
            {activeTab === "posts" && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
          </button>
          <button
            onClick={() => handleTabChange("users")}
            className={`pb-4 px-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative ${
              activeTab === "users"
                ? "text-white"
                : "text-gray-500 hover:text-white"
            }`}
          >
            Thinkers ({totalUsers})
            {activeTab === "users" && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
          </button>
        </nav>
      </div>

      {/* Results Grid */}
      <div className="space-y-16">
        {/* User Results - New Feature */}
        {(activeTab === "all" || activeTab === "users") && users.length > 0 && (
          <div>
            <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-4">
              <FaUser /> Connected Thinkers
            </h2>
            <div className="grid gap-px bg-white/10 border border-white/10">
              {users.map((user) => (
                <Link
                  key={user._id}
                  to={`/user/${user._id}`}
                  className="flex items-center justify-between p-6 bg-black hover:bg-white/5 transition-all group"
                >
                  <div className="flex items-center space-x-6">
                    <img
                      src={user.profilePicture || '/default-avatar.png'}
                      alt={user.username}
                      className="w-12 h-12 rounded-none grayscale group-hover:grayscale-0 transition-all border border-white/10"
                    />
                    <div>
                      <h3 className="font-bold text-white text-lg tracking-tight uppercase">{user.username}</h3>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest">{user.bio || 'Architect of Wisdom'}</p>
                    </div>
                  </div>
                  <span className="px-4 py-1 border border-white/10 text-[9px] font-bold uppercase tracking-widest group-hover:bg-white group-hover:text-black transition-all">
                    View Profile
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Posts Results */}
        {(activeTab === "all" || activeTab === "posts") && posts.length > 0 && (
          <div>
            <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-4">
              <FaClock /> Published Wisdom
            </h2>
            <div className="grid gap-px bg-white/10 border border-white/10 lg:grid-cols-2">
              {posts.map((post) => (
                <article
                  key={post._id}
                  className="bg-black p-8 group hover:bg-white/5 transition-all relative overflow-hidden"
                >
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6">
                       <span className="text-[9px] font-bold text-gray-600 uppercase tracking-[0.2em]">
                         {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                       </span>
                       <div className="flex items-center space-x-4 text-gray-600 text-[10px]">
                          <span className="flex items-center gap-1"><FaEye size={10} /> {post.viewers?.length || post.viewsCount || 0}</span>
                          <span className="flex items-center gap-1"><FaHeart size={10} /> {post.likes?.length || 0}</span>
                       </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-4 tracking-tight group-hover:translate-x-1 transition-transform uppercase leading-tight">
                      <Link to={`/posts/${post._id}`}>
                        {post.title || truncateString(post.description, 40)}
                      </Link>
                    </h3>
                    
                    <p className="text-gray-500 text-sm mb-8 font-light leading-relaxed">
                      {truncateString(post.description || post.excerpt || "", 150)}
                    </p>
                    
                    <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <img 
                            src={post.author?.profilePicture || '/default-avatar.png'} 
                            className="w-6 h-6 rounded-none border border-white/10 grayscale" 
                            alt={post.author?.username}
                          />
                          <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest italic">{post.author?.username}</span>
                       </div>
                       <Link 
                        to={`/posts/${post._id}`}
                        className="text-[10px] font-bold uppercase tracking-widest text-white/20 group-hover:text-white transition-colors"
                       >
                         Read More →
                       </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* No Results Check */}
        {totalResults === 0 && (
          <div className="text-center py-20 bg-white/5 border border-dashed border-white/10">
            <h3 className="text-xs font-bold text-white uppercase tracking-[0.3em] mb-2 text-white/30">
              Zero Resonance
            </h3>
            <p className="text-[10px] text-gray-600 uppercase tracking-widest">
              The query yielded no results. Revise parameters.
            </p>
          </div>
        )}
      </div>

      {/* Pagination - Monochromatic Sharp */}
      {totalResults > 0 && (
        <div className="mt-20 flex justify-center border-t border-white/10 pt-12">
          <nav className="flex items-center space-x-px bg-white/10 border border-white/10">
            {page > 1 && (
              <button
                onClick={() => handlePageChange(page - 1)}
                className="px-6 py-3 text-[10px] font-bold text-gray-500 bg-black hover:bg-white hover:text-black transition-all uppercase tracking-widest"
              >
                Prev
              </button>
            )}
            <span className="px-8 py-3 text-[10px] font-bold text-white bg-black/50 uppercase tracking-widest border-x border-white/10">
              {page}
            </span>
            {totalResults > page * 12 && (
              <button
                onClick={() => handlePageChange(page + 1)}
                className="px-6 py-3 text-[10px] font-bold text-gray-500 bg-black hover:bg-white hover:text-black transition-all uppercase tracking-widest"
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
