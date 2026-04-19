import { useMutation, useQuery } from "@tanstack/react-query";
import { userProfileAPI, followUserAPI, unfollowUserAPI } from "../../APIServices/users/usersAPI";
import { fetchPostsByFollowing } from "../../APIServices/posts/postsAPI"; // You'll need to create this API function
import Avatar from "./Avatar";
import { Link, useNavigate } from "react-router-dom";
import { RiUserUnfollowFill, RiUserFollowLine } from "react-icons/ri";

const MyFollowing = () => {
  // Fetch profile
  const {
    data,
    isLoading,
    isError,
    error,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: userProfileAPI,
  });

  // Fetch posts from followed users
  const {
    data: postsData,
    isLoading: postsLoading,
    refetch: refetchPosts,
  } = useQuery({
    queryKey: ["following-posts"],
    queryFn: fetchPostsByFollowing,
  });

  const myId = data?.user?._id;
  const navigate = useNavigate();
  const myFollowing = data?.user?.following || [];
  const posts = postsData?.posts || [];

  // Mutations
  const followUserMutation = useMutation({ mutationFn: followUserAPI });
  const unfollowUserMutation = useMutation({ mutationFn: unfollowUserAPI });

  // Handlers
  const handleFollow = async (targetId) => {
    await followUserMutation.mutateAsync(targetId);
    refetchProfile();
    refetchPosts();
  };

  const handleUnfollow = async (targetId) => {
    await unfollowUserMutation.mutateAsync(targetId);
    refetchProfile();
    refetchPosts();
  };

  if (isLoading || postsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-300 text-lg">Loading...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 text-center">
        <p className="text-red-500 text-lg">
          Failed to load following list: {error?.response?.data?.message || error.message}
        </p>
      </div>
    );
  }

  // Estimate reading time (~200 wpm). Declare before early returns and not as a hook.
  const estimateReadingTime = (html) => {
    if (!html) return 1;
    const text = String(html).replace(/<[^>]+>/g, ' ').replace(/&[^;]+;/g, ' ');
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  return (
    <section className="relative py-16 md:py-24 overflow-hidden bg-black text-white min-h-screen">
      <div className="relative max-w-7xl px-4 mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-3">
            Following
          </h1>
          <p className="text-gray-600 dark:text-gray-300">People you follow · {myFollowing.length}</p>
        </div>

        {myFollowing.length === 0 ? (
          <div className="max-w-2xl mx-auto text-center bg-black/50 backdrop-blur-xl border border-white/10 text-white border border-white/10 border-white/10  p-10">
            <h2 className="text-2xl font-semibold mb-2">You are not following anyone yet</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Discover creators you like and follow them to see their latest posts.
            </p>
            <Link to="/trending" className="px-5 py-2 rounded-full bg-green-600 text-white hover:bg-green-700">
              Explore trending
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Following Users */}
            <div>
              <h2 className="text-2xl font-bold mb-6">People You Follow</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {myFollowing.map((user) => {
                  const isFollowing = myFollowing.some((u) => u._id === user._id);
                  return (
                    <div
                      key={user._id}
                      className="bg-black/50 backdrop-blur-xl border border-white/10 text-white border border-white/10 border-white/10  p-6 text-center hover:shadow-md transition cursor-pointer"
                      onClick={() => navigate(`/user/${user._id}`)}
                    >
                      <Link to={`/user/${user._id}`} onClick={(e) => e.stopPropagation()}>
                        <div className="mb-4 flex justify-center">
                          <Avatar 
                            user={user} 
                            size="2xl" 
                            showDefaultImage={true}
                          />
                        </div>
                      </Link>
                      <h5 className="text-xl font-semibold text-white">
                        {user.username}
                      </h5>
                      <span className="block text-sm text-gray-400 mb-3">
                        {user.email || "No email provided"}
                      </span>

                      {/* Profile + Follow/Unfollow Buttons */}
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <Link
                          to={`/user/${user._id}`}
                          className="px-3 py-2 text-sm font-medium  bg-gray-100 bg-white/5 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 text-center"
                        >
                          Profile
                        </Link>
                        {myId !== user._id && (
                          isFollowing ? (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleUnfollow(user._id); }}
                              className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm text-white bg-red-600  hover:bg-red-700"
                            >
                              <RiUserUnfollowFill /> Unfollow
                            </button>
                          ) : (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleFollow(user._id); }}
                              className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm text-white bg-blue-600  hover:bg-blue-700"
                            >
                              <RiUserFollowLine /> Follow
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Posts from Followed Users */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Posts from People You Follow</h2>
              {posts.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-300 text-lg">
                  No posts from people you follow yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.map((post) => {
                    const imageUrl = typeof post.image === 'string' ? post.image : post.image?.url;
                    const readingMins = estimateReadingTime(post?.description);
                    const postId = post?._id || post?.id;
                    return (
                      <div
                        key={postId || Math.random()}
                        role="button"
                        tabIndex={0}
                        onClick={() => postId && navigate(`/posts/${postId}`)}
                        onKeyDown={(e) => {
                          if (!postId) return;
                          if (e.key === 'Enter' || e.key === ' ') navigate(`/posts/${postId}`);
                        }}
                        className="cursor-pointer bg-black/50 backdrop-blur-xl border border-white/10 text-white border border-white/10 border-white/10  hover:shadow-md transition overflow-hidden"
                      >
                        {imageUrl && (
                          <img src={imageUrl} alt={post.title} className="w-full h-44 object-cover" />
                        )}
                        <div className="p-4">
                          {/* Author Info */}
                          <div className="flex items-center gap-2 mb-3">
                            {post.author?.profilePicture ? (
                              <img
                                src={post.author?.profilePicture?.url || post.author?.profilePicture?.path || post.author?.profilePicture}
                                alt={post.author?.username || "Anonymous"}
                                className="w-6 h-6 rounded-full object-cover border border-white/10 border-white/20"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextElementSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div 
                              className={`w-6 h-6 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center border border-white/10 border-white/20 ${post.author?.profilePicture ? 'hidden' : 'flex'}`}
                              style={{ display: post.author?.profilePicture ? 'none' : 'flex' }}
                            >
                              <span className="text-xs text-white font-medium">
                                {post.author?.username?.charAt(0)?.toUpperCase() || "U"}
                              </span>
                            </div>
                            <span className="text-gray-600 dark:text-gray-300 text-sm">
                              {post.author?.username || "Anonymous"}
                            </span>
                          </div>
                          
                          <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                            {postId ? (
                              <Link to={`/posts/${postId}`} className="hover:underline">
                                {post.title}
                              </Link>
                            ) : (
                              post.title
                            )}
                          </h3>
                          
                          <div className="text-xs text-gray-500 flex items-center justify-between">
                            <span>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            <span>{readingMins} min read</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default MyFollowing;