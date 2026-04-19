import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { FaArrowLeft, FaUserPlus } from "react-icons/fa";
import { getUserProfileByIdAPI } from "../../APIServices/users/usersAPI";
import Avatar from "./Avatar";
import FollowButton from "./FollowButton";

const UserFollowing = () => {
  const { userId } = useParams();

  // Fetch user profile with following
  const { data: userData, isLoading, isError, error } = useQuery({
    queryKey: ["user-profile", userId],
    queryFn: () => getUserProfileByIdAPI(userId),
  });

  // Get current user for follow button functionality
  const { data: currentUserData } = useQuery({
    queryKey: ["profile"],
    queryFn: () => import("../../APIServices/users/usersAPI").then(api => api.userProfileAPI()),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading following...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">Error loading following</p>
          <p className="text-gray-600 dark:text-gray-300">{error.message}</p>
        </div>
      </div>
    );
  }

  const user = userData?.user;
  const following = user?.following || [];
  const currentUserId = currentUserData?.user?._id;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white shadow-sm border-b border-white/10 border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link
              to={`/user/${userId}`}
              className="p-2 text-gray-400 hover:text-white dark:hover:text-white transition-colors"
            >
              <FaArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-4">
              <Avatar user={user} size="lg" />
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {user?.username}&apos;s Following
                </h1>
                <p className="text-gray-400">
                  Following {following.length} {following.length === 1 ? 'person' : 'people'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {following.length === 0 ? (
          <div className="text-center bg-black/50 backdrop-blur-xl border border-white/10 text-white border border-white/10 border-white/10  p-12">
            <div className="w-20 h-20 bg-gray-100 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaUserPlus className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-3">
              Not following anyone yet
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {user?.username} isn&apos;t following anyone yet.
            </p>
            <Link
              to="/trending"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white  hover:bg-blue-700 transition-colors"
            >
              Discover Users
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {following.map((followedUser) => (
              <div
                key={followedUser._id}
                className="bg-black/50 backdrop-blur-xl border border-white/10 text-white border border-white/10 border-white/10  p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => window.location.assign(`/user/${followedUser._id}`)}
              >
                {/* User Info */}
                <div className="flex items-center gap-4 mb-4">
                  <Link to={`/user/${followedUser._id}`}>
                    <Avatar user={followedUser} size="lg" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/user/${followedUser._id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="block font-semibold text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate"
                    >
                      {followedUser.username}
                    </Link>
                    <p className="text-sm text-gray-400 truncate">
                      {followedUser.email}
                    </p>
                  </div>
                </div>

                {/* User Stats */}
                <div className="flex justify-between text-sm text-gray-400 mb-4">
                  <span>{followedUser.posts?.length || 0} posts</span>
                  <span>{followedUser.followers?.length || 0} followers</span>
                  <span>{followedUser.following?.length || 0} following</span>
                </div>

                {/* Action Buttons - Instagram Style */}
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to={`/user/${followedUser._id}`}
                    className="px-3 py-2 bg-gray-100 bg-white/5 text-gray-700 dark:text-gray-200 text-sm font-medium  hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-center"
                  >
                    Profile
                  </Link>
                  <FollowButton
                    targetUserId={followedUser._id}
                    currentUserId={currentUserId}
                    isFollowing={currentUserData?.user?.following?.some(
                      (user) => user._id === followedUser._id
                    )}
                    size="sm"
                    variant="default"
                    className="justify-center"
                  />
                </div>

                {/* Quick Actions */}
                <div className="mt-3 flex gap-2">
                  <Link
                    to={`/user/${followedUser._id}/followers`}
                    className="flex-1 px-2 py-1 text-xs text-center text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20  transition-colors"
                  >
                    See Followers
                  </Link>
                  <Link
                    to={`/user/${followedUser._id}/following`}
                    className="flex-1 px-2 py-1 text-xs text-center text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20  transition-colors"
                  >
                    See Following
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserFollowing;
