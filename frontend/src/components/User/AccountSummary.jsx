import { useQuery } from "@tanstack/react-query";
import {
  FaEye,
  FaUsers,
  FaThumbsUp,
  FaThumbsDown,
  FaFlag,
  FaCommentDots,
  FaBookmark,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { userProfileAPI } from "../../APIServices/users/usersAPI";
import { r } from "../../utils/unifiedResponsive";

const AccountSummaryDashboard = () => {
  const { data } = useQuery({
    queryKey: ["profile"],
    queryFn: userProfileAPI,
  });

  const userPosts = data?.user?.posts?.length || 0;
  const totalFollowing = data?.user?.following?.length || 0;
  const totalFollowers = data?.user?.followers?.length || 0;

  // Calculate stats
  let totalViews = 0;
  let totalLikes = 0;
  let totalDislikes = 0;
  let totalComments = 0;

  data?.user?.posts?.forEach((post) => {
    totalViews += post.viewers?.length || 0;
    totalLikes += post.likes?.length || 0;
    totalDislikes += post.dislikes?.length || 0;
    totalComments += post.comments?.length || 0;
  });

  const stats = [
    { icon: <FaEye />, label: "Views", value: totalViews, bgColor: "bg-neutral-900/40 backdrop-blur-xl border border-white/10" },
    { icon: <FaUsers />, label: "Followers", value: totalFollowers, bgColor: "bg-neutral-900/40 backdrop-blur-xl border border-white/10" },
    { icon: <FaThumbsUp />, label: "Likes", value: totalLikes, bgColor: "bg-neutral-900/40 backdrop-blur-xl border border-white/10" },
    { icon: <FaThumbsDown />, label: "Dislikes", value: totalDislikes, bgColor: "bg-neutral-900/40 backdrop-blur-xl border border-white/10" },
    { icon: <FaUsers />, label: "Following", value: totalFollowing, bgColor: "bg-neutral-900/40 backdrop-blur-xl border border-white/10" },
    { icon: <FaFlag />, label: "Posts", value: userPosts, bgColor: "bg-neutral-900/40 backdrop-blur-xl border border-white/10" },
    { icon: <FaCommentDots />, label: "Comments", value: totalComments, bgColor: "bg-neutral-900/40 backdrop-blur-xl border border-white/10" },
    { icon: <FaBookmark />, label: "Saved Posts", value: data?.user?.savedPosts?.length || 0, bgColor: "bg-neutral-900/40 backdrop-blur-xl border border-white/10" },
  ];

  return (
    <div className={`${r.spacing.containerSmall} space-y-4 sm:space-y-6`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className={`${r.text.h1} font-bold text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]`}>
          Welcome back, <span className="text-blue-400">{data?.user?.username}</span>! 👋
        </h1>
      </div>

      {/* Quick Actions Grid */}
      <div className="bg-neutral-900/40 backdrop-blur-xl border border-white/10 text-white shadow-2xl p-3 sm:p-4 md:p-6">
        <h3 className={`${r.text.h4} font-semibold text-white mb-3 sm:mb-4`}>
          Quick Actions
        </h3>
        <div className={`${r.layout.grid3} gap-3 sm:gap-4`}>
          <Link to="/dashboard/create-post" className="p-3 sm:p-4 border border-blue-500/20 bg-blue-900/10 hover:bg-blue-900/20 backdrop-blur-md transition-all duration-200">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <span className="text-xl sm:text-2xl">✍️</span>
            </div>
            <h4 className={`font-semibold text-white mb-1 ${r.text.bodySmall}`}>
              Create Post
            </h4>
            <p className={`${r.text.bodySmall} text-gray-400 mb-2 sm:mb-3`}>
              Share your thoughts with the community
            </p>
            <div className="inline-block w-full text-center px-3 sm:px-4 py-2 glass-premium-button transition duration-200">
              Create
            </div>
          </Link>

          <Link to="/dashboard/analytics" className="p-3 sm:p-4 border border-blue-500/20 bg-blue-900/10 hover:bg-blue-900/20 backdrop-blur-md transition-all duration-200">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <span className="text-xl sm:text-2xl">📊</span>
            </div>
            <h4 className={`font-semibold text-white mb-1 ${r.text.bodySmall}`}>
              Analytics
            </h4>
            <p className={`${r.text.bodySmall} text-gray-400 mb-2 sm:mb-3`}>
              View your content performance
            </p>
            <div className="inline-block w-full text-center px-3 sm:px-4 py-2 glass-premium-button transition duration-200">
              View
            </div>
          </Link>

          <Link to="/dashboard/posts" className="p-3 sm:p-4 border border-blue-500/20 bg-blue-900/10 hover:bg-blue-900/20 backdrop-blur-md transition-all duration-200">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <span className="text-xl sm:text-2xl">📝</span>
            </div>
            <h4 className={`font-semibold text-white mb-1 ${r.text.bodySmall}`}>
              My Posts
            </h4>
            <p className={`${r.text.bodySmall} text-gray-400 mb-2 sm:mb-3`}>
              Manage your published content
            </p>
            <div className="inline-block w-full text-center px-3 sm:px-4 py-2 glass-premium-button transition duration-200">
              Manage
            </div>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={`${r.layout.grid4} gap-3 sm:gap-4`}>
        {stats.map((stat, index) => (
          <div key={index} className={`${stat.bgColor} text-white  shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow duration-200`}>
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="text-xl sm:text-2xl">{stat.icon}</div>
              <div>
                <div className={`${r.text.h3} font-semibold`}>{stat.value}</div>
                <div className={`${r.text.bodySmall} opacity-90`}>{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccountSummaryDashboard;
