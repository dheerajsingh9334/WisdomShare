import React from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPopularTagsAPI } from "../../APIServices/posts/postsAPI";
import { Search, Tag as TagIcon } from "lucide-react";

export const HeroSection: React.FC = () => {
  const { userAuth } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState("");

  const { data: popularTagsData } = useQuery({
    queryKey: ["popular-tags"],
    queryFn: () => getPopularTagsAPI(5),
  });

  const popularTags = popularTagsData?.tags || ["React", "JavaScript", "AI", "Design", "Writing"];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleTagClick = (tag: string) => {
    navigate(`/search?tag=${encodeURIComponent(tag)}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  const handleGoogleAuth = () => {
    window.location.href = "http://localhost:5000/api/v1/users/auth/google";
  };

  return (
    <div className="relative w-full bg-transparent text-white overflow-hidden">
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[90vh] flex flex-col justify-center items-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-30 flex flex-col items-center text-center max-w-4xl mx-auto -mt-20"
        >
          <motion.h1
            variants={itemVariants}
            className="text-6xl md:text-8xl font-bold mb-4 tracking-tight"
          >
            WisdomShare
          </motion.h1>

          <motion.h2
            variants={itemVariants}
            className="text-3xl md:text-5xl pb-5 font-light bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300 bg-clip-text text-transparent"
          >
            Your Thoughts, Globally Shared
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-gray-400 mb-8 max-w-2xl text-lg uppercase tracking-widest text-[10px]"
          >
            Connect with writers and thinkers worldwide. Join a community of
            innovators and share your wisdom with the world today.
          </motion.p>

          {/* Search Bar - Monochromatic Glass */}
          <motion.div
            variants={itemVariants}
            className="w-full max-w-xl mb-6 relative group"
          >
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search wisdom, topics, or writers..."
                className="w-full bg-white/5 backdrop-blur-xl border border-white/10 p-4 pl-12 focus:outline-none focus:border-white/30 transition-all text-white placeholder:text-gray-500 rounded-none shadow-2xl uppercase text-[10px] tracking-widest font-bold"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
              <button 
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors rounded-none"
              >
                Find
              </button>
            </form>
          </motion.div>

          {/* Popular Tags - Sharp Design */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-3 mb-12"
          >
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mr-2 flex items-center gap-2">
              <TagIcon className="h-3 w-3" /> Trending
            </span>
            {popularTags.map((tagRef: any) => {
              const tagName = typeof tagRef === 'string' ? tagRef : tagRef.name;
              return (
                <button
                  key={tagName}
                  onClick={() => handleTagClick(tagName)}
                  className="px-4 py-1 bg-white/5 border border-white/10 hover:border-white/40 hover:bg-white/10 transition-all text-[10px] font-bold text-gray-400 hover:text-white rounded-none uppercase tracking-widest"
                >
                  {tagName}
                </button>
              );
            })}
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 items-center justify-center"
          >
            {!userAuth ? (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="px-10 py-4 bg-white text-black font-bold uppercase text-xs tracking-widest rounded-none hover:bg-gray-200 transition-colors w-full sm:w-auto"
                >
                  Get Started
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="px-10 py-4 bg-transparent border border-white/20 text-white font-bold uppercase text-xs tracking-widest rounded-none hover:bg-white/10 transition-colors w-full sm:w-auto hover:border-white"
                >
                  Join Now
                </button>
                <button
                  onClick={handleGoogleAuth}
                  className="px-10 py-4 bg-white/10 text-white font-bold uppercase text-xs tracking-widest rounded-none hover:bg-white/20 transition-colors w-full sm:w-auto flex items-center justify-center gap-3 border border-white/10"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="px-10 py-4 bg-white text-black font-bold uppercase text-xs tracking-widest rounded-none hover:bg-gray-200 transition-colors w-full sm:w-auto"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => navigate("/dashboard/create-post")}
                  className="px-10 py-4 bg-transparent border border-white/20 text-white font-bold uppercase text-xs tracking-widest rounded-none hover:bg-white/10 transition-colors w-full sm:w-auto hover:border-white"
                >
                  Create
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
