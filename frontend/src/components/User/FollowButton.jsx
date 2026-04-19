import { useState } from "react";
import PropTypes from "prop-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RiUserUnfollowFill, RiUserFollowLine } from "react-icons/ri";
import { followUserAPI, unfollowUserAPI } from "../../APIServices/users/usersAPI";

const FollowButton = ({
  targetUserId,
  currentUserId,
  isFollowing,
  onFollowChange,
  size = "md",
  variant = "default",
  className = ""
}) => {
  const [localIsFollowing, setLocalIsFollowing] = useState(isFollowing);
  const [isPending, setIsPending] = useState(false);
  const queryClient = useQueryClient();

  // Mutations
  const followMutation = useMutation({
    mutationFn: followUserAPI,
    onSuccess: () => {
      setLocalIsFollowing(true);
      setIsPending(false);
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["following"] });
      queryClient.invalidateQueries({ queryKey: ["followers"] });
      if (onFollowChange) onFollowChange(true);
    },
    onError: (error) => {
      setIsPending(false);
      console.error('Follow error:', error);
    }
  });

  const unfollowMutation = useMutation({
    mutationFn: unfollowUserAPI,
    onSuccess: () => {
      setLocalIsFollowing(false);
      setIsPending(false);
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["following"] });
      queryClient.invalidateQueries({ queryKey: ["followers"] });
      if (onFollowChange) onFollowChange(false);
    },
    onError: (error) => {
      setIsPending(false);
      console.error('Unfollow error:', error);
    }
  });

  // Don't show button if it's the current user
  if (currentUserId === targetUserId) {
    return null;
  }

  const handleFollow = async () => {
    if (isPending) return;

    setIsPending(true);
    if (localIsFollowing) {
      await unfollowMutation.mutateAsync(targetUserId);
    } else {
      await followMutation.mutateAsync(targetUserId);
    }
  };

  // Size variants
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base"
  };

  // Style variants
  const variantClasses = {
    default: localIsFollowing
      ? "bg-red-600 hover:bg-red-700 text-white"
      : "bg-blue-600 hover:bg-blue-700 text-white",
    outline: localIsFollowing
      ? "border border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
      : "border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20",
    ghost: localIsFollowing
      ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
      : "text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const variantClass = variantClasses[variant] || variantClasses.default;

  return (
    <>
    <button
      onClick={handleFollow}
      disabled={isPending}
      className={`
        inline-flex items-center gap-2  font-medium transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClass} ${variantClass} ${className}
        ${localIsFollowing
          ? 'focus:ring-red-500'
          : 'focus:ring-blue-500'
        }
      `}
    >
      {isPending ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
      ) : localIsFollowing ? (
        <RiUserUnfollowFill className="h-4 w-4" />
      ) : (
        <RiUserFollowLine className="h-4 w-4" />
      )}

      {isPending
        ? (localIsFollowing ? 'Unfollowing...' : 'Following...')
        : (localIsFollowing ? 'Unfollow' : 'Follow')
      }
    </button>
  </>
  );
};

FollowButton.propTypes = {
  targetUserId: PropTypes.string.isRequired,
  currentUserId: PropTypes.string.isRequired,
  isFollowing: PropTypes.bool.isRequired,
  onFollowChange: PropTypes.func.isRequired,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  variant: PropTypes.oneOf(["default", "outline", "ghost"]),
  className: PropTypes.string
};

export default FollowButton;













