import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { checkAuthStatusAPI } from "./APIServices/users/usersAPI";
import { checkAdminAuthStatusAPI } from "./APIServices/admin/adminAuthAPI";
import { useQuery } from "@tanstack/react-query";
import { isAuthenticated } from "./redux/slices/authSlices";
import { adminAuthStatus } from "./redux/slices/adminAuthSlice";
import { useEffect, lazy, Suspense } from "react";
import AuthRoute from "./components/AuthRoute/AuthRoute";
import GlobalLayout from "./components/User/GlobalLayout";
import { DarkModeProvider } from "./components/Navbar/DarkModeContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import AdminAuthRoute from "./components/Admin/AdminAuthRoute";
import AdminGlobalLayout from "./components/Admin/AdminGlobalLayout";

// Lazy loaded components
const CreatePost = lazy(() => import("./components/Posts/CreatePost"));
const UpdatePost = lazy(() => import("./components/Posts/UpdatePost"));
const AccountSummaryDashboard = lazy(() => import("./components/User/AccountSummary"));
const Pricing = lazy(() => import("./components/Plans/Pricing"));
const PlanManagement = lazy(() => import("./components/Plans/PlanManagement"));
const CheckoutForm = lazy(() => import("./components/Plans/CheckoutForm"));
const PaymentSuccess = lazy(() => import("./components/Plans/PaymentSuccess"));
const PayingFreePlan = lazy(() => import("./components/Plans/PayingFreePlan"));
const PostLimitReached = lazy(() => import("./components/Plans/PostLimitReached"));
const ResetPassword = lazy(() => import("./components/User/ResetPassword"));
const Rankings = lazy(() => import("./components/User/CreatorsRanking"));
const Notifications = lazy(() => import("./components/Notification/Notifications"));
const MyFollowing = lazy(() => import("./components/User/MyFollowing"));
const MyFollowers = lazy(() => import("./components/User/MyFollowers"));
const DashboardPosts = lazy(() => import("./components/User/DashboardPosts"));
const DashboardDrafts = lazy(() => import("./components/User/DashboardDrafts"));
const DashboardScheduled = lazy(() => import("./components/User/DashboardScheduled"));
const Settings = lazy(() => import("./components/User/SettingsPage"));
const AddEmailComponent = lazy(() => import("./components/User/UpdateEmail"));
const UploadProfilePic = lazy(() => import("./components/User/UploadProfilePic"));
const AccountVerification = lazy(() => import("./components/User/AccountVerification"));
const PostsList = lazy(() => import("./components/Posts/PostsList"));
const PostDetails = lazy(() => import("./components/Posts/PostDetails"));
const Login = lazy(() => import("./components/User/Login"));
const Register = lazy(() => import("./components/User/Register"));
const GoogleLoginError = lazy(() => import("./components/User/GoogleLoginError"));
const Profile = lazy(() => import("./components/User/Profile"));
const TrendingPosts = lazy(() => import("./components/Posts/TrendingPosts"));
const SavedPosts = lazy(() => import("./components/Posts/SavedPosts"));
const UserProfile = lazy(() => import("./components/User/UserProfile"));
const UserFollowers = lazy(() => import("./components/User/UserFollowers"));
const UserFollowing = lazy(() => import("./components/User/UserFollowing"));
const SearchResults = lazy(() => import("./components/Search/SearchResults"));
const Analytics = lazy(() => import("./components/Analytics/Analytics"));
const MyPostsAnalytics = lazy(() => import("./components/Posts/MyPostsAnalytics"));
const UserPostManagement = lazy(() => import("./components/Posts/PostManagement"));
const ContentCalendar = lazy(() => import("./components/Calendar/ContentCalendar"));
const ChatPage = lazy(() => import("./components/Chat/ChatPage"));
const AIStudio = lazy(() => import("./components/AI/AIStudio"));
const AdminAuthLogin = lazy(() => import("./components/Admin/AdminAuthLogin"));
const AdminAuthRegister = lazy(() => import("./components/Admin/AdminAuthRegister"));
const AdminMainDashboard = lazy(() => import("./components/Admin/AdminMainDashboard"));
const AdminAnalytics = lazy(() => import("./components/Admin/AdminAnalytics"));
const UserManagement = lazy(() => import("./components/Admin/UserManagement"));
const PostManagement = lazy(() => import("./components/Admin/PostManagement"));
const CommentManagement = lazy(() => import("./components/Admin/CommentManagement"));
const CategoryManagement = lazy(() => import("./components/Admin/CategoryManagement"));
const NotificationManagement = lazy(() => import("./components/Admin/NotificationManagement"));
const SystemSettings = lazy(() => import("./components/Admin/SystemSettings"));
const AdminProfile = lazy(() => import("./components/Admin/AdminProfile"));

// Fallback component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-black text-white flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-400">Loading...</p>
    </div>
  </div>
);

function App() {
  const { data: userData, isLoading: authLoading } = useQuery({
    queryKey: ["user-auth"],
    queryFn: checkAuthStatusAPI,
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true, // Always check auth status
    refetchOnMount: true, // Refetch on mount to ensure fresh data
  });

  const { data: adminData } = useQuery({
    queryKey: ["admin-auth-status"],
    queryFn: checkAdminAuthStatusAPI,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
    enabled: false, // Don't auto-fetch, let AdminAuthRoute handle it
  });

  const dispatch = useDispatch();

  useEffect(() => {
    if (userData) {
      dispatch(isAuthenticated(userData));
    }
  }, [userData, dispatch]);

  useEffect(() => {
    if (adminData && adminData.success && adminData.admin) {
      // Only set admin auth status if we have valid admin data
      dispatch(adminAuthStatus(adminData.admin));
    } else if (adminData && !adminData.success) {
      // Clear admin auth status if the API returns failure
      dispatch(adminAuthStatus(null));
    }
  }, [adminData, dispatch]);

  const { userAuth } = useSelector((state) => state.auth);

  // Show loading state while checking authentication
  if (authLoading) {
    return <LoadingSpinner />;
  }

  return (
    <DarkModeProvider>
      <NotificationProvider>
        <div className="min-h-screen bg-black text-white transition-colors duration-300">
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Admin Routes - MUST come first to avoid conflicts */}
                <Route
                  path="/admin"
                  element={<Navigate to="/admin/auth/login" replace />}
                />
                <Route path="/admin/auth/login" element={<AdminAuthLogin />} />
                {/* Test route to debug admin routing */}
                <Route
                  path="/admin-test"
                  element={<div>Admin Test Route Working!</div>}
                />
                <Route
                  path="/admin/auth/register"
                  element={<AdminAuthRegister />}
                />
                <Route
                  path="/admin/dashboard"
                  element={
                    <AdminAuthRoute>
                      <AdminGlobalLayout>
                        <AdminMainDashboard />
                      </AdminGlobalLayout>
                    </AdminAuthRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <AdminAuthRoute>
                      <AdminGlobalLayout>
                        <UserManagement />
                      </AdminGlobalLayout>
                    </AdminAuthRoute>
                  }
                />
                <Route
                  path="/admin/posts"
                  element={
                    <AdminAuthRoute>
                      <AdminGlobalLayout>
                        <PostManagement />
                      </AdminGlobalLayout>
                    </AdminAuthRoute>
                  }
                />
                <Route
                  path="/admin/comments"
                  element={
                    <AdminAuthRoute>
                      <AdminGlobalLayout>
                        <CommentManagement />
                      </AdminGlobalLayout>
                    </AdminAuthRoute>
                  }
                />

                <Route
                  path="/admin/categories"
                  element={
                    <AdminAuthRoute>
                      <AdminGlobalLayout>
                        <CategoryManagement />
                      </AdminGlobalLayout>
                    </AdminAuthRoute>
                  }
                />
                <Route
                  path="/admin/plans"
                  element={
                    <AdminAuthRoute>
                      <AdminGlobalLayout>
                        <PlanManagement />
                      </AdminGlobalLayout>
                    </AdminAuthRoute>
                  }
                />
                <Route
                  path="/admin/notifications"
                  element={
                    <AdminAuthRoute>
                      <AdminGlobalLayout>
                        <NotificationManagement />
                      </AdminGlobalLayout>
                    </AdminAuthRoute>
                  }
                />
                <Route
                  path="/admin/settings"
                  element={
                    <AdminAuthRoute>
                      <AdminGlobalLayout>
                        <SystemSettings />
                      </AdminGlobalLayout>
                    </AdminAuthRoute>
                  }
                />
                <Route
                  path="/admin/analytics"
                  element={
                    <AdminAuthRoute>
                      <AdminGlobalLayout>
                        <AdminAnalytics />
                      </AdminGlobalLayout>
                    </AdminAuthRoute>
                  }
                />

                {/* Admin Profile Route */}
                <Route
                  path="/admin/profile"
                  element={
                    <AdminAuthRoute>
                      <AdminGlobalLayout>
                        <AdminProfile />
                      </AdminGlobalLayout>
                    </AdminAuthRoute>
                  }
                />

                {/* Public routes without GlobalLayout */}
                <Route
                  element={
                    <GlobalLayout userAuth={userAuth}>
                      <Login />
                    </GlobalLayout>
                  }
                  path="/login"
                />
                <Route
                  element={
                    <GlobalLayout userAuth={userAuth}>
                      <Register />
                    </GlobalLayout>
                  }
                  path="/register"
                />
                <Route
                  element={
                    <GlobalLayout userAuth={userAuth}>
                      <GoogleLoginError />
                    </GlobalLayout>
                  }
                  path="/google-login-error"
                />
                <Route
                  element={
                    <GlobalLayout userAuth={userAuth}>
                      <AccountVerification />
                    </GlobalLayout>
                  }
                  path="/account/verify"
                />
                <Route
                  element={
                    <GlobalLayout userAuth={userAuth}>
                      <Pricing />
                    </GlobalLayout>
                  }
                  path="/pricing"
                />
                <Route
                  element={
                    <GlobalLayout userAuth={userAuth}>
                      <PlanManagement />
                    </GlobalLayout>
                  }
                  path="/plan-management"
                />
                <Route
                  path="/user/:userId"
                  element={
                    <GlobalLayout userAuth={userAuth}>
                      <UserProfile />
                    </GlobalLayout>
                  }
                />
                <Route
                  path="/user/:userId/followers"
                  element={
                    <GlobalLayout userAuth={userAuth}>
                      <UserFollowers />
                    </GlobalLayout>
                  }
                />
                <Route
                  path="/user/:userId/following"
                  element={
                    <GlobalLayout userAuth={userAuth}>
                      <UserFollowing />
                    </GlobalLayout>
                  }
                />
                <Route
                  element={
                    <GlobalLayout userAuth={userAuth}>
                      <ResetPassword />
                    </GlobalLayout>
                  }
                  path="/reset-password"
                />

                {/* Redirect /checkout to /pricing if no planId */}
                <Route
                  path="/checkout"
                  element={<Navigate to="/pricing" replace />}
                />

                {/* Checkout routes */}
                <Route
                  element={
                    <GlobalLayout userAuth={userAuth}>
                      <CheckoutForm />
                    </GlobalLayout>
                  }
                  path="/checkout/:planId"
                />
                <Route
                  element={
                    <GlobalLayout userAuth={userAuth}>
                      <PostLimitReached />
                    </GlobalLayout>
                  }
                  path="/post-limit-reached"
                />

                {/* Profile route - Standalone */}
                <Route
                  element={
                    <GlobalLayout userAuth={userAuth}>
                      <AuthRoute>
                        <Profile />
                      </AuthRoute>
                    </GlobalLayout>
                  }
                  path="/profile"
                />

                {/* Home page */}
                <Route
                  path="/"
                  element={
                    userAuth ? (
                      <Navigate to="/dashboard" />
                    ) : (
                      <GlobalLayout userAuth={userAuth}>
                        <div className="py-8">
                          <PostsList />
                        </div>
                      </GlobalLayout>
                    )
                  }
                />

                {/* Routes with GlobalLayout wrapper - Main authenticated routes */}
                <Route element={<GlobalLayout userAuth={userAuth} />}>
                  {/* Authenticated routes */}
                  <Route
                    element={
                      <AuthRoute>
                        <PaymentSuccess />
                      </AuthRoute>
                    }
                    path="/success"
                  />
                  <Route
                    element={
                      <AuthRoute>
                        <PayingFreePlan />
                      </AuthRoute>
                    }
                    path="/free-subscription"
                  />

                  {/* Dashboard routes */}
                  <Route path="/dashboard">
                    <Route
                      element={
                        <AuthRoute>
                          <AccountSummaryDashboard />
                        </AuthRoute>
                      }
                      index
                    />
                    <Route
                      element={
                        <AuthRoute>
                          <CreatePost />
                        </AuthRoute>
                      }
                      path="create-post"
                    />
                    <Route
                      element={
                        <AuthRoute>
                          <DashboardPosts />
                        </AuthRoute>
                      }
                      path="posts"
                    />
                    <Route
                      element={
                        <AuthRoute>
                          <DashboardDrafts />
                        </AuthRoute>
                      }
                      path="drafts"
                    />
                    <Route
                      element={
                        <AuthRoute>
                          <DashboardScheduled />
                        </AuthRoute>
                      }
                      path="scheduled"
                    />
                    <Route
                      element={
                        <AuthRoute>
                          <UploadProfilePic />
                        </AuthRoute>
                      }
                      path="upload-profile-photo"
                    />
                    <Route
                      element={
                        <AuthRoute>
                          <Settings />
                        </AuthRoute>
                      }
                      path="settings"
                    />
                    <Route
                      element={
                        <AuthRoute>
                          <AddEmailComponent />
                        </AuthRoute>
                      }
                      path="add-email"
                    />
                    <Route
                      element={
                        <AuthRoute>
                          <AccountVerification />
                        </AuthRoute>
                      }
                      path="account-verification/:verifyToken"
                    />
                    <Route
                      element={
                        <AuthRoute>
                          <MyFollowing />
                        </AuthRoute>
                      }
                      path="my-followings"
                    />
                    <Route
                      element={
                        <AuthRoute>
                          <MyFollowers />
                        </AuthRoute>
                      }
                      path="my-followers"
                    />
                    <Route
                      element={
                        <AuthRoute>
                          <Notifications />
                        </AuthRoute>
                      }
                      path="notifications"
                    />

                    <Route
                      element={
                        <AuthRoute>
                          <PlanManagement />
                        </AuthRoute>
                      }
                      path="plan-management"
                    />
                    <Route
                      element={
                        <AuthRoute>
                          <Analytics />
                        </AuthRoute>
                      }
                      path="analytics"
                    />
                    <Route
                      element={
                        <AuthRoute>
                          <MyPostsAnalytics />
                        </AuthRoute>
                      }
                      path="my-posts-analytics"
                    />
                    <Route
                      element={
                        <AuthRoute>
                          <UserPostManagement />
                        </AuthRoute>
                      }
                      path="post-management"
                    />
                    <Route
                      element={
                        <AuthRoute>
                          <ContentCalendar />
                        </AuthRoute>
                      }
                      path="content-calendar"
                    />
                    <Route
                      element={
                        <AuthRoute>
                          <SavedPosts />
                        </AuthRoute>
                      }
                      path="saved-posts"
                    />
                    <Route
                      element={
                        <AuthRoute>
                          <TrendingPosts />
                        </AuthRoute>
                      }
                      path="trending-posts"
                    />
                    <Route
                      element={
                        <AuthRoute>
                          <ChatPage />
                        </AuthRoute>
                      }
                      path="chat"
                    />
                    <Route
                      element={
                        <AuthRoute>
                          <AIStudio />
                        </AuthRoute>
                      }
                      path="ai-studio"
                    />
                  </Route>
                </Route>

                {/* Additional standalone routes with GlobalLayout */}
                <Route
                  element={
                    <GlobalLayout userAuth={userAuth}>
                      <PostsList />
                    </GlobalLayout>
                  }
                  path="/posts"
                />
                <Route
                  element={
                    <GlobalLayout userAuth={userAuth}>
                      <PostDetails />
                    </GlobalLayout>
                  }
                  path="/posts/:postId"
                />
                <Route
                  element={
                    <GlobalLayout userAuth={userAuth}>
                      <TrendingPosts />
                    </GlobalLayout>
                  }
                  path="/trending"
                />
                <Route
                  element={
                    <GlobalLayout userAuth={userAuth}>
                      <AuthRoute>
                        <SavedPosts />
                      </AuthRoute>
                    </GlobalLayout>
                  }
                  path="/saved-posts"
                />
                <Route
                  element={
                    <GlobalLayout userAuth={userAuth}>
                      <Rankings />
                    </GlobalLayout>
                  }
                  path="/ranking"
                />
                <Route
                  element={
                    <GlobalLayout userAuth={userAuth}>
                      <SearchResults />
                    </GlobalLayout>
                  }
                  path="/search"
                />
                <Route
                  element={
                    <GlobalLayout userAuth={userAuth}>
                      <AuthRoute>
                        <ChatPage />
                      </AuthRoute>
                    </GlobalLayout>
                  }
                  path="/chat"
                />
                <Route
                  element={
                    <GlobalLayout userAuth={userAuth}>
                      <AIStudio />
                    </GlobalLayout>
                  }
                  path="/ai-studio"
                />

                {/* Edit post route - moved to root level */}
                <Route
                  element={
                    <GlobalLayout userAuth={userAuth}>
                      <AuthRoute>
                        <UpdatePost />
                      </AuthRoute>
                    </GlobalLayout>
                  }
                  path="/edit-post/:postId"
                />

                {/* Catch-all route for unmatched paths */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </div>
      </NotificationProvider>
    </DarkModeProvider>
  );
}

export default App;

