import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { FaTimesCircle } from "react-icons/fa";
import Select from "react-select";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchPost, updatePostAPI } from "../../APIServices/posts/postsAPI";
import { fetchCategoriesAPI } from "../../APIServices/category/categoryAPI";
import AlertMessage from "../Alert/AlertMessage";
import { useParams } from "react-router-dom";

const customQuillStyles = `
  .ql-editor {
    background-color: transparent !important;
    color: inherit !important;
  }
  
  .ql-toolbar {
    background-color: #f9fafb !important;
    border-color: #d1d5db !important;
  }
  
  .dark .ql-toolbar {
    background-color: #374151 !important;
    border-color: #4b5563 !important;
  }
  
  .ql-container {
    border-color: #d1d5db !important;
  }
  
  .dark .ql-container {
    border-color: #4b5563 !important;
  }
  
  .ql-editor.ql-blank::before {
    color: #9ca3af !important;
  }
  
  .dark .ql-editor.ql-blank::before {
    color: #6b7280 !important;
  }
`;

// Inject custom styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = customQuillStyles;
  document.head.appendChild(styleElement);
}

const UpdatePost = () => {
  const { postId } = useParams();
  
  // Debug postId
  console.log('🔍 UpdatePost component mounted with postId:', postId);

  const [imageError, setImageError] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null); // to track if new image uploaded
  const fileInputRef = useRef(null);

  const { data: postDetails, isLoading: postLoading, error: postError } = useQuery({
    queryKey: ["post-details", postId],
    queryFn: () => fetchPost(postId),
    enabled: !!postId, // Only fetch if postId exists
  });

  const { data: categoryData } = useQuery({
    queryKey: ["category-lists"],
    queryFn: fetchCategoriesAPI,
  });

  const postMutation = useMutation({
    mutationKey: ["update-post"],
    mutationFn: updatePostAPI,
    onSuccess: (data) => {
      console.log('Post updated successfully:', data);
      alert('Post updated successfully!');
      // You can add navigation here if needed
      // window.location.href = `/posts/${postId}`;
    },
    onError: (error) => {
      console.error('Error updating post:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Unknown error';
      alert('Failed to update post: ' + errorMessage);
    }
  });

  // Memoize ReactQuill modules and formats to prevent re-renders
  const quillModules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
  }), []);

  const quillFormats = useMemo(() => [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'color', 'background',
    'align',
    'link', 'image'
  ], []);

  // Optimize description change handler
  const handleDescriptionChange = useCallback((value) => {
    formik.setFieldValue("description", value);
  }, []);

  const formik = useFormik({
    enableReinitialize: false, // Changed to false to prevent UI hangs
    initialValues: {
      title: "",
      description: "",
      category: "",
      tags: [],
      tagInput: "",
      status: "draft", // Add status field
      scheduledFor: null, // Add scheduledFor field
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Title is required"),
      description: Yup.string().required("Description is required"),
      category: Yup.string().required("Category is required"),
      tags: Yup.array().of(Yup.string().max(20, "Tag too long")),
      status: Yup.string().oneOf(["draft", "published", "scheduled"]),
      scheduledFor: Yup.date().when("status", {
        is: "scheduled",
        then: (schema) => schema.min(new Date(), "Scheduled date must be in the future").required("Scheduled date is required"),
        otherwise: (schema) => schema.nullable()
      }),
    }),
    onSubmit: (values) => {
      console.log('Form submitted with values:', values);
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("category", values.category);
      formData.append("status", values.status);
      
      if (imageFile) {
        formData.append("image", imageFile);
      }
      
      // Add tags as comma-separated string
      if (values.tags.length > 0) {
        formData.append("tags", values.tags.join(","));
      }

      // Add scheduled date if scheduling
      if (values.status === "scheduled" && values.scheduledFor) {
        const scheduledDate = new Date(values.scheduledFor);
        formData.append("scheduledFor", scheduledDate.toISOString());
      }

      console.log('Sending update request for postId:', postId);
      // Fix: Pass parameters separately, not as array
      postMutation.mutate({ postId, formData });
    },
  });

  // Set form values when post details are loaded
  useEffect(() => {
    if (postDetails?.postFound) {
      const post = postDetails.postFound;
      console.log('Post details loaded:', post);
      
      // Set form values manually to avoid enableReinitialize issues
      formik.setFieldValue("title", post.title || "");
      formik.setFieldValue("description", post.description || "");
      formik.setFieldValue("category", post.category || "");
      formik.setFieldValue("tags", post.tags && Array.isArray(post.tags) ? post.tags : []);
      formik.setFieldValue("status", post.status || "draft"); // Set status
      formik.setFieldValue("scheduledFor", post.scheduledFor ? new Date(post.scheduledFor) : null); // Set scheduledFor
      
      // Set image preview
      if (post.image) {
        setImagePreview(post.image);
      }
    }
  }, [postDetails]);

  const handleFileChange = (event) => {
    const file = event.currentTarget.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setImageError("File size must be under 5MB");
      return;
    }
    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
      setImageError("Invalid file type (allowed: jpg, png, webp)");
      return;
    }
    setImageFile(file); // actual file for FormData
    setImagePreview(URL.createObjectURL(file));
    setImageError("");
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Clean up old preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (imagePreview && imageFile) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview, imageFile]);

  if (postLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (postError) {
    return <AlertMessage type="error" message="Failed to load post details" />;
  }

  if (!postDetails?.postFound) {
    return <AlertMessage type="error" message="Post not found" />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-black text-white transition-colors duration-300 min-h-screen">
      <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  shadow-sm p-8">
        <h1 className="text-3xl font-serif font-bold mb-8 text-center">
          Edit Your Story
        </h1>

        {/* Mutation Status Messages */}
        {postMutation.isPending && (
          <AlertMessage type="loading" message="Updating your story..." />
        )}
        {postMutation.isSuccess && (
          <AlertMessage type="success" message="Story updated successfully!" />
        )}
        {postMutation.isError && (
          <AlertMessage
            type="error"
            message={postMutation?.error?.response?.data?.message || "Failed to update post"}
          />
        )}

        <form onSubmit={formik.handleSubmit} className="space-y-8">
          {/* Title */}
          <div>
            <input
              type="text"
              name="title"
              placeholder="Title"
              {...formik.getFieldProps("title")}
              className="w-full text-4xl font-serif font-bold border-none focus:outline-none focus:ring-0 p-0 bg-black text-white dark:text-white"
            />
            {formik.touched.title && formik.errors.title && (
              <p className="text-sm text-red-600 mt-1">{formik.errors.title}</p>
            )}
          </div>

          {/* Featured Image */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-300">
              Featured Image
            </label>

            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-64 object-cover "
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-black/50 backdrop-blur-xl border border-white/10 text-white p-2 rounded-full shadow-lg border border-white/10 border-white/20 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <FaTimesCircle className="text-red-500 text-xl" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full">
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-white/20 border-white/20 border-dashed  cursor-pointer bg-gray-50 hover:bg-white/5 text-white dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className="w-8 h-8 mb-4 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 16"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                      />
                    </svg>
                    <p className="mb-2 text-sm text-gray-400">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-400">JPEG, PNG, WebP (Max 5MB)</p>
                  </div>
                </button>
              </div>
            )}

            {/* Hidden Input */}
            <input
              ref={fileInputRef}
              type="file"
              name="image"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {imageError && (
              <p className="text-sm text-red-600 dark:text-red-400">{imageError}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category
            </label>
            <Select
              name="category"
              options={categoryData?.categories?.map((category) => ({
                value: category._id,
                label: category.categoryName,
              }))}
              onChange={(option) =>
                formik.setFieldValue("category", option.value)
              }
              value={categoryData?.categories
                ?.map((cat) => ({
                  value: cat._id,
                  label: cat.categoryName,
                }))
                .find((c) => c.value === formik.values.category)}
              className="basic-single"
              classNamePrefix="select"
              placeholder="Select a category..."
              styles={{
                control: (provided, state) => ({
                  ...provided,
                  backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : '#ffffff',
                  borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#d1d5db',
                  '&:hover': {
                    borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#9ca3af'
                  }
                }),
                menu: (provided) => ({
                  ...provided,
                  backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : '#ffffff',
                  border: `1px solid ${document.documentElement.classList.contains('dark') ? '#4b5563' : '#d1d5db'}`
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isFocused 
                    ? (document.documentElement.classList.contains('dark') ? '#4b5563' : '#f3f4f6')
                    : 'transparent',
                  color: document.documentElement.classList.contains('dark') ? '#f9fafb' : '#111827',
                  '&:hover': {
                    backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#f3f4f6'
                  }
                }),
                singleValue: (provided) => ({
                  ...provided,
                  color: document.documentElement.classList.contains('dark') ? '#f9fafb' : '#111827'
                }),
                input: (provided) => ({
                  ...provided,
                  color: document.documentElement.classList.contains('dark') ? '#f9fafb' : '#111827'
                }),
                placeholder: (provided) => ({
                  ...provided,
                  color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'
                })
              }}
            />
            {formik.touched.category && formik.errors.category && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {formik.errors.category}
              </p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Status
            </label>
            <Select
              name="status"
              options={[
                { value: "draft", label: "Draft" },
                { value: "published", label: "Published" },
                { value: "scheduled", label: "Scheduled" },
              ]}
              onChange={(option) =>
                formik.setFieldValue("status", option.value)
              }
              value={{ value: formik.values.status, label: formik.values.status.charAt(0).toUpperCase() + formik.values.status.slice(1) }}
              className="basic-single"
              classNamePrefix="select"
              placeholder="Select status..."
              styles={{
                control: (provided, state) => ({
                  ...provided,
                  backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : '#ffffff',
                  borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#d1d5db',
                  '&:hover': {
                    borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#9ca3af'
                  }
                }),
                menu: (provided) => ({
                  ...provided,
                  backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : '#ffffff',
                  border: `1px solid ${document.documentElement.classList.contains('dark') ? '#4b5563' : '#d1d5db'}`
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isFocused 
                    ? (document.documentElement.classList.contains('dark') ? '#4b5563' : '#f3f4f6')
                    : 'transparent',
                  color: document.documentElement.classList.contains('dark') ? '#f9fafb' : '#111827',
                  '&:hover': {
                    backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#f3f4f6'
                  }
                }),
                singleValue: (provided) => ({
                  ...provided,
                  color: document.documentElement.classList.contains('dark') ? '#f9fafb' : '#111827'
                }),
                input: (provided) => ({
                  ...provided,
                  color: document.documentElement.classList.contains('dark') ? '#f9fafb' : '#111827'
                }),
                placeholder: (provided) => ({
                  ...provided,
                  color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'
                })
              }}
            />
            {formik.touched.status && formik.errors.status && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {formik.errors.status}
              </p>
            )}
          </div>

          {/* Scheduled For (only if status is scheduled) */}
          {formik.values.status === "scheduled" && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Scheduled For
              </label>
              <input
                type="datetime-local"
                name="scheduledFor"
                {...formik.getFieldProps("scheduledFor")}
                className="w-full px-3 py-2 border border-white/20  focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/5 dark:text-white"
              />
              {formik.touched.scheduledFor && formik.errors.scheduledFor && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {formik.errors.scheduledFor}
                </p>
              )}
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tags (optional)
            </label>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2 mb-2">
                {formik.values.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-700"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => {
                        const newTags = formik.values.tags.filter((_, i) => i !== index);
                        formik.setFieldValue("tags", newTags);
                      }}
                      className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a tag and press Enter"
                  value={formik.values.tagInput || ""}
                  onChange={(e) => {
                    formik.setFieldValue("tagInput", e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      const newTag = e.target.value.trim();
                      if (newTag && newTag.length > 0 && newTag.length <= 20) {
                        if (!formik.values.tags.includes(newTag.toLowerCase())) {
                          const updatedTags = [...formik.values.tags, newTag.toLowerCase()];
                          formik.setFieldValue("tags", updatedTags);
                          formik.setFieldValue("tagInput", "");
                        }
                      }
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-white/20 border-white/20  focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-black/40 backdrop-blur-md text-white bg-white/5 text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newTag = formik.values.tagInput?.trim();
                    if (newTag && newTag.length > 0 && newTag.length <= 20) {
                      if (!formik.values.tags.includes(newTag.toLowerCase())) {
                        const updatedTags = [...formik.values.tags, newTag.toLowerCase()];
                        formik.setFieldValue("tags", updatedTags);
                        formik.setFieldValue("tagInput", "");
                      }
                    }
                  }}
                  disabled={!formik.values.tagInput?.trim()}
                  className="px-4 py-2 bg-blue-600 text-white  hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add
                </button>
              </div>
              <p className="text-xs text-gray-400">
                Press Enter or click Add to add tags. Maximum 20 characters per tag.
              </p>
            </div>
            {formik.touched.tags && formik.errors.tags && (
              <p className="text-sm text-red-600 dark:text-red-400">{formik.errors.tags}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Your Story
            </label>
            <div className="border border-white/20 border-white/20  overflow-hidden">
              <ReactQuill
                theme="snow"
                value={formik.values.description}
                onChange={handleDescriptionChange}
                modules={quillModules}
                formats={quillFormats}
                className="h-64"
                placeholder="Tell your story..."
              />
            </div>
            {formik.touched.description && formik.errors.description && (
              <p className="text-sm text-red-600 dark:text-red-400">{formik.errors.description}</p>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={postMutation.isPending}
              className="px-8 py-3 bg-green-600 text-white font-medium rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {postMutation.isPending ? 'Updating...' : 'Update Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdatePost;
