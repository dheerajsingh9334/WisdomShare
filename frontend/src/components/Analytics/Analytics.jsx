import { useQuery } from '@tanstack/react-query';
import { userProfileAPI } from '../../APIServices/users/usersAPI';
import { usePlanAccess } from '../../hooks/usePlanAccess';
import PlanUpgradePrompt from '../Plans/PlanUpgradePrompt';
import { Link } from 'react-router-dom';
import { 
  FaEye, 
  FaThumbsUp, 
  FaComment, 
  FaCalendarAlt,
  FaGlobe,
  FaExternalLinkAlt,
  FaStar,
  FaFire
} from 'react-icons/fa';
import { SalesDashboard } from '../ui/live-sales-dashboard';

const Analytics = () => {
  
  const { data: userData, isLoading, error } = useQuery({
    queryKey: ["profile"],
    queryFn: userProfileAPI,
  });

  const { canAccessFeature, userPlan } = usePlanAccess();

  // Check if user can access analytics
  const canAccess = canAccessFeature("advancedAnalytics");

  if (!canAccess) {
    return (
      <div className="bg-transparent text-white py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <PlanUpgradePrompt 
            feature="Analytics"
            currentPlan={userPlan}
            requiredPlan="Premium"
            variant="default"
          />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-transparent text-white py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            <span className="ml-3 text-gray-400">Loading analytics...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-transparent text-white py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400">Failed to load analytics data. Please try again.</p>
          </div>
        </div>
      </div>
    );
  }

  const user = userData?.user;
  const posts = user?.posts || [];

  // Calculate analytics data from real user data
  const totalViews = posts.reduce((acc, post) => acc + (post.viewers?.length || 0), 0);
  const totalLikes = posts.reduce((acc, post) => acc + (post.likes?.length || 0), 0);
  const totalComments = posts.reduce((acc, post) => acc + (post.comments?.length || 0), 0);
  const totalFollowing = user?.following?.length || 0;
  const totalPosts = posts.length;

  return (
    <div className="bg-transparent text-white py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 uppercase tracking-tighter">
            📊 Advanced Analytics
          </h1>
          <p className="text-gray-500 text-sm uppercase tracking-widest">
            Content performance insights
          </p>
        </div>

        {/* Overview Stats with Links - Divide Grid Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-x divide-y divide-white/10 border border-white/10 bg-neutral-900/40 backdrop-blur-xl mb-8 overflow-hidden rounded-none">
          <Link to="/dashboard/posts" className="block p-8 hover:bg-white/5 transition-all group">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaEye className="h-8 w-8 text-white/50 group-hover:text-white group-hover:scale-110 transition-all" />
                <div className="ml-5">
                  <dt className="text-[10px] font-bold text-gray-500 truncate tracking-[0.2em] uppercase">
                    Total Views
                  </dt>
                  <dd className="text-3xl font-light text-white mt-1">
                    {totalViews.toLocaleString()}
                  </dd>
                </div>
              </div>
              <FaExternalLinkAlt className="h-3 w-3 text-gray-700 group-hover:text-white transition-colors" />
            </div>
          </Link>

          <Link to="/dashboard/posts" className="block p-8 hover:bg-white/5 transition-all group">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaThumbsUp className="h-8 w-8 text-white/50 group-hover:text-white group-hover:scale-110 transition-all" />
                <div className="ml-5">
                  <dt className="text-[10px] font-bold text-gray-500 truncate tracking-[0.2em] uppercase">
                    Total Likes
                  </dt>
                  <dd className="text-3xl font-light text-white mt-1">
                    {totalLikes.toLocaleString()}
                  </dd>
                </div>
              </div>
              <FaExternalLinkAlt className="h-3 w-3 text-gray-700 group-hover:text-white transition-colors" />
            </div>
          </Link>

          <Link to="/dashboard/posts" className="block p-8 hover:bg-white/5 transition-all group">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaComment className="h-8 w-8 text-white/50 group-hover:text-white group-hover:scale-110 transition-all" />
                <div className="ml-5">
                  <dt className="text-[10px] font-bold text-gray-500 truncate tracking-[0.2em] uppercase">
                    Total Comments
                  </dt>
                  <dd className="text-3xl font-light text-white mt-1">
                    {totalComments.toLocaleString()}
                  </dd>
                </div>
              </div>
              <FaExternalLinkAlt className="h-3 w-3 text-gray-700 group-hover:text-white transition-colors" />
            </div>
          </Link>
        </div>

        {/* Additional Stats with Links - Divide Grid Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-x divide-y divide-white/10 border border-white/10 bg-neutral-900/40 backdrop-blur-xl mb-8 overflow-hidden rounded-none">
          <Link to="/dashboard/posts" className="block p-6 hover:bg-white/5 transition-all group">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaCalendarAlt className="h-5 w-5 text-white/40 group-hover:text-white transition-all" />
                <div className="ml-4">
                  <dt className="text-[9px] font-bold text-gray-500 truncate tracking-widest uppercase">
                    Total Posts
                  </dt>
                  <dd className="text-xl font-bold text-white mt-1">
                    {totalPosts.toLocaleString()}
                  </dd>
                </div>
              </div>
              <FaExternalLinkAlt className="h-3 w-3 text-gray-800 group-hover:text-white transition-colors" />
            </div>
          </Link>

          <Link to="/dashboard/my-followings" className="block p-6 hover:bg-white/5 transition-all group">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaGlobe className="h-5 w-5 text-white/40 group-hover:text-white transition-all" />
                <div className="ml-4">
                  <dt className="text-[9px] font-bold text-gray-500 truncate tracking-widest uppercase">
                    Following
                  </dt>
                  <dd className="text-xl font-bold text-white mt-1">
                    {totalFollowing.toLocaleString()}
                  </dd>
                </div>
              </div>
              <FaExternalLinkAlt className="h-3 w-3 text-gray-800 group-hover:text-white transition-colors" />
            </div>
          </Link>
          
          <div className="p-6 hover:bg-white/5 transition-all group cursor-default">
            <div className="flex items-center">
               <FaStar className="h-5 w-5 text-white/40 group-hover:text-white transition-all" />
               <div className="ml-4">
                  <dt className="text-[9px] font-bold text-gray-500 truncate tracking-widest uppercase">
                    Plan Tier
                  </dt>
                  <dd className="text-xl font-bold text-white mt-1">
                    {typeof userPlan === 'object' ? userPlan?.planName : (userPlan || 'Free')}
                  </dd>
               </div>
            </div>
          </div>

          <div className="p-6 hover:bg-white/5 transition-all group cursor-default">
            <div className="flex items-center">
               <FaFire className="h-5 w-5 text-white/40 group-hover:text-white transition-all" />
               <div className="ml-4">
                  <dt className="text-[9px] font-bold text-gray-500 truncate tracking-widest uppercase">
                    Status
                  </dt>
                  <dd className="text-xl font-bold text-white mt-1">
                    Active
                  </dd>
               </div>
            </div>
          </div>
        </div>
        
        {/* Real-time Performance Tracking */}
        <div className="mb-8">
          <SalesDashboard 
            totalPosts={totalPosts}
            totalFollowing={totalFollowing}
            avgLikes={totalPosts > 0 ? totalLikes / totalPosts : 0}
            posts={posts.map(p => ({
              ...p,
              views: p.viewers?.length || 0,
              likesCount: p.likes?.length || 0,
              commentsCount: p.comments?.length || 0
            }))}
          />
        </div>
      </div>
    </div>
  );
};

export default Analytics;
