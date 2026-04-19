import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FaComment, FaTimes } from "react-icons/fa";
import { createCommentAPI } from "../../APIServices/comments/commentsAPI";
import CommentItem from "./CommentItem";
import Avatar from "../User/Avatar";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link } from "react-router-dom";

const CommentList = ({ comments = [], currentUserId, postId, onCommentUpdate }) => {
  const [isAddingComment, setIsAddingComment] = useState(false);
  const queryClient = useQueryClient();

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: createCommentAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-details"] });
      if (onCommentUpdate) onCommentUpdate();
    }
  });

  // Comment form
  const formik = useFormik({
    initialValues: { content: "" },
    validationSchema: Yup.object({
      content: Yup.string()
        .min(1, "Comment cannot be empty")
        .max(1000, "Comment is too long")
        .required("Comment content is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      await createCommentMutation.mutateAsync({
        postId,
        content: values.content
      });
      resetForm();
      setIsAddingComment(false);
    },
  });

  const handleReply = (parentCommentId) => {
    // This will be handled by individual CommentItem components
    console.log("Reply to comment:", parentCommentId);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Comment Form */}
      <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  p-4 sm:p-6 shadow-sm border border-white/5 border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">
          Comments ({comments.length})
        </h3>

        {currentUserId ? (
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-shrink-0">
                <Avatar user={{ _id: currentUserId }} size="md" />
              </div>
              <div className="flex-1">
                <textarea
                  {...formik.getFieldProps("content")}
                  rows="3"
                  className="w-full border border-white/20 border-white/20 p-3  bg-white/5 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Share your thoughts..."
                />
                {formik.touched.content && formik.errors.content && (
                  <div className="text-red-500 text-sm mt-1">{formik.errors.content}</div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <FaComment className="h-4 w-4" />
                <span>Share your thoughts with the community</span>
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  type="submit"
                  disabled={createCommentMutation.isPending}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium  hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {createCommentMutation.isPending ? "Posting..." : "Post Comment"}
                </button>
                {isAddingComment && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingComment(false);
                      formik.resetForm();
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-500 text-white text-sm font-medium  hover:bg-gray-600 transition-colors"
                  >
                    <FaTimes className="h-3 w-3" />
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>
        ) : (
          <div className="text-center py-6">
            <div className="text-gray-400 text-4xl mb-2">💬</div>
            <p className="text-gray-400 mb-4">
              Please log in to leave a comment
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium  hover:bg-blue-700 transition-colors"
            >
              Log In
            </Link>
          </div>
        )}
      </div>

      {/* Comments List */}
      <div className="space-y-3 sm:space-y-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              currentUserId={currentUserId}
              onReply={handleReply}
              onCommentUpdate={onCommentUpdate}
              postId={postId}
            />
          ))
        ) : (
          <div className="text-center py-8 bg-black/50 backdrop-blur-xl border border-white/10 text-white  border border-white/5 border-white/10">
            <div className="text-gray-400 text-4xl mb-2">💬</div>
            <p className="text-gray-400 italic">
              No comments yet. Be the first to comment!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentList;













