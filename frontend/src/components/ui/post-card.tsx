import { Heart, Bookmark, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { truncateText } from "../../utils/responsiveUtils";

export interface PostCardProps {
  post: any;
  isSaved?: boolean;
  isLiked?: boolean;
  onSave?: (postId: string) => void;
  onLike?: (postId: string) => void;
  onShare?: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, isSaved, isLiked, onSave, onLike, onShare }) => {
  const imageUrl = post?.image?.url || post?.image?.path || post?.image || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1920&auto=format&fit=crop";
  const profileUrl = post?.author?.profilePicture?.url || post?.author?.profilePicture?.path || post?.author?.profilePicture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150";

  const handleLike = () => {
    if (onLike) onLike(post._id);
  };

  const handleBookmark = () => {
    if (onSave) onSave(post._id);
  };

  const handleShare = () => {
    if (onShare) onShare(post._id);
  };

  return (
   <div className="w-full h-full flex flex-col -[2rem] bg-[#0B1121]/80 backdrop-blur-xl border border-blue-500/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] p-5 transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)] hover:border-blue-500/30 group">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 card-header">
        <Link to={`/user/${post?.author?._id}`} className="flex items-center gap-4 hover:opacity-80 transition-opacity">
          <img
            src={profileUrl}
            alt={post?.author?.username || post?.author?.name || "Author"}
            width={35}
            height={35}
            className="rounded-full w-[35px] h-[35px] object-cover"
          />
          <div>
            <h3 className="flex flex-col font-medium text-white">
              {post?.author?.name || post?.author?.username || "Anonymous"}
              <span className="flex items-center gap-2 opacity-70 text-sm text-gray-300">
                <small>@{post?.author?.username || "user"}</small>
                <span>·</span>
                <small>
                  {new Date(post?.createdAt || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </small>
              </span>
            </h3>
          </div>
        </Link>
      </div>

      {/* Content */}
      <div className="mt-4 flex flex-col gap-6">
        <Link to={`/posts/${post?._id}`}>
          <h2 className="text-xl font-bold text-white hover:text-blue-400 transition-colors line-clamp-2">
            {post?.title || "Untitled Post"}
          </h2>
          <p className="whitespace-pre-wrap text-gray-300 mt-2 text-sm leading-relaxed line-clamp-3">
            {truncateText(post?.excerpt || post?.description || post?.content || "", 120)}
          </p>
        </Link>
        <Link to={`/posts/${post?._id}`}>
          <img
            src={imageUrl}
            alt={post?.title || "Post Content"}
            className="w-full max-h-[300px]  object-cover transition-transform duration-300 hover:scale-[1.02]"
          />
        </Link>
      </div>

      {/* Actions */}
      <div className="mt-4 flex justify-evenly gap-2">
        <button
          onClick={handleLike}
          className="flex grow items-center justify-center gap-3  px-4 py-2 transition-all duration-300 text-gray-300 hover:text-white hover:bg-blue-900/40 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]"
        >
          <Heart fill={isLiked ? "#ef4444" : "none"} color="currentColor" className={`transition-colors ${isLiked ? "text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]" : ""}`} size={18} />
          <span className="inline font-medium opacity-90 text-[14px] transition max-sm:hidden shrink-0">
            {post?.likesCount || 0}
          </span>
        </button>

        <button
          onClick={handleBookmark}
          className="flex grow items-center justify-center gap-3  px-4 py-2 transition-all duration-300 text-gray-300 hover:text-white hover:bg-blue-900/40 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]"
        >
          <Bookmark fill={isSaved ? "#00bfff" : "none"} color={isSaved ? "#00bfff" : "currentColor"} className={isSaved ? "drop-shadow-[0_0_8px_rgba(0,191,255,0.6)]" : ""} size={18} />
          <span className="inline font-medium opacity-90 text-[14px] transition max-sm:hidden shrink-0">
            {isSaved ? "Saved" : "Save"}
          </span>
        </button>

        <button 
          onClick={handleShare}
          className="flex grow items-center justify-center gap-3  px-4 py-2 transition-all duration-300 text-gray-300 hover:text-white hover:bg-blue-900/40 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]"
        >
          <Send size={18} />
          <span className="inline font-medium opacity-90 text-[14px] transition max-sm:hidden shrink-0">
            Share
          </span>
        </button>
      </div>
    </div>
  );
};
