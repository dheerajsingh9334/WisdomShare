import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import {
  getUserProfileByIdAPI,
  userProfileAPI,
} from "../../APIServices/users/usersAPI";
import Avatar from "./Avatar";
import FollowButton from "./FollowButton";
import {
  FaSun,
  FaMoon,
  FaHeart,
  FaComment,
  FaEye,
  FaPaperPlane,
} from "react-icons/fa";

const UserProfile = () => {
  const { userId } = useParams();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize dark mode state
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark);
    setIsDarkMode(shouldBeDark);
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);

    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["user-profile", userId],
    queryFn: () => getUserProfileByIdAPI(userId),
  });

  // Current logged-in user for follow button - moved before early returns
  const { data: currentProfile } = useQuery({
    queryKey: ["profile"],
    queryFn: userProfileAPI,
  });

  const user = data?.user;

  const profileStats = useMemo(() => {
    const posts = user?.posts || [];
    const totalLikes = posts.reduce(
      (sum, post) => sum + (post?.likes?.length || 0),
      0,
    );
    const totalComments = posts.reduce(
      (sum, post) => sum + (post?.comments?.length || 0),
      0,
    );
    const totalViews = posts.reduce(
      (sum, post) => sum + (post?.viewsCount || post?.viewers?.length || 0),
      0,
    );

    return {
      totalLikes,
      totalComments,
      totalViews,
    };
  }, [user?.posts]);

  if (isLoading)
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading profile...</p>
        </div>
      </div>
    );

  if (isError)
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-red-500">{error.message}</p>
      </div>
    );

  const currentUserId = currentProfile?.user?._id;
  const isFollowing = currentProfile?.user?.following?.some(
    (u) => u._id === user?._id,
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white border-b border-white/10 border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-6">
              <Avatar user={user} size="xl" />
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {user?.username}
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  {user?.bio || user?.email}
                </p>

                {/* Account Status */}
                <div className="mt-2">
                  {user?.isBanned ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <svg
                        className="h-3 w-3 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Account Banned
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <svg
                        className="h-3 w-3 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Active Account
                    </span>
                  )}
                  {user?.isBanned && user?.banReason && (
                    <p className="text-xs text-red-600 mt-1">
                      Reason: {user.banReason}
                    </p>
                  )}
                  {user?.isBanned && user?.bannedBy && (
                    <p className="text-xs text-red-600 mt-1">
                      Contact Admin: {user.bannedBy.email}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-6 mt-3 text-sm">
                  <Link
                    to={`/user/${userId}/followers`}
                    className="hover:underline"
                  >
                    <span className="font-semibold text-white">
                      {user?.followers?.length || 0}
                    </span>{" "}
                    followers
                  </Link>
                  <Link
                    to={`/user/${userId}/following`}
                    className="hover:underline"
                  >
                    <span className="font-semibold text-white">
                      {user?.following?.length || 0}
                    </span>{" "}
                    following
                  </Link>
                  <span>
                    <span className="font-semibold text-white">
                      {user?.posts?.length || 0}
                    </span>{" "}
                    posts
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-3 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  <span className="inline-flex items-center gap-1">
                    <FaHeart className="text-rose-500" />
                    <span className="font-semibold text-white">
                      {profileStats.totalLikes}
                    </span>{" "}
                    likes
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <FaComment className="text-green-600" />
                    <span className="font-semibold text-white">
                      {profileStats.totalComments}
                    </span>{" "}
                    comments
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <FaEye className="text-blue-600" />
                    <span className="font-semibold text-white">
                      {profileStats.totalViews}
                    </span>{" "}
                    views
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {/* Dark Mode Toggle - Always visible */}
              <button
                onClick={toggleDarkMode}
                className="p-2  hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Toggle dark mode"
              >
                {isDarkMode ? (
                  <FaSun className="h-5 w-5 text-yellow-500" />
                ) : (
                  <FaMoon className="h-5 w-5 text-gray-600" />
                )}
              </button>

              {/* Other user actions - Only for other users */}
              {currentUserId && currentUserId !== user?._id && (
                <>
                  <FollowButton
                    targetUserId={user?._id}
                    currentUserId={currentUserId}
                    isFollowing={isFollowing}
                    size="md"
                    variant="default"
                  />
                  <Link
                    to={`/user/${userId}/followers`}
                    className="px-4 py-2  border border-white/20 border-white/20 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Followers
                  </Link>
                  <Link
                    to={`/chat?userId=${user?._id}&username=${encodeURIComponent(user?.username || "User")}`}
                    className="px-4 py-2  border border-blue-300 bg-blue-50 text-blue-700 text-sm hover:bg-blue-100 dark:border-blue-500/50 dark:bg-blue-900/30 dark:text-blue-200 dark:hover:bg-blue-900/50 inline-flex items-center gap-2"
                  >
                    <FaPaperPlane className="h-3.5 w-3.5" />
                    Chat
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Posts grid like Instagram */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {user?.posts?.length === 0 ? (
          <div className="text-center text-gray-600 dark:text-gray-300">
            No posts yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {user?.posts?.map((post) => {
              const imageUrl =
                typeof post.image === "string" ? post.image : post.image?.url;
              return (
                <Link
                  key={post._id}
                  to={`/posts/${post._id}`}
                  className="group block bg-black/50 backdrop-blur-xl border border-white/10 text-white border border-white/10 border-white/10 overflow-hidden  shadow-sm hover:shadow-md transition-all"
                >
                  <div className="relative aspect-square bg-gray-100 bg-black overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={post.title || "Post"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-colors flex items-center justify-center gap-6 opacity-0 group-hover:opacity-100">
                      <span className="text-white text-sm font-medium">
                        ❤ {post.likes?.length || 0}
                      </span>
                      <span className="text-white text-sm font-medium">
                        💬 {post.comments?.length || 0}
                      </span>
                      <span className="text-white text-sm font-medium">
                        👁 {post.viewsCount || post.viewers?.length || 0}
                      </span>
                    </div>
                  </div>

                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-white line-clamp-1">
                      {post.title || "Untitled Post"}
                    </h3>
                    <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                      <span className="inline-flex items-center gap-1">
                        <FaHeart /> {post.likes?.length || 0}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <FaComment /> {post.comments?.length || 0}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <FaEye /> {post.viewsCount || post.viewers?.length || 0}
                      </span>
                    </div>
                    <p className="mt-2 text-[11px] text-gray-400">
                      {post.createdAt
                        ? new Date(post.createdAt).toLocaleDateString()
                        : ""}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
