import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FaFire, FaEye, FaHeart, FaComment, FaChevronLeft, FaChevronRight, FaClock } from 'react-icons/fa';

const TrendingCarousel = ({ posts = [], title = "Trending Posts" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const carouselRef = useRef(null);
  const autoPlayRef = useRef(null);

  // Auto-scroll functionality
  useEffect(() => {
    if (isAutoPlaying && posts.length > 1) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === posts.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000); // Change slide every 5 seconds
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, posts.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? posts.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === posts.length - 1 ? 0 : currentIndex + 1);
  };

  const handleMouseEnter = () => {
    setIsAutoPlaying(false);
  };

  const handleMouseLeave = () => {
    setIsAutoPlaying(true);
  };

  // Format date helper
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Truncate text helper
  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  if (!posts || posts.length === 0) {
    return (
      <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  shadow-md p-6">
        <div className="flex items-center mb-4">
          <FaFire className="text-orange-500 text-xl mr-2" />
          <h2 className="text-xl font-bold text-white">{title}</h2>
        </div>
        <div className="text-center py-8">
          <FaFire className="mx-auto text-4xl text-gray-400 mb-4" />
          <p className="text-gray-400">No trending posts available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  shadow-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10 border-white/10">
        <div className="flex items-center">
          <FaFire className="text-orange-500 text-xl mr-2" />
          <h2 className="text-xl font-bold text-white">{title}</h2>
        </div>
        
        {/* Navigation Buttons */}
        {posts.length > 1 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPrevious}
              className="p-2 rounded-full bg-gray-100 bg-white/5 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Previous post"
            >
              <FaChevronLeft className="text-gray-400" />
            </button>
            <button
              onClick={goToNext}
              className="p-2 rounded-full bg-gray-100 bg-white/5 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Next post"
            >
              <FaChevronRight className="text-gray-400" />
            </button>
          </div>
        )}
      </div>

      {/* Carousel Container */}
      <div 
        className="relative overflow-hidden"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        ref={carouselRef}
      >
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {posts.map((post, index) => (
            <div key={post._id || index} className="w-full flex-shrink-0">
              <div className="flex flex-col md:flex-row">
                {/* Post Image */}
                <div className="md:w-2/5 h-64 md:h-80 relative">
                  <img
                    src={post.image || '/placeholder-image.jpg'}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/placeholder-image.jpg';
                    }}
                  />
                  
                  {/* Trending Badge */}
                  <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                    <FaFire className="mr-1 text-xs" />
                    Trending
                  </div>

                  {/* Reading Time */}
                  <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-2 py-1  text-sm flex items-center">
                    <FaClock className="mr-1 text-xs" />
                    {post.readingTime || '5'} min read
                  </div>
                </div>

                {/* Post Content */}
                <div className="md:w-3/5 p-6 flex flex-col justify-between">
                  <div>
                    {/* Category */}
                    {post.category && (
                      <Link
                        to={`/category/${post.category.name}`}
                        className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-xs font-medium mb-3 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                      >
                        {post.category.name}
                      </Link>
                    )}

                    {/* Title */}
                    <Link
                      to={`/posts/${post.slug || post._id}`}
                      className="block group"
                    >
                      <h3 className="text-xl md:text-2xl font-bold text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                        {truncateText(post.title, 80)}
                      </h3>
                    </Link>

                    {/* Description */}
                    <p className="text-gray-400 mb-4 leading-relaxed">
                      {truncateText(post.description || post.excerpt || '', 150)}
                    </p>

                    {/* Author and Date */}
                    <div className="flex items-center mb-4">
                      <Link to={`/user/${post.author?._id}`} className="flex-shrink-0">
                        <img
                          src={post.author?.profilePicture || '/default-avatar.png'}
                          alt={post.author?.username || 'Author'}
                          className="w-8 h-8 rounded-full mr-3 hover:ring-2 hover:ring-blue-500 transition-all"
                          onError={(e) => {
                            e.target.src = '/default-avatar.png';
                          }}
                        />
                      </Link>
                      <div>
                        <Link 
                          to={`/user/${post.author?._id}`}
                          className="text-sm font-medium text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          {post.author?.username || 'Anonymous'}
                        </Link>
                        <p className="text-xs text-gray-400">
                          {formatDate(post.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Post Stats */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10 border-white/10">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center text-sm text-gray-400">
                        <FaEye className="mr-1" />
                        {post.views || 0}
                      </span>
                      <span className="flex items-center text-sm text-gray-400">
                        <FaHeart className="mr-1" />
                        {post.likes || 0}
                      </span>
                      <span className="flex items-center text-sm text-gray-400">
                        <FaComment className="mr-1" />
                        {post.commentsCount || 0}
                      </span>
                    </div>

                    <Link
                      to={`/posts/${post.slug || post._id}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2  text-sm font-medium transition-colors"
                    >
                      Read More
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots Indicator */}
      {posts.length > 1 && (
        <div className="flex justify-center items-center p-4 space-x-2">
          {posts.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-blue-600 scale-110'
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Auto-play indicator */}
      {posts.length > 1 && (
        <div className="absolute top-20 right-6 hidden md:block">
          <div className={`w-2 h-2 rounded-full ${isAutoPlaying ? 'bg-green-500' : 'bg-gray-400'}`} />
        </div>
      )}
    </div>
  );
};

TrendingCarousel.propTypes = {
  posts: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      excerpt: PropTypes.string,
      image: PropTypes.string,
      slug: PropTypes.string,
      views: PropTypes.number,
      likes: PropTypes.number,
      commentsCount: PropTypes.number,
      readingTime: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      createdAt: PropTypes.string,
      category: PropTypes.shape({
        name: PropTypes.string
      }),
      author: PropTypes.shape({
        username: PropTypes.string,
        profilePicture: PropTypes.string
      })
    })
  ),
  title: PropTypes.string
};

export default TrendingCarousel;
