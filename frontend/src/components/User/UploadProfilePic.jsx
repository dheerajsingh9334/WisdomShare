import { useRef, useState, useCallback,useEffect } from "react";
import { useDispatch } from "react-redux";
import { isAuthenticated } from "../../redux/slices/authSlices";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FaCloudUploadAlt, FaImage, FaTrash } from "react-icons/fa";
import { useMutation } from "@tanstack/react-query";
import { uplaodProfilePicAPI } from "../../APIServices/users/usersAPI";
import AlertMessage from "../Alert/AlertMessage";
import { useNavigate } from "react-router-dom";


const UploadProfilePic = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [imageError, setImageErr] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const mutation = useMutation({
    mutationKey: ["upload-profile-pic"],
    mutationFn: uplaodProfilePicAPI,
  });

  const formik = useFormik({
    initialValues: {
      image: null,
    },
    validationSchema: Yup.object({
      image: Yup.mixed().required("Image is required"),
    }),
    onSubmit: async (values) => {
      if (!values.image) return;
      
      const formData = new FormData();
      formData.append("image", values.image);
      
      // Simulate upload progress
      setUploadProgress(0);
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      try {
        const res = await mutation.mutateAsync(formData);
        setUploadProgress(100);
        setTimeout(() => setUploadProgress(0), 1000);
        // Refresh auth state so navbar/avatar shows the new picture
        if (res?.user) {
          dispatch(isAuthenticated({ isAuthenticated: true, ...res.user }));
        }
      } catch (error) {
        setUploadProgress(0);
        console.error("Upload failed:", error);
      }
    },
  });

  const validateFile = (file) => {
    if (!file) return false;

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setImageErr("File size exceeds 5MB");
      return false;
    }

    // Check file type
    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
      setImageErr("Only JPEG, JPG, PNG and WebP files allowed");
      return false;
    }

    setImageErr("");
    return true;
  };

  const handleFileChange = (event) => {
    const file = event.currentTarget.files[0];
    if (!file) return;

    if (validateFile(file)) {
      formik.setFieldValue("image", file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file && validateFile(file)) {
      formik.setFieldValue("image", file);
      setImagePreview(URL.createObjectURL(file));
    }
  }, [formik]);

  const removeImage = () => {
    formik.setFieldValue("image", null);
    setImagePreview(null);
    setImageErr("");
    if (fileInputRef.current) fileInputRef.current.value = null;
    if (cameraInputRef.current) cameraInputRef.current.value = null;
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

    useEffect(() => {
    if (mutation.isSuccess) {
      const timer = setTimeout(() => {
        navigate("/profile");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [mutation.isSuccess, navigate]);

  const isLoading = mutation.isPending;
  const isSuccess = mutation.isSuccess;
  const isError = mutation.isError;
  const errorMsg = mutation?.error?.response?.data?.message;


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Update Profile Picture
          </h1>
          <p className="text-gray-400">
            Upload a new profile picture to personalize your account
          </p>
        </div>

        {/* Upload Form */}
        <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  shadow-xl p-8 border border-white/5 border-white/10">
          {/* Alert Messages */}
          {isLoading && <AlertMessage type="loading" message="Uploading your image..." />}
          {isSuccess && <AlertMessage type="success" message="Profile picture updated successfully!" />}
          {isError && <AlertMessage type="error" message={errorMsg || "Upload failed. Please try again."} />}

          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* Image Preview */}
            {imagePreview && (
              <div className="text-center">
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Profile Preview"
                    className="w-48 h-48 object-cover rounded-full border-4 border-white border-white/10 shadow-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-colors duration-200"
                    title="Remove image"
                  >
                    <FaTrash className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-4 text-sm text-gray-400">
                  Preview of your new profile picture
                </p>
              </div>
            )}

            {/* Upload Area */}
            {!imagePreview && (
              <div
                className={`border-2 border-dashed  p-8 text-center transition-all duration-200 ${
                  isDragOver
                    ? "border-purple-400 bg-purple-50 dark:bg-purple-900/20"
                    : "border-white/20 border-white/20 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <FaCloudUploadAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  Upload Profile Picture
                </h3>
                <p className="text-gray-400 mb-4">
                  Drag and drop your image here, or click to browse
                </p>
                
                {/* Upload Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    type="button"
                    onClick={openFileDialog}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white  transition-colors duration-200"
                  >
                    <FaImage className="h-4 w-4" />
                    Choose File
                  </button>
                  {/* <button
                    type="button"
                    onClick={openCamera}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white  transition-colors duration-200"
                  >
                    <FaCamera className="h-4 w-4" />
                    Take Photo
                  </button> */}
                </div>
                
                <p className="text-xs text-gray-400 mt-4">
                  Supported formats: JPG, PNG, WebP (Max 5MB)
                </p>
              </div>
            )}

            {/* Hidden File Inputs */}
            <input
              ref={fileInputRef}
              type="file"
              name="image"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              name="camera"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Error Messages */}
            {imageError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800  p-3">
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                  <span className="mr-2">⚠</span>
                  {imageError}
                </p>
              </div>
            )}
            {formik.touched.image && formik.errors.image && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800  p-3">
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                  <span className="mr-2">⚠</span>
                  {formik.errors.image}
                </p>
              </div>
            )}

            {/* Upload Progress */}
            {uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 bg-white/5 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Upload Button */}
            {imagePreview && (
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isLoading || mutation.isPending}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6  transition-all duration-200 transform hover:scale-[1.02] focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading || mutation.isPending ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </div>
                  ) : (
                    "Upload Profile Picture"
                  )}
                </button>
                <button
                  type="button"
                  onClick={removeImage}
                  className="px-6 py-3 border border-white/20 border-white/20 text-gray-300  hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20  p-6 border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            💡 Tips for the best profile picture
          </h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>• Use a clear, high-quality image</li>
            <li>• Square images work best (1:1 ratio)</li>
            <li>• Make sure your face is clearly visible</li>
            <li>• Avoid blurry or low-resolution images</li>
            <li>• Keep file size under 5MB for faster upload</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UploadProfilePic;
