import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaPen, FaBell, FaSun, FaMoon, FaBars, FaTimes, FaSearch } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/slices/authSlices";
import { useDarkMode } from "./DarkModeContext";
import SearchBar from "../Search/SearchBar";
import { useQueryClient } from "@tanstack/react-query";
import { logoutAPI } from "../../APIServices/users/usersAPI";
import { useNotifications } from "../../contexts/NotificationContext";
import Avatar from "../User/Avatar";
import UserPlanStatus from "./UserPlanStatus";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const searchRef = useRef(null);
  const { darkMode, toggleDarkMode } = useDarkMode();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { userAuth } = useSelector((state) => state.auth);

  // Use shared notification context - no more duplicate API calls!
  const { unreadCount } = useNotifications();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close mobile menu when screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
        setSearchOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutAPI();
      dispatch(logout());
      queryClient.clear();
      setProfileDropdownOpen(false);
      setMobileMenuOpen(false);
      setSearchOpen(false);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      dispatch(logout());
      queryClient.clear();
      setProfileDropdownOpen(false);
      setMobileMenuOpen(false);
      setSearchOpen(false);
      window.location.href = '/';
    }
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  };

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-b border-white/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo with Slogan */}
          <Link
            to={userAuth ? "/dashboard" : "/posts"}
            className="flex flex-col"
            onClick={closeMobileMenu}
          >
            <div className="text-xl sm:text-2xl font-serif font-bold text-white hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200">
              WisdomShare
            </div>
            <div className="text-xs text-gray-400 font-medium">
              Share Knowledge, Inspire Growth
            </div>
          </Link>

          {/* Desktop Search Bar - Hidden on mobile */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <SearchBar placeholder="Search posts, users, or content..." />
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {userAuth ? (
              <>
                {/* Write Button */}
                <Link
                  to="/dashboard/create-post"
                  className="flex items-center px-3 py-2 text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-800  transition-all duration-200 font-medium"
                >
                  <FaPen className="mr-2 w-4 h-4" />
                  <span>Write</span>
                </Link>

                {/* Notifications */}
                <Link
                  to="/dashboard/notifications"
                  className="relative p-2 text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-800  transition-all duration-200"
                  title="Notifications"
                >
                  <FaBell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-medium shadow-sm">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* User Plan Status */}
                <UserPlanStatus />

                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="p-2  text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                  aria-label="Toggle dark mode"
                  title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {darkMode ? <FaSun className="w-4 h-4" /> : <FaMoon className="w-4 h-4" />}
                </button>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    className="w-8 h-8 lg:w-10 lg:h-10 rounded-full overflow-hidden border-2 border-white/10 border-white/20 hover:border-green-500 dark:hover:border-green-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    title="Profile menu"
                  >
                    <Avatar 
                      user={userAuth} 
                      size="md" 
                      className="w-full h-full"
                    />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-black/50 backdrop-blur-xl border border-white/10 text-white  shadow-lg border border-white/10 border-white/10 py-2 z-50">
                      <div className="px-4 py-2 border-b border-white/10 border-white/10">
                        <p className="text-sm font-medium text-white">{userAuth.username}</p>
                        <p className="text-xs text-gray-400">{userAuth.email}</p>
                      </div>
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/dashboard/profile"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Dark Mode Toggle for non-authenticated users */}
                <button
                  onClick={toggleDarkMode}
                  className="p-2  text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                  aria-label="Toggle dark mode"
                  title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {darkMode ? <FaSun className="w-4 h-4" /> : <FaMoon className="w-4 h-4" />}
                </button>
                
                <Link
                  to="/login"
                  className="px-3 py-2 text-sm text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-800  transition-all duration-200 font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-2 text-sm bg-green-600 text-white  hover:bg-green-700 transition-all duration-200 font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="md:hidden flex items-center space-x-1">
            {/* Mobile Search - Only for authenticated users */}
            {userAuth && (
              <button
                ref={searchRef}
                onClick={toggleSearch}
                className={`p-2  transition-all duration-200 ${
                  searchOpen 
                    ? 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30' 
                    : 'text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                title="Search"
              >
                <FaSearch className="w-4 h-4" />
              </button>
            )}

            {/* Mobile Notifications - Only for authenticated users */}
            {userAuth && (
              <Link
                to="/dashboard/notifications"
                className="relative p-2 text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-800  transition-all duration-200"
                title="Notifications"
                onClick={closeMobileMenu}
              >
                <FaBell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-medium shadow-sm">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            )}

            {/* Mobile Dark Mode - For all users */}
            <button
              onClick={toggleDarkMode}
              className="p-2  text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
              aria-label="Toggle dark mode"
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <FaSun className="w-4 h-4" /> : <FaMoon className="w-4 h-4" />}
            </button>

            {/* Mobile Menu - For all users */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-800  transition-all duration-200"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Enhanced Mobile Search Bar - Full width below navbar */}
        {searchOpen && userAuth && (
          <div className="md:hidden py-4 border-t border-white/10 border-white/10 bg-black text-white">
            <div className="relative">
              <SearchBar 
                placeholder="Search posts, users, or content..." 
                className="w-full"
                onSearchComplete={() => setSearchOpen(false)}
              />
              <div className="mt-3 text-center">
                <button
                  onClick={() => setSearchOpen(false)}
                  className="text-sm text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                  Close search
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div 
            ref={mobileMenuRef}
            className="md:hidden absolute top-full left-0 right-0 bg-black text-white border-t border-white/10 border-white/10 shadow-lg"
          >
            <div className="px-4 py-4 space-y-4">
              {userAuth ? (
                <>
                  {/* User Info */}
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 bg-black/60 backdrop-blur-xl border border-white/10 ">
                    <Avatar 
                      user={userAuth} 
                      size="md" 
                      className="w-12 h-12"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {userAuth.username}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {userAuth.email}
                      </p>
                    </div>
                  </div>

                  {/* Mobile Plan Status */}
                  <div className="px-3 py-2 bg-gray-50 bg-black/60 backdrop-blur-xl border border-white/10 ">
                    <UserPlanStatus />
                  </div>

                  {/* Mobile Menu Items */}
                  <div className="space-y-1">
                    <Link
                      to="/dashboard"
                      className="flex items-center px-3 py-3 text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800  transition-all duration-200 font-medium"
                      onClick={closeMobileMenu}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/dashboard/create-post"
                      className="flex items-center px-3 py-3 text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800  transition-all duration-200 font-medium"
                      onClick={closeMobileMenu}
                    >
                      <FaPen className="mr-3 w-4 h-4" />
                      Write Post
                    </Link>
                    <Link
                      to="/dashboard/profile"
                      className="flex items-center px-3 py-3 text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800  transition-all duration-200 font-medium"
                      onClick={closeMobileMenu}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-3 py-3 text-left text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800  transition-all duration-200 font-medium"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Non-authenticated mobile menu */}
                  <div className="space-y-3">
                    <Link
                      to="/login"
                      className="flex items-center justify-center px-4 py-3 text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800  transition-all duration-200 font-medium"
                      onClick={closeMobileMenu}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="flex items-center justify-center px-4 py-3 bg-green-600 text-white  hover:bg-green-700 transition-all duration-200 font-medium"
                      onClick={closeMobileMenu}
                    >
                      Sign Up
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;