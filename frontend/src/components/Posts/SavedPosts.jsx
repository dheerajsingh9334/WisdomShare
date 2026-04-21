import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaHeart, FaComment, FaRegBookmark, FaTrash } from 'react-icons/fa';
import { fetchAllPosts } from '../../APIServices/posts/postsAPI';
import { truncateText } from '../../utils/responsiveUtils';

const SavedPosts = () => {
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load saved posts from localStorage and fetch post data
  useEffect(() => {
    const loadSavedPosts = async () => {
      try {
        setLoading(true);
        
        // Get saved post IDs from localStorage
        const savedPostsFromStorage = localStorage.getItem('savedPosts');
        if (!savedPostsFromStorage) {
          setSavedPosts([]);
          setLoading(false);
          return;
        }

        const savedPostIds = JSON.parse(savedPostsFromStorage);
        console.log('📚 Loading saved posts:', savedPostIds);

        if (savedPostIds.length === 0) {
          setSavedPosts([]);
          setLoading(false);
          return;
        }

        // Fetch all posts to get the saved ones
        const response = await fetchAllPosts({ limit: 1000 }); // Get all posts
        const allPosts = response.posts || [];
        
        // Filter to only show saved posts
        const savedPostsData = allPosts.filter(post => 
          savedPostIds.includes(post._id)
        );

        console.log('📚 Found saved posts:', savedPostsData.length);
        setSavedPosts(savedPostsData);
        
      } catch (error) {
        console.error('❌ Error loading saved posts:', error);
        setSavedPosts([]);
      } finally {
        setLoading(false);
      }
    };

    loadSavedPosts();
  }, []);

  // Remove post from saved
  const removeFromSaved = (postId) => {
    try {
      // Remove from localStorage
      const savedPostsFromStorage = localStorage.getItem('savedPosts');
      if (savedPostsFromStorage) {
        const savedPostIds = JSON.parse(savedPostsFromStorage);
        const updatedSavedPostIds = savedPostIds.filter(id => id !== postId);
        localStorage.setItem('savedPosts', JSON.stringify(updatedSavedPostIds));
        
        // Update local state
        setSavedPosts(prev => prev.filter(post => post._id !== postId));
        
        console.log('🗑️ Post removed from saved:', postId);
      }
    } catch (error) {
      console.error('❌ Error removing post from saved:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading saved posts...</p>
        </div>
      </div>
    );
  }

  if (savedPosts.length === 0) {
    return (
      <div className="min-h-screen bg-transparent text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-white mb-2">No saved posts yet</h2>
          <p className="text-gray-400 mb-6">Start saving posts to see them here!</p>
          <Link 
            to="/posts" 
            className="inline-flex items-center px-6 py-3 bg-green-500 text-white font-medium  hover:bg-green-600 transition-colors"
          >
            Browse Posts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Saved Posts
          </h1>
          <p className="text-lg text-gray-400">
            {savedPosts.length} saved {savedPosts.length === 1 ? 'post' : 'posts'}
          </p>
        </div>

        {/* Saved Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedPosts.map((post) => (
            <article key={post._id} className="group bg-black/50 backdrop-blur-xl border border-white/10 text-white  shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
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
                
                {/* Remove from saved button */}
                <button
                  onClick={() => removeFromSaved(post._id)}
                  className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                  aria-label="Remove from saved"
                >
                  <FaTrash className="h-4 w-4" />
                </button>
              </div>

              {/* Post Content */}
              <div className="p-4 space-y-3">
                {/* Category and Tags */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {post.category && (
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium rounded-full">
                      {post.category.categoryName || post.category.name || 'Uncategorized'}
                    </span>
                  )}
                  {post.tags && post.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Title */}
                <Link to={`/posts/${post._id}`}>
                  <h3 className="text-xl font-bold text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors line-clamp-2 leading-tight">
                    {post.title}
                  </h3>
                </Link>

                {/* Excerpt */}
                <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                  {truncateText(post.content, 120)}
                </p>

                {/* Author & Meta */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5 border-white/10">
                  <div className="flex items-center space-x-3">
                    <Link to={`/user/${post.author?._id}`} className="flex-shrink-0">
                      {post.author?.profilePicture ? (
                        <img
                          src={post.author.profilePicture.url || post.author.profilePicture.path || post.author.profilePicture}
                          alt={post.author.name || post.author.username}
                          className="w-8 h-8 rounded-full object-cover hover:ring-2 hover:ring-blue-500 transition-all"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center hover:ring-2 hover:ring-blue-500 transition-all">
                          <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                            {(post.author?.name || post.author?.username || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </Link>
                    <div>
                      <Link 
                        to={`/user/${post.author?._id}`}
                        className="text-sm font-medium text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {post.author?.name || post.author?.username || 'Anonymous'}
                      </Link>
                      <p className="text-xs text-gray-400">
                        {new Date(post.createdAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Saved indicator */}
                  <div className="text-green-500">
                    <FaRegBookmark className="h-4 w-4" />
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center space-x-4 text-xs text-gray-400 pt-2">
                  <span className="flex items-center space-x-1">
                    <FaEye className="h-3 w-3" />
                    <span>{post.views || 0}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <FaHeart className="h-3 w-3" />
                    <span>{post.likes?.length || 0}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <FaComment className="h-3 w-3" />
                    <span>{post.comments?.length || 0}</span>
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SavedPosts;