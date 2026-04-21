import { useState, useEffect, useMemo, useCallback } from "react";
import * as HeroIcons from "@heroicons/react/24/outline";
import {
  FaPen,
  FaBell,
  FaSun,
  FaMoon,
  FaBars,
  FaTimes,
  FaLock,
} from "react-icons/fa";
const {
  Cog6ToothIcon,
  HomeIcon,
  BellIcon,
  BookOpenIcon,
  UserGroupIcon,
  CheckIcon,
  BookmarkIcon,
  ChartBarIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  DocumentTextIcon,
  TrophyIcon,
} = HeroIcons;
import { Link, useLocation, Outlet } from "react-router-dom";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getUserPlanAndUsageAPI,
  getUserStatsAPI,
  logoutAPI,
} from "../../APIServices/users/usersAPI";
import { getUserPublishedPostsAPI } from "../../APIServices/posts/postsAPI";
import { useNotifications } from "../../contexts/NotificationContext";
import { logout } from "../../redux/slices/authSlices";
import { useDarkMode } from "../Navbar/DarkModeContext";
import { hasFeatureAccess } from "../../utils/planUtils";
import SearchBar from "../Search/SearchBar";
import UserPlanStatus from "../Navbar/UserPlanStatus";
import { lazy, Suspense } from "react";

const MiniAnalyticsChart = lazy(() => import("./MiniAnalyticsChart"));
import GlobalBackground from "../ui/GlobalBackground";


const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: HomeIcon,
    current: false,
    feature: null,
    protected: true,
  },
  {
    name: "Create Post",
    href: "/dashboard/create-post",
    icon: FaPen,
    current: false,
    feature: null,
    protected: true,
  },
  {
    name: "My Posts",
    href: "/dashboard/posts",
    icon: BookOpenIcon,
    current: false,
    feature: null,
    protected: true,
  },
  {
    name: "Post Management",
    href: "/dashboard/post-management",
    icon: Cog6ToothIcon,
    current: false,
    feature: null,
    protected: true,
  },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: ChartBarIcon,
    current: false,
    feature: "advancedAnalytics",
    protected: true,
  },
  {
    name: "Saved Posts",
    href: "/saved-posts",
    icon: BookmarkIcon,
    current: false,
    feature: null,
    protected: true,
  },
  {
    name: "Followers",
    href: "/dashboard/my-followers",
    icon: UserGroupIcon,
    current: false,
    feature: null,
    protected: true,
  },
  {
    name: "Following",
    href: "/dashboard/my-followings",
    icon: UserGroupIcon,
    current: false,
    feature: null,
    protected: true,
  },
  {
    name: "Trending",
    href: "/trending",
    icon: SparklesIcon,
    current: false,
    feature: null,
    protected: false,
  },
  {
    name: "AI Studio",
    href: "/ai-studio",
    icon: SparklesIcon,
    current: false,
    feature: null,
    protected: false,
  },
  {
    name: "All Posts",
    href: "/posts",
    icon: DocumentTextIcon,
    current: false,
    feature: null,
    protected: false,
  },
  {
    name: "Live Tracker",
    href: "/demo",
    icon: ChartBarIcon,
    current: false,
    feature: null,
    protected: false,
  },
  {
    name: "Rankings",
    href: "/ranking",
    icon: TrophyIcon,
    current: false,
    feature: null,
    protected: false,
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

// Get user initials for profile picture fallback
const getUserInitials = (user) => {
  if (!user) return "U";

  const name = user.name || user.username || "";
  if (name.length === 0) return "U";

  const names = name.split(" ");
  if (names.length >= 2) {
    return `${names[0][0]}${names[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

/**
 * @param {{ userAuth: boolean, children: React.ReactNode }} props
 */
// eslint-disable-next-line react/prop-types
export default function GlobalLayout({ userAuth, children }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [navbarSidebarOpen, setNavbarSidebarOpen] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { userAuth: authUser } = useSelector((state) => state.auth);
  const { darkMode, toggleDarkMode } = useDarkMode();

  // Use shared notification context - no more duplicate API calls!
  const { unreadCount } = useNotifications();

  // Get user's current plan with optimized settings
  const { data: usageData } = useQuery({
    queryKey: ["user-plan-usage"],
    queryFn: getUserPlanAndUsageAPI,
    enabled: !!userAuth,
    refetchInterval: 300000,
    staleTime: 240000, // 4 minutes
    cacheTime: 600000, // 10 minutes
  });

  // Access the auth status query state
  const { isLoading: authLoading } = useQuery({
    queryKey: ["user-auth"],
    enabled: false, // Don't trigger a new fetch, just read existing cache
  });

  // Fetch user's lightweight stats for mini analytics
  const { data: userStats = {} } = useQuery({
    queryKey: ["user-stats-mini", userAuth?._id],
    queryFn: getUserStatsAPI,
    enabled: !!userAuth?._id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Calculate mini analytics - simplified to use direct stats
  const miniAnalytics = useMemo(() => {
    return {
      totalPosts: userStats?.totalPosts || 0,
      totalViews: userStats?.totalViews || 0,
      totalLikes: userStats?.totalLikes || 0,
      totalComments: userStats?.totalComments || 0,
      recentData: userStats?.recentData || [],
    };
  }, [userStats]);

  // Memoize computed values
  const currentPlan = useMemo(
    () => usageData?.usage?.plan,
    [usageData?.usage?.plan],
  );
  const hasFreePlan = useMemo(
    () =>
      currentPlan &&
      (currentPlan.tier === "free" || currentPlan.planName === "Free"),
    [currentPlan],
  );

  // Memoize navigation items with access control
  const accessibleNavigation = useMemo(() => {
    const userPlan = usageData?.usage?.plan;
    return navigation.map((item) => {
      // Logic for feature access (paywall)
      const hasPlanAccess =
        !item.feature || hasFeatureAccess(userPlan, item.feature);

      // Logic for visibility (auth)
      const isVisibleForUser = !item.protected || userAuth;

      return {
        ...item,
        hasAccess: hasPlanAccess,
        isVisible: isVisibleForUser,
        current: location.pathname === item.href,
      };
    });
  }, [usageData?.usage?.plan, location.pathname, userAuth]);

  // Memoized logout handler
  const handleLogout = useCallback(async () => {
    try {
      // Clear local state first
      setDropdownOpen(false);
      setNavbarSidebarOpen(false);

      // Call logout API
      await logoutAPI();

      // Clear Redux store and React Query cache
      dispatch(logout());
      queryClient.clear();
      queryClient.invalidateQueries();

      // Clear any local storage items
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Force a hard redirect to clear all state
      window.location.replace("/");
    } catch (error) {
      console.error("Logout error:", error);

      // Even if API call fails, clear local state
      setDropdownOpen(false);
      setNavbarSidebarOpen(false);
      dispatch(logout());
      queryClient.clear();
      queryClient.invalidateQueries();
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Force redirect anyway
      window.location.replace("/");
    }
  }, [dispatch, queryClient]);

  // Memoize layout calculations
  const layoutConfig = useMemo(() => {
    const isTrendingPage = location.pathname.startsWith("/trending");
    const isPostsList =
      location.pathname === "/posts" || location.pathname.startsWith("/posts");
    const isDashboard = location.pathname.startsWith("/dashboard");
    const isAnalytics = location.pathname.includes("/analytics");

    // Only shift content on desktop when sidebar is open (lg screens and up)
    const shouldShiftContent = false; // Never shift content for navbar
    const shouldShiftContentDesktop = navbarSidebarOpen; // Only for main content on desktop

    return {
      isTrendingPage,
      isPostsList,
      isDashboard,
      isAnalytics,
      shouldShiftContent,
      shouldShiftContentDesktop,
      showOverlay: navbarSidebarOpen, // Always show overlay on mobile when sidebar is open
    };
  }, [location.pathname, navbarSidebarOpen]);

  // Close navbar sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside the sidebar and not on the toggle button
      const sidebar = document.querySelector("[data-sidebar]");
      const isToggleClick = event.target.closest("[data-sidebar-toggle]");

      if (
        navbarSidebarOpen &&
        sidebar &&
        !sidebar.contains(event.target) &&
        !isToggleClick
      ) {
        setNavbarSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [navbarSidebarOpen]);

  return (
    <div
      className="min-h-screen bg-transparent flex relative"
      style={{
        "--sidebar-width": navbarSidebarOpen ? "16rem" : "0rem",
        "--sidebar-width-sm": navbarSidebarOpen ? "12rem" : "0rem",
        "--sidebar-width-md": navbarSidebarOpen ? "14rem" : "0rem",
        "--sidebar-width-lg": navbarSidebarOpen ? "16rem" : "0rem",
        "--sidebar-width-xl": navbarSidebarOpen ? "18rem" : "0rem",
      }}
    >
      <GlobalBackground />
      {/* Sidebar Overlay - show on mobile when sidebar is open */}
      {layoutConfig.showOverlay && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setNavbarSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar - Enhanced responsive design */}
      <div
        data-sidebar
        className={`fixed inset-y-0 left-0 z-50 w-40 sm:w-48 md:w-56 lg:w-64 xl:w-72 bg-neutral-900/40 backdrop-blur-3xl border-r border-white/10 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          navbarSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-3 sm:px-4 lg:px-6 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">
            Navigation
          </h3>
          <button
            onClick={() => setNavbarSidebarOpen(false)}
            className="p-2  text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 transition-colors lg:hidden"
            title="Close Sidebar"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar Content */}
        <div
          className="flex-1 overflow-y-auto h-full"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#10b981 #374151" }}
        >
          <div className="px-3 sm:px-4 lg:px-6 py-4">
            {/* Main Navigation */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Main Navigation
              </h3>
              <div className="space-y-1">
                {accessibleNavigation.map((item) => {
                  if (!item.isVisible) return null;
                  if (item.hasAccess) {
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={classNames(
                          item.current
                            ? "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                            : "text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-green-600",
                          "group flex items-center px-2 sm:px-3 py-2 text-sm font-medium  transition-all duration-200",
                        )}
                      >
                        <item.icon
                          className={classNames(
                            item.current
                              ? "text-green-600"
                              : "text-gray-400 group-hover:text-green-600",
                            "h-5 w-5 mr-2 sm:mr-3",
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                        {item.current && (
                          <CheckIcon
                            className="h-5 w-5 text-green-500 ml-auto"
                            aria-hidden="true"
                          />
                        )}
                      </Link>
                    );
                  }

                  return (
                    <div
                      key={item.name}
                      className="group flex items-center justify-between px-2 sm:px-3 py-2 text-sm font-medium  opacity-50 cursor-not-allowed"
                    >
                      <div className="flex items-center">
                        <item.icon
                          className="h-5 w-5 mr-2 sm:mr-3 text-gray-400"
                          aria-hidden="true"
                        />
                        {item.name}
                      </div>
                      <FaLock className="h-3 w-3 text-gray-400" />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Plan Management */}
            {userAuth && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Plan Management
                </h3>
                <div className="space-y-1">
                  <Link
                    to="/plan-management"
                    className="group flex items-center px-2 sm:px-3 py-2 text-sm font-medium  transition-all duration-200 text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-green-600"
                  >
                    <CreditCardIcon className="mr-2 sm:mr-3 h-5 w-5 text-gray-400 group-hover:text-green-600" />
                    Manage Plans
                  </Link>
                  {hasFreePlan && (
                    <Link
                      to="/upgrade"
                      className="group flex items-center px-2 sm:px-3 py-2 text-sm font-medium  transition-all duration-200 text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-green-600"
                    >
                      <SparklesIcon className="mr-2 sm:mr-3 h-5 w-5 text-gray-400 group-hover:text-green-600" />
                      Upgrade to Pro
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            {userAuth && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Quick Actions
                </h3>
                <div className="space-y-1">
                  <Link
                    to="/dashboard/notifications"
                    className="group flex items-center justify-between px-2 sm:px-3 py-2 text-sm font-medium  transition-all duration-200 text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-green-600"
                  >
                    <span className="flex items-center">
                      <BellIcon className="mr-2 sm:mr-3 h-5 w-5 text-gray-400 group-hover:text-green-600" />
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/30 px-2 py-1 text-xs font-medium text-red-800 dark:text-red-400">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/dashboard/settings"
                    className="group flex items-center px-2 sm:px-3 py-2 text-sm font-medium  transition-all duration-200 text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-green-600"
                  >
                    <Cog6ToothIcon className="mr-2 sm:mr-3 h-5 w-5 text-gray-400 group-hover:text-green-600" />
                    Settings
                  </Link>
                </div>
              </div>
            )}

            {/* Mini Analytics Widget */}
            {userAuth && miniAnalytics.totalPosts > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Quick Stats
                </h3>
                <div className="bg-neutral-900/40 backdrop-blur-xl border border-white/10  p-4 space-y-3">
                  {/* Stats Grid - 2x2 layout for better fit */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">
                        {miniAnalytics.totalPosts}
                      </div>
                      <div className="text-xs text-gray-400">
                        Posts
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">
                        {miniAnalytics.totalViews}
                      </div>
                      <div className="text-xs text-gray-400">
                        Views
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">
                        {miniAnalytics.totalLikes}
                      </div>
                      <div className="text-xs text-gray-400">
                        Likes
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">
                        {miniAnalytics.totalComments}
                      </div>
                      <div className="text-xs text-gray-400">
                        Comments
                      </div>
                    </div>
                  </div>

                  {/* Mini Chart */}
                  {miniAnalytics.recentData.length > 0 && (
                    <Suspense fallback={<div className="h-16 w-full bg-white/5 animate-pulse" />}>
                      <MiniAnalyticsChart data={miniAnalytics.recentData} />
                    </Suspense>
                  )}


                  {/* Quick Link to Full Analytics */}
                  <Link
                    to="/dashboard/analytics"
                    className="block w-full text-center text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
                  >
                    View Full Analytics →
                  </Link>
                </div>
              </div>
            )}

            {/* User Profile Section */}
            {authUser && (
              <div className="border-t border-white/10 border-white/10 pt-4">
                <div className="flex items-center">
                  <img
                    className="h-10 w-10 rounded-full object-cover"
                    src={
                      authUser.profilePicture?.url ||
                      authUser.profilePicture?.path ||
                      authUser.profilePicture ||
                      "https://via.placeholder.com/150"
                    }
                    alt="User profile"
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-300">
                      {authUser.name || authUser.username}
                    </p>
                    <p className="text-xs text-gray-400">
                      @{authUser.username}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area - Enhanced responsive layout */}
      <div
        className={`transition-all duration-300 ease-in-out flex-1 min-h-screen ${
          layoutConfig.shouldShiftContentDesktop ? "lg:ml-64 xl:ml-72" : ""
        }`}
      >
        {/* Navbar - Fixed Header without sidebar offset */}
        <nav className="hidden lg:block fixed top-0 left-0 right-0 z-50 bg-neutral-900/40 backdrop-blur-3xl border-b border-white/10 transition-all duration-300 ease-in-out">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Left: Logo and Navbar Sidebar Toggle */}
              <div className="flex items-center space-x-4">
                {/* Navbar Sidebar Toggle Button */}
                <button
                  onClick={() => setNavbarSidebarOpen(!navbarSidebarOpen)}
                  className="p-2  text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                  title={navbarSidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
                  data-sidebar-toggle
                >
                  {navbarSidebarOpen ? (
                    <FaTimes className="h-5 w-5" />
                  ) : (
                    <FaBars className="h-5 w-5" />
                  )}
                </button>

                {/* Logo */}
                <Link
                  to="/posts"
                  className="text-xl font-serif font-bold text-white hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  WisdomShare
                </Link>
              </div>

              {/* Center: Search Bar */}
              <div className="hidden md:flex flex-1 max-w-md mx-4">
                <SearchBar placeholder="Search posts, users, or content..." />
              </div>

              {/* Center: Main Navigation (visible on lg and up) */}
              <div className="hidden lg:flex items-center space-x-6">
                <Link
                  to="/posts"
                  className="text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 transition-colors"
                >
                  Posts
                </Link>
                <Link
                  to="/plan-management"
                  className="text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 transition-colors"
                >
                  Plan Management
                </Link>
                <Link
                  to="/ranking"
                  className="text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 transition-colors"
                >
                  Ranking
                </Link>
                {/* Removed Free Plan link from navbar */}
              </div>

              {/* Right: Actions */}
              <div className="flex items-center space-x-4">
                {authLoading ? (
                  <div className="flex items-center space-x-2 animate-pulse">
                    <div className="h-8 w-8 bg-gray-700 rounded-full"></div>
                    <div className="h-4 w-20 bg-gray-700 rounded"></div>
                  </div>
                ) : userAuth ? (
                  <>
                    {/* User Plan Status */}
                    <UserPlanStatus />

                    <Link
                      to="/dashboard/create-post"
                      className="hidden md:flex items-center text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 p-2  hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      title="Write Post"
                    >
                      <FaPen className="w-4 h-4" />
                    </Link>

                    <Link
                      to="/dashboard/notifications"
                      className="relative text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400"
                    >
                      <FaBell />
                      {unreadCount > 0 && (
                        <span className="absolute -top-2 -right-2 h-5 min-w-5 px-1 bg-red-600 text-white text-xs rounded-full flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </Link>

                    {/* Dark mode toggle */}
                    <button
                      onClick={toggleDarkMode}
                      className="p-2 rounded-full text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400"
                    >
                      {darkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
                    </button>

                    {/* User dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center space-x-2 text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400"
                      >
                        {authUser?.profilePicture ? (
                          <img
                            className="h-8 w-8 rounded-full object-cover border-2 border-white border-white/10"
                            src={
                              authUser?.profilePicture?.url ||
                              authUser?.profilePicture?.path ||
                              authUser?.profilePicture ||
                              "https://via.placeholder.com/32"
                            }
                            alt="User profile"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextElementSibling.style.display =
                                "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className={`h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center border-2 border-white border-white/10 ${authUser?.profilePicture ? "hidden" : "flex"}`}
                          style={{
                            display: authUser?.profilePicture ? "none" : "flex",
                          }}
                        >
                          <span className="text-xs text-white font-medium">
                            {getUserInitials(authUser)}
                          </span>
                        </div>
                        <span className="hidden md:block">
                          {authUser?.name || authUser?.username}
                        </span>
                      </button>

                      {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-black/50 backdrop-blur-xl border border-white/10 text-white  shadow-lg py-1 z-50">
                          <Link
                            to="/profile"
                            className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setDropdownOpen(false)}
                          >
                            Profile
                          </Link>
                          <Link
                            to="/dashboard/settings"
                            className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setDropdownOpen(false)}
                          >
                            Settings
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Logout
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Link
                      to="/login"
                      className="text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="bg-green-600 text-white px-4 py-2  hover:bg-green-700 transition-colors"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <div className="pt-16 lg:pt-16">
          <main className="min-h-screen">
            {/* Upgrade banner removed for Free plan users */}

            {/* Page Content - Improved responsive layout */}
            <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
              <div className="w-full max-w-none overflow-hidden">
                {children || <Outlet />}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Navbar - Only visible on small devices */}
      <nav className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-neutral-900/40 backdrop-blur-3xl text-white border-b border-white/10 shadow-lg">
        <div className="px-3 sm:px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Sidebar Toggle and Logo */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Navbar Sidebar Toggle Button for Mobile */}
              {userAuth && (
                <button
                  onClick={() => setNavbarSidebarOpen(!navbarSidebarOpen)}
                  className="navbar-sidebar p-2  text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title={
                    navbarSidebarOpen
                      ? "Close Navigation Menu"
                      : "Open Navigation Menu"
                  }
                  aria-expanded={navbarSidebarOpen}
                  data-sidebar-toggle
                >
                  {navbarSidebarOpen ? (
                    <FaTimes className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <FaBars className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </button>
              )}

              <Link
                to="/posts"
                className="text-base sm:text-lg font-serif font-bold text-white hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                WisdomShare
              </Link>
            </div>

            {/* Center: Search Bar - Always visible */}
            <div className="flex-1 max-w-xs mx-2 sm:mx-4">
              <SearchBar placeholder="Search posts, users..." />
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              {userAuth ? (
                <>
                  {/* User Plan Status - Compact for mobile */}
                  <div className="hidden sm:block">
                    <UserPlanStatus />
                  </div>

                  {/* Write Button */}
                  <Link
                    to="/dashboard/create-post"
                    className="p-2  text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="Write Post"
                  >
                    <FaPen className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Link>

                  {/* Notifications */}
                  <Link
                    to="/dashboard/notifications"
                    className="relative p-2  text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="Notifications"
                  >
                    <FaBell className="w-3 h-3 sm:w-4 sm:h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 min-w-3 sm:min-w-4 px-1 bg-red-600 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </Link>

                  {/* Dark mode toggle */}
                  <button
                    onClick={toggleDarkMode}
                    className="p-2  text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title={darkMode ? "Light Mode" : "Dark Mode"}
                  >
                    {darkMode ? (
                      <FaSun className="w-3 h-3 sm:w-4 sm:h-4" />
                    ) : (
                      <FaMoon className="w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                  </button>

                  {/* User Profile - Compact */}
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center p-2  text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      title="Profile Menu"
                    >
                      {authUser?.profilePicture ? (
                        <img
                          className="h-6 w-6 sm:h-7 sm:w-7 rounded-full object-cover border-2 border-white border-white/10"
                          src={
                            authUser?.profilePicture?.url ||
                            authUser?.profilePicture?.path ||
                            authUser?.profilePicture ||
                            "https://via.placeholder.com/32"
                          }
                          alt="User profile"
                        />
                      ) : (
                        <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center border-2 border-white border-white/10">
                          <span className="text-xs text-white font-medium">
                            {getUserInitials(authUser)}
                          </span>
                        </div>
                      )}
                    </button>

                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-black/50 backdrop-blur-xl border border-white/10 text-white  shadow-lg border border-white/10 border-white/10 py-2 z-50">
                        <div className="px-3 sm:px-4 py-2 border-b border-white/10 border-white/10">
                          <p className="text-xs sm:text-sm font-medium text-white truncate">
                            {authUser?.name || authUser?.username}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            @{authUser?.username}
                          </p>
                        </div>
                        <Link
                          to="/dashboard/profile"
                          className="block px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setDropdownOpen(false)}
                        >
                          Profile
                        </Link>
                        <Link
                          to="/dashboard/settings"
                          className="block px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setDropdownOpen(false)}
                        >
                          Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 text-xs sm:text-sm px-2 sm:px-3 py-2  hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-green-600 text-white px-2 sm:px-3 py-2  text-xs sm:text-sm hover:bg-green-700 transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
