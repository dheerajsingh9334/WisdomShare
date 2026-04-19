// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registerAPI } from "../../APIServices/users/usersAPI";
import AlertMessage from "../Alert/AlertMessage";
import { FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
import { BASE_URL } from "../../utils/baseEndpoint";
import { useDispatch } from "react-redux";
import { isAuthenticated } from "../../redux/slices/authSlices";

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  // user mutation
  const userMutation = useMutation({
    mutationKey: ["user-registration"],
    mutationFn: registerAPI,
  });
  // formik config
  const formik = useFormik({
    // initial data
    initialValues: {
      username: "",
      email: "",
      password: "",
    },
    // validation
    validationSchema: Yup.object({
      username: Yup.string().required("Username is required"),
      email: Yup.string()
        .email("Enter valid email")
        .required("Email is required"),
      password: Yup.string().required("Password is required"),
    }),
    // submit
    onSubmit: (values) => {
      console.log(values);
      userMutation
        .mutateAsync(values)
        .then((data) => {
          // Update Redux state with user data
          dispatch(isAuthenticated(data));
          // Invalidate and refetch auth query
          queryClient.invalidateQueries(['user-auth']);
          // redirect
          navigate("/login");
        })
        .catch((err) => console.log(err));
    },
  });
  console.log(userMutation);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-black/50 backdrop-blur-xl border border-white/10 text-white  shadow-lg border border-white/10 border-white/10 p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Create account</h1>
          <p className="text-gray-600 dark:text-gray-300">Join and share your stories</p>
        </div>

        {userMutation.isPending && <AlertMessage type="loading" message="Creating your account..." />}
        {userMutation.isSuccess && <AlertMessage type="success" message="Registration successful" />}
        {userMutation.isError && (
          <AlertMessage type="error" message={userMutation?.error?.response?.data?.message || "Registration failed"} />
        )}

        <form onSubmit={formik.handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Username</label>
            <input
              type="text"
              {...formik.getFieldProps("username")}
              className="w-full  p-3 outline-none border border-white/20 border-white/20 bg-black text-white dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="Choose a username"
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
              className="w-full  p-3 outline-none border border-white/20 border-white/20 bg-black text-white dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
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
                className="w-full  p-3 pr-10 outline-none border border-white/20 border-white/20 bg-black text-white dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Create a password"
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
            disabled={userMutation.isPending}
            className="w-full h-12 inline-flex items-center justify-center text-white font-semibold  bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
          >
            {userMutation.isPending ? "Creating..." : "Sign Up"}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/20 border-white/20" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-black/50 backdrop-blur-xl border border-white/10 text-white px-2 text-gray-400">Or continue with</span>
            </div>
          </div>

          <a
            href={`${BASE_URL}/users/auth/google`}
            className="w-full h-12 inline-flex items-center justify-center gap-2  border border-white/20 border-white/20 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <FaGoogle className="text-red-500" /> Sign up with Google
          </a>

          <div className="text-sm text-center">
            <span className="text-gray-600 dark:text-gray-300">Already have an account?</span>{" "}
            <Link to="/login" className="text-blue-600 hover:underline">Log in</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
