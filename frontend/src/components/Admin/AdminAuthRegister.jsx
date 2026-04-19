import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminRegisterAPI } from "../../APIServices/admin/adminAuthAPI";
import AlertMessage from "../Alert/AlertMessage";
import { FaEye, FaEyeSlash, FaShieldAlt, FaUserPlus, FaInfoCircle } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { adminLoginSuccess } from "../../redux/slices/adminAuthSlice";
import { getDefaultAdminCredentials } from "../../utils/adminConfig";

const AdminAuthRegister = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  
  const defaultCredentials = getDefaultAdminCredentials();

  const adminRegisterMutation = useMutation({
    mutationKey: ["admin-auth-register"],
    mutationFn: adminRegisterAPI,
    onSuccess: (data) => {
      
      dispatch(adminLoginSuccess(data.admin));
      queryClient.invalidateQueries(['admin-auth-status']);
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 1000);
    },
    onError: (error) => {
      
    },
  });

  const formik = useFormik({
    initialValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .min(3, "Username must be at least 3 characters")
        .max(20, "Username must be less than 20 characters")
        .matches(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
        .required("Username is required"),
      email: Yup.string()
        .email("Enter valid email")
        .required("Email is required"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required("Confirm password is required"),
    }),
    onSubmit: (values) => {
      const { confirmPassword, ...registerData } = values;
      adminRegisterMutation.mutate(registerData);
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-black/50 backdrop-blur-xl border border-white/10 text-white  shadow-xl border border-white/10 border-white/10 p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
            <FaShieldAlt className="text-2xl text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">Admin Registration</h1>
          <p className="text-gray-600 dark:text-gray-300">Create admin account</p>
          
          {/* Admin Registration Info */}
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 ">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                <FaInfoCircle className="inline mr-1" />
                Admin Registration
              </h3>
              <button
                type="button"
                onClick={() => setShowCredentials(!showCredentials)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 text-sm font-medium"
              >
                {showCredentials ? "Hide" : "Show"} Info
              </button>
            </div>
            
            {showCredentials && (
              <div className="text-left text-xs text-blue-800 dark:text-blue-200 space-y-1">
                <p><strong>Default Username:</strong> {defaultCredentials.username}</p>
                <p><strong>Default Email:</strong> {defaultCredentials.email}</p>
                <p><strong>Default Password:</strong> {defaultCredentials.password}</p>
                <p className="text-blue-600 dark:text-blue-300 mt-2">
                  ⚠️ Change these credentials immediately after first login for security!
                </p>
              </div>
            )}
          </div>
        </div>

        {adminRegisterMutation.isPending && <AlertMessage type="loading" message="Creating admin account..." />}
        {adminRegisterMutation.isSuccess && <AlertMessage type="success" message="Admin account created! Redirecting..." />}
        {adminRegisterMutation.isError && (
          <AlertMessage type="error" message={adminRegisterMutation?.error?.response?.data?.message || adminRegisterMutation?.error?.message || "Registration failed"} />
        )}

        <form onSubmit={formik.handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Username</label>
            <input
              type="text"
              {...formik.getFieldProps("username")}
              className="w-full  p-3 outline-none border border-white/20 border-white/20 bg-black text-white dark:text-white focus:ring-2 focus:ring-red-500"
              placeholder="Enter admin username"
            />
            {formik.touched.username && formik.errors.username && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.username}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Email</label>
            <input
              type="email"
              {...formik.getFieldProps("email")}
              className="w-full  p-3 outline-none border border-white/20 border-white/20 bg-black text-white dark:text-white focus:ring-2 focus:ring-red-500"
              placeholder="Enter admin email"
            />
            {formik.touched.email && formik.errors.email && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.email}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...formik.getFieldProps("password")}
                className="w-full  p-3 pr-10 outline-none border border-white/20 border-white/20 bg-black text-white dark:text-white focus:ring-2 focus:ring-red-500"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {formik.touched.password && formik.errors.password && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.password}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                {...formik.getFieldProps("confirmPassword")}
                className="w-full  p-3 pr-10 outline-none border border-white/20 border-white/20 bg-black text-white dark:text-white focus:ring-2 focus:ring-red-500"
                placeholder="Confirm password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.confirmPassword}</div>
            )}
          </div>



          <button
            type="submit"
            disabled={adminRegisterMutation.isPending}
            className="w-full h-12 inline-flex items-center justify-center text-white font-semibold  bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500"
          >
            <FaUserPlus className="mr-2" />
            {adminRegisterMutation.isPending ? "Creating Account..." : "Create Admin Account"}
          </button>

          <div className="text-sm text-center space-y-2">
            <p className="text-gray-600 dark:text-gray-300">
              Already have admin access?{" "}
              <Link to="/admin/auth/login" className="text-red-600 hover:underline font-medium">
                Sign in
              </Link>
            </p>
            <p className="text-gray-400">
              <Link to="/login" className="hover:underline">← Back to regular login</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAuthRegister;
