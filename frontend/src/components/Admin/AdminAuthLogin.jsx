import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminLoginAPI } from "../../APIServices/admin/adminAuthAPI";
import AlertMessage from "../Alert/AlertMessage";
import { FaEye, FaEyeSlash, FaShieldAlt, FaLock } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { adminLoginSuccess, adminLoginFailure } from "../../redux/slices/adminAuthSlice";

const AdminAuthLogin = () => {

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);

  const adminLoginMutation = useMutation({
    mutationKey: ["admin-auth-login"],
    mutationFn: adminLoginAPI,
    onSuccess: (data) => {
      
      dispatch(adminLoginSuccess(data.admin));
      queryClient.invalidateQueries(['admin-auth-status']);
      // Navigate immediately after successful login
      navigate("/admin/dashboard");
    },
    onError: (error) => {
      
      dispatch(adminLoginFailure(error.message || "Admin login failed"));
    },
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Enter valid email")
        .required("Email is required"),
      password: Yup.string().min(6, "Min 6 characters").required("Password is required"),
    }),
    onSubmit: (values) => {
      adminLoginMutation.mutate(values);
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-black/50 backdrop-blur-xl border border-white/10 text-white  shadow-xl border border-white/10 border-white/10 p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
            <FaShieldAlt className="text-2xl text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">Admin Access</h1>
          <p className="text-gray-600 dark:text-gray-300">Sign in to admin panel</p>
        </div>

        {adminLoginMutation.isPending && <AlertMessage type="loading" message="Signing you in..." />}
        {adminLoginMutation.isSuccess && <AlertMessage type="success" message="Admin login successful! Redirecting..." />}
        {adminLoginMutation.isError && (
          <AlertMessage type="error" message={adminLoginMutation?.error?.response?.data?.message || adminLoginMutation?.error?.message || "Login failed"} />
        )}

        <form onSubmit={formik.handleSubmit} className="space-y-5">
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
                placeholder="Enter admin password"
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

          <button
            type="submit"
            disabled={adminLoginMutation.isPending}
            className="w-full h-12 inline-flex items-center justify-center text-white font-semibold  bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500"
          >
            <FaLock className="mr-2" />
            {adminLoginMutation.isPending ? "Signing in..." : "Admin Login"}
          </button>

          <div className="text-sm text-center space-y-2">
            <p className="text-gray-600 dark:text-gray-300">
              Don't have admin access?{" "}
              <Link to="/admin/auth/register" className="text-red-600 hover:underline font-medium">
                Register as Admin
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

export default AdminAuthLogin;
