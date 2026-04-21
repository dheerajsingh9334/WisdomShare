import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { RiUserUnfollowFill, RiUserFollowLine } from "react-icons/ri";
import { Link, useNavigate } from "react-router-dom";
import { userProfileAPI, followUserAPI, unfollowUserAPI } from "../../APIServices/users/usersAPI";
import Avatar from "./Avatar";

const MyFollowers = () => {
  //fetch userProfile
  //fetch userProfile
  const { data, isLoading, isError, error, refetch: refetchProfile } = useQuery({
    queryKey: ["profile"],
    queryFn: userProfileAPI,
  });
  //get the user following
  const myFollowers = data?.user?.followers || [];
  const myFollowing = data?.user?.following || [];
  const myId = data?.user?._id;

  // Mutations
  const followUserMutation = useMutation({ mutationFn: followUserAPI });
  const unfollowUserMutation = useMutation({ mutationFn: unfollowUserAPI });

  // Handlers
  const [pendingId, setPendingId] = useState(null);
  const [actionError, setActionError] = useState("");
  const navigate = useNavigate();

  const handleFollow = async (targetId) => {
    try {
      setActionError("");
      setPendingId(targetId);
      await followUserMutation.mutateAsync(targetId);
      await refetchProfile();
    } catch (e) {
      setActionError(e?.response?.data?.message || e?.message || "Action failed");
    } finally {
      setPendingId(null);
    }
  };

  const handleUnfollow = async (targetId) => {
    try {
      setActionError("");
      setPendingId(targetId);
      await unfollowUserMutation.mutateAsync(targetId);
      await refetchProfile();
    } catch (e) {
      setActionError(e?.response?.data?.message || e?.message || "Action failed");
    } finally {
      setPendingId(null);
    }
  };

  if (isLoading) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-transparent text-white">
        <p className="text-gray-600 dark:text-gray-300">Loading followers…</p>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-transparent text-white px-4 text-center">
        <p className="text-red-500">
          Failed to load followers: {error?.response?.data?.message || error?.message}
        </p>
      </section>
    );
  }

  return (
    <section className="relative py-16 md:py-24 overflow-hidden bg-transparent text-white min-h-screen">
      <div className="relative max-w-7xl px-4 mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-3">
            Followers
          </h1>
          <p className="text-gray-600 dark:text-gray-300">People who follow you · {myFollowers.length}</p>
        </div>

        {myFollowers.length === 0 ? (
          <div className="max-w-2xl mx-auto text-center bg-black/50 backdrop-blur-xl border border-white/10 text-white border border-white/10 border-white/10  p-10">
            <h2 className="text-2xl font-semibold mb-2">No followers yet</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Share your stories and engage with the community to gain followers.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link to="/trending" className="px-5 py-2 rounded-full glass-premium-button text-white hover:bg-green-700">
                Explore trending
              </Link>
              <Link to="/ranking" className="px-5 py-2 rounded-full border border-white/20 border-white/20 hover:bg-gray-50 dark:hover:bg-gray-700">
                Creators ranking
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {myFollowers.map((follower) => {
              const profileUrl = follower?._id ? `/user/${follower._id}` : undefined;
              const followedIds = myFollowing.map((u) => (typeof u === 'string' ? u : u?._id)).filter(Boolean).map(String);
              const followerId = follower?._id ? String(follower._id) : undefined;
              const isFollowing = followerId ? followedIds.includes(followerId) : false;
              return (
                <div
                  key={follower?._id || follower?.username}
                  className="bg-black/50 backdrop-blur-xl border border-white/10 text-white border border-white/10 border-white/10  p-6 hover:shadow-md transition cursor-pointer"
                  onClick={() => followerId && navigate(`/user/${followerId}`)}
                >
                  <div className="text-center">
                    <Link to={profileUrl || '#'} className={profileUrl ? 'inline-block' : 'pointer-events-none'}>
                      <div className="mb-4 flex justify-center">
                        <Avatar 
                          user={follower} 
                          size="2xl" 
                          showDefaultImage={true}
                        />
                      </div>
                    </Link>
                    <h5 className="text-xl font-semibold text-white">
                      {follower?.username || 'Unknown'}
                    </h5>
                    <p className="text-sm text-gray-400 mt-1">
                      {follower?.email || 'No email'}
                    </p>
                    {followerId && (
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <Link
                          to={profileUrl || '#'}
                          className="px-3 py-2 text-sm font-medium  bg-gray-100 bg-white/5 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 text-center"
                        >
                          Profile
                        </Link>
                        {myId !== follower?._id && (
                          isFollowing ? (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleUnfollow(followerId); }}
                              disabled={pendingId === followerId}
                              className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm text-white bg-red-600  hover:bg-red-700 disabled:opacity-60"
                            >
                              <RiUserUnfollowFill /> {pendingId === followerId ? 'Unfollowing…' : 'Unfollow'}
                            </button>
                          ) : (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleFollow(followerId); }}
                              disabled={pendingId === followerId}
                              className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm text-white bg-blue-600  hover:bg-blue-700 disabled:opacity-60"
                            >
                              <RiUserFollowLine /> {pendingId === followerId ? 'Following…' : 'Follow'}
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {!!actionError && (
        <p className="mt-6 text-center text-sm text-red-500">{actionError}</p>
      )}
    </section>
  );    
};

export default MyFollowers;
