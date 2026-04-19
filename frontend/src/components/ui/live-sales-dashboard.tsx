import React, { FC, useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import { FileText, Users, Heart, Eye, MessageSquare, BarChart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PostData {
  _id: string;
  title: string;
  views: number;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  slug: string;
}

interface PerformanceDashboardProps {
  totalPosts: number;
  totalFollowing: number;
  avgLikes: number;
  posts: PostData[];
}

interface MetricCardProps {
  title: string;
  value: number | string;
  unit?: string;
  icon?: React.ReactNode;
  description?: string;
  valueClassName?: string;
}

const MetricCard: FC<MetricCardProps> = ({ title, value, unit = '', icon, description, valueClassName }) => (
  <Card className="flex-1 min-w-[200px] rounded-none bg-black/50 backdrop-blur-xl border-white/10">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-400">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className={`text-2xl font-bold ${valueClassName}`}>
        {unit}{typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
    </CardContent>
  </Card>
);

export const SalesDashboard: FC<PerformanceDashboardProps> = ({ 
  totalPosts = 0, 
  totalFollowing = 0, 
  avgLikes = 0, 
  posts = [] 
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Pagination logic
  const totalPages = Math.ceil(posts.length / itemsPerPage);
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return posts.slice(start, start + itemsPerPage);
  }, [posts, currentPage]);

  // Engagement Chart Data (using views/likes from last 10 posts)
  const chartData = useMemo(() => {
    return [...posts].slice(0, 10).reverse().map(post => ({
      name: post.title.length > 15 ? post.title.substring(0, 15) + '...' : post.title,
      views: post.views || 0,
      likes: post.likesCount || 0,
      comments: post.commentsCount || 0
    }));
  }, [posts]);

  // Theme-aware colors
  const isDark = true;
  const colors = {
    grid: isDark ? '#374151' : '#e5e7eb',
    axis: isDark ? '#9ca3af' : '#6b7280',
    tooltipBg: isDark ? '#1f2937' : '#ffffff',
    tooltipBorder: isDark ? '#374151' : '#d1d5db',
    tooltipText: isDark ? '#f9fafb' : '#111827',
  };

  return (
    <div className="w-full bg-black text-white flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Performance Overview</h1>
        <p className="text-gray-400">Detailed insights into your content engagement and reach.</p>
      </div>

      {/* Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Posts"
          value={totalPosts}
          icon={<FileText className="h-4 w-4 text-white/50" />}
          description="Total content pieces created"
          valueClassName="text-white"
        />
        <MetricCard
          title="Total Following"
          value={totalFollowing}
          icon={<Users className="h-4 w-4 text-white/50" />}
          description="People you are following"
          valueClassName="text-white"
        />
        <MetricCard
          title="Avg. Likes"
          value={avgLikes.toFixed(2)}
          icon={<Heart className="h-4 w-4 text-white/50" />}
          description="Average engagement per post"
          valueClassName="text-white"
        />
        <Card className="flex-1 min-w-[200px] rounded-none bg-black/50 backdrop-blur-xl border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Overall Reach</CardTitle>
            <Eye className="h-4 w-4 text-white/50" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {posts.reduce((sum, p) => sum + (p.views || 0), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total views across all time</p>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Chart */}
      <Card className="rounded-none bg-black/50 backdrop-blur-xl border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5 text-white/80" /> Recent Content Performance
          </CardTitle>
          <CardDescription>Comparison of engagement across your last 10 posts.</CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ width: '100%', height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} strokeOpacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  stroke={colors.axis} 
                  fontSize={10} 
                  tick={{ fontSize: 10 }} 
                />
                <YAxis stroke={colors.axis} fontSize={12} />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: colors.tooltipBg, 
                    borderColor: colors.tooltipBorder, 
                    borderRadius: '0px' 
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="views" stroke="#ffffff" strokeWidth={2} dot={{ r: 4 }} name="Views" />
                <Line type="monotone" dataKey="likes" stroke="#d1d5db" strokeWidth={2} dot={{ r: 4 }} name="Likes" />
                <Line type="monotone" dataKey="comments" stroke="#9ca3af" strokeWidth={2} dot={{ r: 4 }} name="Comments" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* All Posts Table Section */}
      <Card className="rounded-none bg-black/50 backdrop-blur-xl border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-white" /> Content Management
            </CardTitle>
            <CardDescription>Comprehensive list of all your published and draft posts.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 border border-white/20 hover:bg-white/10 disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium">Page {currentPage} of {totalPages || 1}</span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 border border-white/20 hover:bg-white/10 disabled:opacity-30 transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Title</th>
                  <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Views</th>
                  <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Likes</th>
                  <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Comments</th>
                  <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Published</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {paginatedPosts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-400">No posts found. Start writing!</td>
                  </tr>
                ) : (
                  paginatedPosts.map((post) => (
                    <tr key={post._id} className="hover:bg-white/5 transition-colors group">
                      <td className="p-4">
                        <Link to={`/post/${post.slug}`} className="font-medium text-white hover:text-white/60 transition-colors underline-offset-4 hover:underline">
                          {post.title}
                        </Link>
                      </td>
                      <td className="p-4 text-center">
                        <span className="flex items-center justify-center gap-1 text-white/70">
                          <Eye className="h-3 w-3" /> {post.views || 0}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="flex items-center justify-center gap-1 text-white/70">
                          <Heart className="h-3 w-3" /> {post.likesCount || 0}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="flex items-center justify-center gap-1 text-white/70">
                          <MessageSquare className="h-3 w-3" /> {post.commentsCount || 0}
                        </span>
                      </td>
                      <td className="p-4 text-right text-gray-400 text-sm">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
        <CardFooter className="pt-4 border-t border-white/10 text-xs text-gray-400">
          Showing {paginatedPosts.length} posts of {posts.length} total.
        </CardFooter>
      </Card>
    </div>
  );
};
