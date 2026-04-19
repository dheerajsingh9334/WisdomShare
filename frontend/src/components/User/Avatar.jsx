import { useState, useEffect } from "react";
import { getDefaultProfilePic } from "../../utils/avatarConfig";

const Avatar = ({ 
  user, 
  size = "md", 
  showName = false, 
  className = "",
  onClick = null,
  showOnlineStatus = false,
  // Customizable default profile picture
  defaultProfilePic = null, // URL to custom default image
  showDefaultImage = true // Whether to show default image or initials
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Reset states when user changes
  useEffect(() => {
    setImageError(false);
    setImageLoading(true);
  }, [user?._id, user?.profilePicture]);

  // Size configurations
  const sizeConfig = {
    xs: { avatar: "w-6 h-6", text: "text-xs", name: "text-xs" },
    sm: { avatar: "w-8 h-8", text: "text-sm", name: "text-sm" },
    md: { avatar: "w-10 h-10", text: "text-base", name: "text-sm" },
    lg: { avatar: "w-16 h-16", text: "text-xl", name: "text-base" },
    xl: { avatar: "w-20 h-20", text: "text-2xl", name: "text-lg" },
    "2xl": { avatar: "w-24 h-24", text: "text-3xl", name: "text-xl" },
    "3xl": { avatar: "w-32 h-32", text: "text-4xl", name: "text-2xl" }
  };

  const config = sizeConfig[size] || sizeConfig.md;

  // Get profile picture URL
  const getProfilePicture = () => {
    if (!user) return null;
    
    // Handle different profile picture formats
    if (typeof user.profilePicture === 'string') {
      return user.profilePicture;
    }
    
    if (user.profilePicture?.path) {
      return user.profilePicture.path;
    }
    
    if (user.profilePicture?.url) {
      return user.profilePicture.url;
    }
    
    // Check for other possible properties
    if (user.profilePicture?.image) {
      return user.profilePicture.image;
    }
    
    if (user.profilePicture?.src) {
      return user.profilePicture.src;
    }
    
    return null;
  };

  // Get user initials for fallback
  const getInitials = () => {
    if (!user?.username) return "U";
    
    const names = user.username.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
  };

  // Generate gradient background based on username
  const getGradientClass = () => {
    if (!user?.username) return "from-gray-400 to-gray-600";
    
    const gradients = [
      "from-blue-400 to-blue-600",
      "from-green-400 to-green-600", 
      "from-purple-400 to-purple-600",
      "from-pink-400 to-pink-600",
      "from-yellow-400 to-yellow-600",
      "from-red-400 to-red-600",
      "from-indigo-400 to-indigo-600",
      "from-teal-400 to-teal-600"
    ];
    
    const hash = user.username.split("").reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return gradients[Math.abs(hash) % gradients.length];
  };

  const profilePicture = getProfilePicture();
  const shouldShowImage = profilePicture && !imageError;

  const avatarContent = (
    <div className={`relative ${config.avatar} ${className}`}>
      {shouldShowImage ? (
        <img
          src={profilePicture}
          alt={user?.username || "User"}
          className={`${config.avatar} rounded-full object-cover border-2 border-white border-white/10 shadow-sm ${imageLoading ? 'animate-pulse bg-gray-200' : ''}`}
          onError={() => {
            setImageError(true);
            setImageLoading(false);
          }}
          onLoad={() => {
            setImageError(false);
            setImageLoading(false);
          }}
        />
      ) : showDefaultImage && defaultProfilePic ? (
        // Show custom default profile picture
        <img
          src={defaultProfilePic}
          alt="Default Profile"
          className={`${config.avatar} rounded-full object-cover border-2 border-white border-white/10 shadow-sm ${imageLoading ? 'animate-pulse bg-gray-200' : ''}`}
          onError={() => {
            setImageError(true);
            setImageLoading(false);
          }}
          onLoad={() => {
            setImageError(false);
            setImageLoading(false);
          }}
        />
      ) : (
        // Show initials as fallback
        <div 
          className={`${config.avatar} rounded-full bg-gradient-to-r ${getGradientClass()} flex items-center justify-center text-white font-semibold ${config.text} border-2 border-white border-white/10 shadow-sm`}
        >
          {getInitials()}
        </div>
      )}
      
      {/* Loading indicator */}
      {imageLoading && shouldShowImage && (
        <div className={`absolute inset-0 ${config.avatar} rounded-full bg-gray-200 dark:bg-gray-600 animate-pulse flex items-center justify-center`}>
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Online status indicator */}
      {showOnlineStatus && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white border-white/10 rounded-full"></div>
      )}
    </div>
  );

  return (
    <div className={`flex items-center gap-3 ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
      {avatarContent}
      
      {showName && user?.username && (
        <div className="min-w-0 flex-1">
          <p className={`${config.name} font-medium text-white truncate`}>
            {user.username}
          </p>
          {user.email && (
            <p className="text-xs text-gray-400 truncate">
              {user.email}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Avatar;