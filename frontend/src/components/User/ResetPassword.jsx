import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { RiLockPasswordLine } from "react-icons/ri";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { changePasswordAPI } from "../../APIServices/users/usersAPI";
import AlertMessage from "../Alert/AlertMessage";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const userMutation = useMutation({
    mutationKey: ["change-password"],
    mutationFn: changePasswordAPI,
  });

  const formik = useFormik({
    initialValues: { 
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    },
    validationSchema: Yup.object({
      currentPassword: Yup.string().required("Current password is required"),
      newPassword: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("New password is required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
        .required("Please confirm your password"),
    }),
    onSubmit: (values) => {
      if (values.currentPassword === values.newPassword) {
        formik.setFieldError('newPassword', 'New password must be different from current password');
        return;
      }
      
      userMutation
        .mutateAsync({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword
        })
        .then(() => {
          alert("Password changed successfully!");
          navigate("/dashboard");
        })
        .catch((err) => {
          console.error('Password change error:', err);
          if (err.response?.data?.message) {
            alert(err.response.data.message);
          } else if (err.message) {
            alert("Failed to change password: " + err.message);
          } else {
            alert("Failed to change password. Please try again.");
          }
        });
    },
  });
  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white py-12">
      <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white p-8  shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center text-white mb-6">
          Change Your Password
        </h2>
        
        {userMutation.isPending && (
          <AlertMessage type="loading" message="Changing password, please wait..." />
        )}
        
        <form className="space-y-6" onSubmit={formik.handleSubmit}>
          {/* Current Password */}
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300 mb-2">
              Current Password
            </label>
            <div className="relative">
              <div className="flex items-center border border-white/20 border-white/20  focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-transparent">
                <RiLockPasswordLine className="mx-3 text-orange-500" />
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  id="currentPassword"
                  {...formik.getFieldProps("currentPassword")}
                  className="w-full px-3 py-2 border-0 bg-transparent text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
                  placeholder="Enter your current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="px-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showCurrentPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                </button>
              </div>
              {formik.touched.currentPassword && formik.errors.currentPassword && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.currentPassword}
                </div>
              )}
            </div>
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">
              New Password
            </label>
            <div className="relative">
              <div className="flex items-center border border-white/20 border-white/20  focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-transparent">
                <RiLockPasswordLine className="mx-3 text-orange-500" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="newPassword"
                  {...formik.getFieldProps("newPassword")}
                  className="w-full px-3 py-2 border-0 bg-transparent text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
                  placeholder="Enter your new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="px-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showNewPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                </button>
              </div>
              {formik.touched.newPassword && formik.errors.newPassword && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.newPassword}
                </div>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Password must be at least 6 characters long
              </p>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="flex items-center border border-white/20 border-white/20  focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-transparent">
                <RiLockPasswordLine className="mx-3 text-orange-500" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  {...formik.getFieldProps("confirmPassword")}
                  className="w-full px-3 py-2 border-0 bg-transparent text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
                  placeholder="Confirm your new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="px-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showConfirmPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                </button>
              </div>
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.confirmPassword}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={userMutation.isPending}
            className="w-full px-4 py-2 text-white bg-orange-600  hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {userMutation.isPending ? "Changing Password..." : "Change Password"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 text-sm font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
