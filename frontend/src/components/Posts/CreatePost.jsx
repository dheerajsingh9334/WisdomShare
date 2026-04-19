import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { FaTimesCircle } from "react-icons/fa";
import Select from "react-select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPostAPI } from "../../APIServices/posts/postsAPI";
import { generateBlogDirectAPI } from "../../APIServices/ai/aiAPI";
import AlertMessage from "../Alert/AlertMessage";
import { fetchCategoriesAPI } from "../../APIServices/category/categoryAPI";
import PlanAccessGuard from "../Plans/PlanAccessGuard";
import AdvancedEditorLock from "../PlanLocks/AdvancedEditorLock";
import CharacterLimitIndicator from "../PlanLocks/CharacterLimitIndicator";
// import ScheduledPostsFeature from "../PlanLocks/ScheduledPostsFeature";
import { useSelector } from "react-redux";
import { userProfileAPI } from "../../APIServices/users/usersAPI";
import {
  hasAdvancedEditor,
  hasScheduledPosts,
  canSelectMultipleCategories,
  isWithinCharacterLimit,
  getCharacterLimit,
} from "../../utils/planUtils";
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
  
  /* All toolbar icons - stroke elements */
  .dark .ql-toolbar .ql-stroke {
    stroke: #d1d5db !important;
  }
  
  /* All toolbar icons - fill elements */
  .dark .ql-toolbar .ql-fill {
    fill: #d1d5db !important;
  }
  
  /* All toolbar buttons */
  .dark .ql-toolbar button {
    color: #d1d5db !important;
  }
  
  .dark .ql-toolbar button:hover {
    color: #ffffff !important;
    background-color: #4b5563 !important;
  }
  
  .dark .ql-toolbar button:hover .ql-stroke {
    stroke: #ffffff !important;
  }
  
  .dark .ql-toolbar button:hover .ql-fill {
    fill: #ffffff !important;
  }
  
  /* Active/selected buttons */
  .dark .ql-toolbar button.ql-active {
    color: #60a5fa !important;
    background-color: #1e40af !important;
  }
  
  .dark .ql-toolbar button.ql-active .ql-stroke {
    stroke: #60a5fa !important;
  }
  
  .dark .ql-toolbar button.ql-active .ql-fill {
    fill: #60a5fa !important;
  }
  
  /* Dropdown arrows and specific icons */
  .dark .ql-toolbar .ql-picker-label {
    color: #d1d5db !important;
  }
  
  .dark .ql-toolbar .ql-picker-label:hover {
    color: #ffffff !important;
  }
  
  .dark .ql-toolbar .ql-picker-options {
    background-color: #374151 !important;
    border-color: #4b5563 !important;
  }
  
  .dark .ql-toolbar .ql-picker-item {
    color: #d1d5db !important;
  }
  
  .dark .ql-toolbar .ql-picker-item:hover {
    background-color: #4b5563 !important;
    color: #ffffff !important;
  }
  
  /* Container and editor area */
  .ql-container {
    border-color: #d1d5db !important;
  }
  
  .dark .ql-container {
    border-color: #4b5563 !important;
    background-color: #111827 !important;
  }
  
  .dark .ql-editor {
    color: #ffffff !important;
    background-color: #111827 !important;
  }
  
  /* Placeholder text */
  .ql-editor.ql-blank::before {
    color: #9ca3af !important;
  }
  
  .dark .ql-editor.ql-blank::before {
    color: #9ca3af !important;
  }
  
  /* Tooltips and modals */
  .dark .ql-tooltip {
    background-color: #374151 !important;
    border: 1px solid #4b5563 !important;
    color: #ffffff !important;
  }
  
  .dark .ql-tooltip input {
    background-color: #111827 !important;
    color: #ffffff !important;
    border-color: #4b5563 !important;
  }
  
  /* Color picker and other special elements */
  .dark .ql-color-picker .ql-picker-options {
    background-color: #374151 !important;
  }
  
  .dark .ql-font .ql-picker-options,
  .dark .ql-size .ql-picker-options,
  .dark .ql-header .ql-picker-options {
    background-color: #374151 !important;
  }
  
  /* Selection highlight */
  .dark .ql-editor ::selection {
    background-color: #3b82f6 !important;
    color: #ffffff !important;
  }
`;

const extractDraftBody = (draft) => {
  const content = (draft || "").trim();
  if (!content) return { title: "", body: "" };

  const lines = content.split(/\r?\n/).map((line) => line.trim());
  const titleLine = lines[0] || "";
  const title = titleLine.replace(/^#\s*/, "").trim();
  const body = lines.slice(1).join("\n").trim();

  return {
    title: title || "AI Generated Draft",
    body: body || content,
  };
};

// Inject custom styles
if (typeof document !== "undefined") {
  const styleElement = document.createElement("style");
  styleElement.textContent = customQuillStyles;
  document.head.appendChild(styleElement);
}

const CreatePost = () => {
  const [imageError, setImageErr] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [aiTopic, setAiTopic] = useState("");
  const [aiAudience, setAiAudience] = useState("developers");
  const [aiTone, setAiTone] = useState("clear");
  const [aiGoal, setAiGoal] = useState("practical learning");
  const [aiDraftMessage, setAiDraftMessage] = useState("");
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const { userAuth } = useSelector((state) => state.auth);

  // Check if user is banned
  const { data: userProfile } = useQuery({
    queryKey: ["profile"],
    queryFn: userProfileAPI,
  });

  const isBanned = userProfile?.user?.isBanned;

  // Extract plan name properly - handle both string and object formats
  const getPlanName = (plan) => {
    if (typeof plan === "string") return plan;
    if (typeof plan === "object" && plan?.planName) return plan.planName;
    if (typeof plan === "object" && plan?.name) return plan.name;
    return "Free";
  };

  const userPlan = getPlanName(
    userAuth?.plan || userAuth?.accountType || userProfile?.user?.accountType,
  );

  console.log("CreatePost - User Plan Name:", userPlan);
  console.log("CreatePost - Raw Plan Object:", userAuth?.plan);

  const postMutation = useMutation({
    mutationKey: ["create-post"],
    mutationFn: createPostAPI,
  });

  const aiGenerateMutation = useMutation({
    mutationKey: ["generate-post-ai"],
    mutationFn: ({ payload }) => generateBlogDirectAPI(payload),
    onSuccess: (response) => {
      const draft = response?.data?.draft || "";
      const { title, body } = extractDraftBody(draft);
      formik.setFieldValue("title", title);
      formik.setFieldValue("description", body);
      setAiDraftMessage("AI draft added. You can now edit and refine it.");
    },
    onError: (error) => {
      setAiDraftMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to generate AI draft",
      );
    },
  });

  // Memoize ReactQuill modules and formats to prevent re-renders
  const quillModules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        ["link", "image"],
        ["clean"],
      ],
    }),
    [],
  );

  const quillFormats = useMemo(
    () => [
      "header",
      "bold",
      "italic",
      "underline",
      "strike",
      "list",
      "bullet",
      "color",
      "background",
      "align",
      "link",
      "image",
    ],
    [],
  );

  // Optimize description change handler
  const handleDescriptionChange = useCallback((value) => {
    formik.setFieldValue("description", value);
  }, []);

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      image: null,
      // If multiple categories are allowed, start with an empty array; otherwise a string
      category: canSelectMultipleCategories(userPlan) ? [] : "",
      tags: [],
      status: "draft",
      scheduledFor: null,
      tagInput: "",
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Title is required"),
      description: Yup.string()
        .required("Description is required")
        .test(
          "character-limit",
          "Content exceeds character limit for your plan",
          function (value) {
            if (!value) return true;
            return isWithinCharacterLimit(userPlan, value);
          },
        ),
      image: Yup.mixed().required("Featured image is required"),
      // Accept array (multi-select) or string (single-select) based on plan
      category: canSelectMultipleCategories(userPlan)
        ? Yup.array().of(Yup.string().required()).min(1, "Category is required")
        : Yup.string().required("Category is required"),
      tags: Yup.array().of(Yup.string().max(20, "Tag too long")),
      status: Yup.string().oneOf(["draft", "published", "scheduled"]),
      scheduledFor: Yup.date().when("status", {
        is: "scheduled",
        then: (schema) =>
          schema
            .min(new Date(), "Scheduled date must be in the future")
            .required("Scheduled date is required"),
        otherwise: (schema) => schema.nullable(),
      }),
    }),
    onSubmit: (values) => {
      console.log("Form values:", values);

      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("image", values.image);
      // Backend expects a single category ID string. If multiple selected, send the first.
      const categoryValue = Array.isArray(values.category)
        ? values.category[0]
        : values.category;
      formData.append("category", categoryValue);
      formData.append("status", values.status);

      // Add tags as comma-separated string
      if (values.tags.length > 0) {
        formData.append("tags", values.tags.join(","));
      }

      // Add scheduled date if scheduling
      if (values.status === "scheduled" && values.scheduledFor) {
        // Convert the datetime-local value to ISO string
        const scheduledDate = new Date(values.scheduledFor);
        formData.append("scheduledFor", scheduledDate.toISOString());
        console.log("Scheduled date:", scheduledDate.toISOString());
      }

      // Debug FormData contents
      console.log("FormData entries:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      console.log("FormData being sent:", formData);
      postMutation.mutate(formData);
    },
  });

  const { data } = useQuery({
    queryKey: ["category-lists"],
    queryFn: fetchCategoriesAPI,
  });

  // Clean up old preview URL when imagePreview changes or component unmounts
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleFileChange = (event) => {
    const file = event.currentTarget.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setImageErr("File size exceeds 5MB");
      return;
    }

    if (
      !["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
        file.type,
      )
    ) {
      setImageErr("Invalid file type (allowed: jpg, png, webp)");
      return;
    }

    setImageErr("");
    formik.setFieldValue("image", file);

    // Revoke old preview URL before setting new one
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    const previewURL = URL.createObjectURL(file);
    setImagePreview(previewURL);
  };

  const removeImage = () => {
    formik.setFieldValue("image", null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  };

  const handleStatusChange = (newStatus) => {
    formik.setFieldValue("status", newStatus);
    // Reset scheduledFor if not scheduling
    if (newStatus !== "scheduled") {
      formik.setFieldValue("scheduledFor", null);
    }
  };

  const isLoading = postMutation.isPending;
  const isError = postMutation.isError;
  const isSuccess = postMutation.isSuccess;
  const errorMsg = postMutation?.error?.response?.data?.message;

  const handleGenerateDraft = () => {
    if (!aiTopic.trim()) {
      setAiDraftMessage("Please enter a topic first.");
      return;
    }

    setAiDraftMessage("");
    aiGenerateMutation.mutate({
      payload: {
        topic: aiTopic.trim(),
        audience: aiAudience,
        tone: aiTone,
        goal: aiGoal,
        includeSections: [
          "Introduction",
          "Core Ideas",
          "Practical Steps",
          "Conclusion",
        ],
      },
    });
  };

  // Optional: Reset form on success
  useEffect(() => {
    if (isSuccess) {
      formik.resetForm();
      setImagePreview(null);
    }
  }, [isSuccess, formik]);

  return (
    <PlanAccessGuard feature="create_post">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white dark:bg-gray-900 transition-colors duration-300 min-h-screen">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-serif font-bold mb-8 text-center">
            Write your story
          </h1>

          {/* Plan Status Banner */}
          <div
            className={`mb-6 p-4 rounded-lg border ${
              userPlan === "Free"
                ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                : userPlan === "Premium"
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                  : "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3
                  className={`font-semibold ${
                    userPlan === "Free"
                      ? "text-blue-800 dark:text-blue-200"
                      : userPlan === "Premium"
                        ? "text-green-800 dark:text-green-200"
                        : "text-purple-800 dark:text-purple-200"
                  }`}
                >
                  {userPlan} Plan Features
                </h3>
                <div
                  className={`text-sm mt-1 ${
                    userPlan === "Free"
                      ? "text-blue-700 dark:text-blue-300"
                      : userPlan === "Premium"
                        ? "text-green-700 dark:text-green-300"
                        : "text-purple-700 dark:text-purple-300"
                  }`}
                >
                  {userPlan === "Free" && (
                    <>
                      📝 Up to 30 posts • 3,000 characters • Single category •
                      Basic editor
                    </>
                  )}
                  {userPlan === "Premium" && (
                    <>
                      🚀 Up to 100 posts • 10,000 characters • Enhanced features
                      • Advanced editor
                    </>
                  )}
                  {userPlan === "Pro" && (
                    <>
                      👑 Up to 300 posts • 50,000 characters • Advanced
                      analytics • See who reads your blog
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {isLoading && (
            <AlertMessage type="loading" message="Publishing your story..." />
          )}
          {isSuccess && (
            <AlertMessage
              type="success"
              message="Story published successfully!"
            />
          )}
          {isError && <AlertMessage type="error" message={errorMsg} />}

          <form onSubmit={formik.handleSubmit} className="space-y-8">
            {/* AI Draft Generator */}
            <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/70 dark:bg-blue-900/20 p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    AI Blog Writer
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Generate a draft, then refine it before publishing.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateDraft}
                  disabled={aiGenerateMutation.isPending}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {aiGenerateMutation.isPending
                    ? "Generating..."
                    : "Generate Post"}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="Topic, e.g. React performance tips"
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <input
                  type="text"
                  value={aiAudience}
                  onChange={(e) => setAiAudience(e.target.value)}
                  placeholder="Audience"
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <input
                  type="text"
                  value={aiTone}
                  onChange={(e) => setAiTone(e.target.value)}
                  placeholder="Tone"
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <input
                  type="text"
                  value={aiGoal}
                  onChange={(e) => setAiGoal(e.target.value)}
                  placeholder="Goal"
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              {aiDraftMessage && (
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {aiDraftMessage}
                </p>
              )}
            </div>

            {/* Title */}
            <div>
              <input
                type="text"
                name="title"
                placeholder="Title"
                disabled={isBanned}
                {...formik.getFieldProps("title")}
                className={`w-full text-4xl font-serif font-bold border-none focus:outline-none focus:ring-0 p-0 bg-white dark:bg-gray-900 dark:text-white ${isBanned ? "opacity-50 cursor-not-allowed" : ""}`}
              />
              {formik.touched.title && formik.errors.title && (
                <p className="text-sm text-red-600 mt-1">
                  {formik.errors.title}
                </p>
              )}
            </div>

            {/* Ban Message */}
            {isBanned && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Account Banned
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>
                        Your account has been banned. You cannot create new
                        posts.
                      </p>
                      {userProfile?.user?.banReason && (
                        <p className="mt-1">
                          <strong>Reason:</strong> {userProfile.user.banReason}
                        </p>
                      )}
                      {userProfile?.user?.bannedBy && (
                        <p className="mt-1">
                          <strong>Contact Admin:</strong>{" "}
                          {userProfile.user.bannedBy.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Featured Image */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Featured Image
              </label>

              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    disabled={isBanned}
                    className={`absolute top-2 right-2 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${isBanned ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <FaTimesCircle className="text-red-500 text-xl" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full">
                  <button
                    type="button"
                    onClick={() => !isBanned && fileInputRef.current.click()}
                    disabled={isBanned}
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors ${isBanned ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
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
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        JPEG, PNG, WebP (Max 5MB)
                      </p>
                    </div>
                  </button>
                </div>
              )}

              {/* Hidden Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {imageError && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {imageError}
                </p>
              )}
            </div>

            {/* Category */}
            <div className="">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category{" "}
                {canSelectMultipleCategories(userPlan)
                  ? "(Multiple Selection Available)"
                  : "(Single Selection)"}
              </label>

              {!canSelectMultipleCategories(userPlan) && (
                <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    📝 <strong>Free Plan:</strong> You can select one category
                    per post.
                    <span className="block mt-1">
                      Upgrade to Premium to select multiple categories and
                      organize your content better.
                    </span>
                  </p>
                </div>
              )}

              <Select
                name="category"
                isDisabled={isBanned}
                isMulti={canSelectMultipleCategories(userPlan)}
                options={data?.categories?.map((category) => ({
                  value: category._id,
                  label: category.categoryName,
                }))}
                // Reflect current selection in the control
                value={(() => {
                  const options = (data?.categories || []).map((c) => ({
                    value: c._id,
                    label: c.categoryName,
                  }));
                  if (canSelectMultipleCategories(userPlan)) {
                    const arr = Array.isArray(formik.values.category)
                      ? formik.values.category
                      : [];
                    return options.filter((opt) => arr.includes(opt.value));
                  }
                  const selected =
                    typeof formik.values.category === "string"
                      ? formik.values.category
                      : "";
                  return options.find((opt) => opt.value === selected) || null;
                })()}
                onChange={(option) => {
                  if (canSelectMultipleCategories(userPlan)) {
                    // Multiple selection - store as array of IDs
                    const selectedCategories = option
                      ? option.map((opt) => opt.value)
                      : [];
                    formik.setFieldValue("category", selectedCategories);
                  } else {
                    // Single selection - store as single ID
                    formik.setFieldValue(
                      "category",
                      option ? option.value : "",
                    );
                  }
                }}
                className="basic-single"
                classNamePrefix="select"
                placeholder={
                  canSelectMultipleCategories(userPlan)
                    ? "Select categories..."
                    : "Select a category..."
                }
                styles={{
                  control: (provided) => ({
                    ...provided,
                    backgroundColor:
                      document.documentElement.classList.contains("dark")
                        ? "#374151"
                        : "#ffffff",
                    borderColor: document.documentElement.classList.contains(
                      "dark",
                    )
                      ? "#4b5563"
                      : "#d1d5db",
                    "&:hover": {
                      borderColor: document.documentElement.classList.contains(
                        "dark",
                      )
                        ? "#6b7280"
                        : "#9ca3af",
                    },
                  }),
                  menu: (provided) => ({
                    ...provided,
                    backgroundColor:
                      document.documentElement.classList.contains("dark")
                        ? "#374151"
                        : "#ffffff",
                    border: `1px solid ${document.documentElement.classList.contains("dark") ? "#4b5563" : "#d1d5db"}`,
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isFocused
                      ? document.documentElement.classList.contains("dark")
                        ? "#4b5563"
                        : "#f3f4f6"
                      : "transparent",
                    color: document.documentElement.classList.contains("dark")
                      ? "#f9fafb"
                      : "#111827",
                    "&:hover": {
                      backgroundColor:
                        document.documentElement.classList.contains("dark")
                          ? "#4b5563"
                          : "#f3f4f6",
                    },
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: document.documentElement.classList.contains("dark")
                      ? "#f9fafb"
                      : "#111827",
                  }),
                  multiValue: (provided) => ({
                    ...provided,
                    backgroundColor:
                      document.documentElement.classList.contains("dark")
                        ? "#4b5563"
                        : "#e5e7eb",
                  }),
                  multiValueLabel: (provided) => ({
                    ...provided,
                    color: document.documentElement.classList.contains("dark")
                      ? "#f9fafb"
                      : "#111827",
                  }),
                  input: (provided) => ({
                    ...provided,
                    color: document.documentElement.classList.contains("dark")
                      ? "#f9fafb"
                      : "#111827",
                  }),
                  placeholder: (provided) => ({
                    ...provided,
                    color: document.documentElement.classList.contains("dark")
                      ? "#9ca3af"
                      : "#6b7280",
                  }),
                }}
              />
              {formik.touched.category && formik.errors.category && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {formik.errors.category}
                </p>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                          const newTags = formik.values.tags.filter(
                            (_, i) => i !== index,
                          );
                          formik.setFieldValue("tags", newTags);
                        }}
                        className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100 transition-colors"
                        disabled={isBanned}
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
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        const newTag = e.target.value.trim();
                        if (
                          newTag &&
                          newTag.length > 0 &&
                          newTag.length <= 20
                        ) {
                          if (
                            !formik.values.tags.includes(newTag.toLowerCase())
                          ) {
                            const updatedTags = [
                              ...formik.values.tags,
                              newTag.toLowerCase(),
                            ];
                            formik.setFieldValue("tags", updatedTags);
                            formik.setFieldValue("tagInput", "");
                          }
                        }
                      }
                    }}
                    disabled={isBanned}
                    className={`flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${isBanned ? "opacity-50 cursor-not-allowed" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newTag = formik.values.tagInput?.trim();
                      if (newTag && newTag.length > 0 && newTag.length <= 20) {
                        if (
                          !formik.values.tags.includes(newTag.toLowerCase())
                        ) {
                          const updatedTags = [
                            ...formik.values.tags,
                            newTag.toLowerCase(),
                          ];
                          formik.setFieldValue("tags", updatedTags);
                          formik.setFieldValue("tagInput", "");
                        }
                      }
                    }}
                    disabled={isBanned || !formik.values.tagInput?.trim()}
                    className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${isBanned ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    Add
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Press Enter or click Add to add tags. Maximum 20 characters
                  per tag.
                </p>
              </div>
              {formik.touched.tags && formik.errors.tags && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {formik.errors.tags}
                </p>
              )}
            </div>

            {/* Post Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Post Status
              </label>
              <div className="space-y-3">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="draft"
                      checked={formik.values.status === "draft"}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      disabled={isBanned}
                      className="mr-2 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Save as Draft
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="published"
                      checked={formik.values.status === "published"}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      disabled={isBanned}
                      className="mr-2 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Publish Now
                    </span>
                  </label>

                  {/* Scheduled Posts Feature - Premium/Pro Feature */}
                  {hasScheduledPosts(userPlan) ? (
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="status"
                        value="scheduled"
                        checked={formik.values.status === "scheduled"}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        disabled={isBanned}
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Schedule for Later ⏰
                      </span>
                    </label>
                  ) : (
                    <div className="relative">
                      <label className="flex items-center opacity-50 cursor-not-allowed">
                        <input
                          type="radio"
                          name="status"
                          value="scheduled"
                          disabled
                          className="mr-2 text-gray-400"
                        />
                        <span className="text-sm text-gray-400">
                          Schedule for Later 🔒
                        </span>
                      </label>
                      <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-700">
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          Upgrade to Premium to schedule posts for later
                          publication
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Scheduled Date Picker */}
                {formik.values.status === "scheduled" &&
                  hasScheduledPosts(userPlan) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Schedule Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        value={formik.values.scheduledFor || ""}
                        onChange={(e) =>
                          formik.setFieldValue("scheduledFor", e.target.value)
                        }
                        disabled={isBanned}
                        min={new Date().toISOString().slice(0, 16)}
                        className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${isBanned ? "opacity-50 cursor-not-allowed" : ""}`}
                      />
                      {formik.touched.scheduledFor &&
                        formik.errors.scheduledFor && (
                          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                            {formik.errors.scheduledFor}
                          </p>
                        )}
                    </div>
                  )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Story
              </label>

              {/* Character Limit Indicator */}
              <CharacterLimitIndicator
                userPlan={userPlan}
                content={formik.values.description}
                className="mb-3"
              />

              <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
                {hasAdvancedEditor(userPlan) ? (
                  <AdvancedEditorLock userPlan={userPlan} isActive={true}>
                    <ReactQuill
                      theme="snow"
                      value={formik.values.description}
                      onChange={handleDescriptionChange}
                      modules={quillModules}
                      formats={quillFormats}
                      readOnly={isBanned}
                      className={`h-64 ${isBanned ? "opacity-50" : ""}`}
                      placeholder="Tell your story..."
                    />
                  </AdvancedEditorLock>
                ) : (
                  <div className="relative">
                    <textarea
                      name="description"
                      value={formik.values.description}
                      onChange={(e) => {
                        const content = e.target.value;
                        if (isWithinCharacterLimit(userPlan, content)) {
                          formik.setFieldValue("description", content);
                        }
                      }}
                      onBlur={formik.handleBlur}
                      disabled={isBanned}
                      className={`w-full h-64 p-4 border-0 focus:ring-0 resize-none text-gray-900 dark:text-white bg-white dark:bg-gray-900 placeholder-gray-500 dark:placeholder-gray-400 ${isBanned ? "opacity-50" : ""}`}
                      placeholder="Write your story... (Simple text editor for Free plan)"
                    />
                    <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      Free Plan - Basic Editor
                    </div>
                  </div>
                )}
              </div>
              {formik.touched.description && formik.errors.description && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {formik.errors.description}
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="flex flex-col space-y-3">
              {/* Character limit warning */}
              {!isWithinCharacterLimit(userPlan, formik.values.description) && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    ⚠️ Your content exceeds the {getCharacterLimit(userPlan)}{" "}
                    character limit for the {userPlan} plan. Please reduce your
                    content or upgrade your plan to publish this post.
                  </p>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={
                    isBanned ||
                    postMutation.isPending ||
                    !isWithinCharacterLimit(
                      userPlan,
                      formik.values.description,
                    ) ||
                    (formik.values.status === "scheduled" &&
                      !hasScheduledPosts(userPlan))
                  }
                  className={`px-8 py-3 bg-green-600 text-white font-medium rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isBanned ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isBanned
                    ? "Account Banned"
                    : !isWithinCharacterLimit(
                          userPlan,
                          formik.values.description,
                        )
                      ? "Content Too Long"
                      : formik.values.status === "scheduled" &&
                          !hasScheduledPosts(userPlan)
                        ? "Upgrade for Scheduling"
                        : postMutation.isPending
                          ? "Creating..."
                          : formik.values.status === "draft"
                            ? "Save Draft"
                            : formik.values.status === "scheduled"
                              ? "Schedule Post"
                              : "Publish Now"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </PlanAccessGuard>
  );
};

export default CreatePost;
