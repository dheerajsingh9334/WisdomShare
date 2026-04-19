import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchTrendingPostsAPI } from "../../APIServices/posts/postsAPI";
import { Link } from "react-router-dom";
import Avatar from "../User/Avatar";
import { FaBookmark, FaRegBookmark, FaEye, FaHeart, FaComment } from "react-icons/fa";
import { savePostAPI, unsavePostAPI, userProfileAPI } from "../../APIServices/users/usersAPI";

const TrendingPosts = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["trending-posts"],
    queryFn: fetchTrendingPostsAPI,
  });

  const { data: profileData } = useQuery({
    queryKey: ["profile"],
    queryFn: userProfileAPI,
  });

  const savePostMutation = useMutation({
    mutationFn: savePostAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    }
  });
  const unsavePostMutation = useMutation({
    mutationFn: unsavePostAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    }
  });

  const handleSave = async (postId, isSaved) => {
    if (!profileData?.user) return;
    if (isSaved) {
      await unsavePostMutation.mutateAsync(postId);
    } else {
      await savePostMutation.mutateAsync(postId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <span className="animate-spin text-4xl text-green-500">⏳</span>
        <span className="ml-4 text-lg">Loading trending posts...</span>
      </div>
    );
  }

  if (isError) {
    console.error("🔥 Error fetching trending posts:", error);
    return (
      <div className="text-center text-red-500">
        Failed to load trending posts.
      </div>
    );
  }

  if (data?.posts?.length === 0) {
    return (
      <div className="text-center text-gray-500">
        No trending posts found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-2">
      <div className="bg-black/60 backdrop-blur-xl border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              🔥 Trending Posts
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-3 text-lg">Discover what&apos;s capturing everyone&apos;s attention right now</p>
            <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-500">
              <span className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Live updates
              </span>
              <span>•</span>
              <span>Updated every hour</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {data?.posts?.length > 0 && (
          <div className="mb-8 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-none">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Showing <span className="font-semibold text-blue-600">{data.posts.length}</span> trending posts
              </span>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data?.posts?.map((post, index) => {
            const imageUrl = typeof post.image === "string" ? post.image : post.image?.url || "";
            const isSaved = profileData?.user?.savedPosts?.some((id) => id?.toString() === post._id?.toString());
            return (
              <article key={post._id} className="group bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden hover:scale-[1.02] transition-all duration-300 hover:border-white/30 rounded-none">
                {/* Trending badge */}
                <div className="relative">
                  {index < 3 && (
                    <div className="absolute top-3 left-3 z-10">
                      <div className={`px-3 py-1 text-xs font-bold text-white ${
                        index === 0 ? 'bg-yellow-600' : 
                        index === 1 ? 'bg-gray-600' : 
                        'bg-orange-600'
                      }`}>
                        #{index + 1} Trending
                      </div>
                    </div>
                  )}
                  
                  {imageUrl && (
                    <div className="relative h-48 overflow-hidden">
                      <Link to={`/posts/${post._id}`}>
                        <img 
                          src={imageUrl} 
                          alt={post.title || "Post image"} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        />
                      </Link>
                      {profileData?.user && (
                        <button
                          onClick={() => handleSave(post._id, isSaved)}
                          disabled={savePostMutation.isPending || unsavePostMutation.isPending}
                          className={`absolute top-3 right-3 p-2 rounded-none backdrop-blur-md transition-all duration-200 ${
                            isSaved 
                              ? 'bg-blue-600 text-white shadow-lg' 
                              : 'bg-white/90 text-gray-700 hover:text-blue-600 hover:bg-black/40 backdrop-blur-md text-white shadow-md'
                          }`}
                          title={isSaved ? 'Unsave post' : 'Save post'}
                        >
                          {isSaved ? <FaBookmark /> : <FaRegBookmark />}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-6">
                  {/* Author */}
                  <div className="flex items-center gap-3 mb-4">
                    <Link to={`/user/${post.author?._id}`} className="group/author">
                      <Avatar user={post.author} size="sm" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/user/${post.author?._id}`} className="text-sm font-semibold text-white hover:text-blue-600 transition-colors truncate block">
                        {post.author?.username || 'Anonymous'}
                      </Link>
                      <div className="text-xs text-gray-500 flex items-center">
                        <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                        {new Date(post.createdAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <Link to={`/posts/${post._id}`}>
                    <h3 className="text-lg font-bold text-white mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
                      {post.title || 'Untitled'}
                    </h3>
                  </Link>

                  {/* Category */}
                  {post.category?.categoryName && (
                    <div className="mb-4">
                      <span className="inline-flex items-center px-3 py-1 bg-white/10 text-white text-xs font-semibold rounded-none border border-white/10">
                        {post.category.categoryName}
                      </span>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-400 pt-3 border-t border-white/5 border-white/10">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                        <FaEye className="text-blue-500" /> 
                        <span className="font-medium">{post.viewers?.length || 0}</span>
                      </span>
                      <span className="flex items-center gap-1 hover:text-red-600 transition-colors">
                        <FaHeart className="text-red-500" /> 
                        <span className="font-medium">{post.likes?.length || 0}</span>
                      </span>
                      <span className="flex items-center gap-1 hover:text-green-600 transition-colors">
                        <FaComment className="text-green-500" /> 
                        <span className="font-medium">{post.comments?.length || 0}</span>
                      </span>
                    </div>
                    
                    {/* Read more indicator */}
                    <Link 
                      to={`/posts/${post._id}`}
                      className="text-xs text-gray-400 group-hover:text-blue-500 transition-colors hover:text-blue-500"
                    >
                      Read more →
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        
        {/* Empty state */}
        {(!data?.posts || data.posts.length === 0) && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📈</div>
            <h3 className="text-xl font-semibold text-white mb-2">No trending posts yet</h3>
            <p className="text-gray-400">Check back later for the latest trending content!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendingPosts;
