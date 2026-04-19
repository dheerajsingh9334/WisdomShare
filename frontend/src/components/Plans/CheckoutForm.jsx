import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { paymentIntentAPI } from "../../APIServices/stripe/plans";
import { fetchPlansAPI } from "../../APIServices/plans/plans";
import AlertMessage from "../Alert/AlertMessage";
import {
  FaCheck,
  FaCrown,
  FaChartLine,
  FaGift,
  FaInfinity,
  FaStar,
} from "react-icons/fa";

const CheckoutForm = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const submitLockRef = useRef(false);

  // Configure stripe
  const stripe = useStripe();
  const elements = useElements();

  // Payment mutation
  const paymentMutation = useMutation({
    mutationKey: ["checkout"],
    mutationFn: paymentIntentAPI,
    onError: (error) => {
      console.error("Payment mutation error:", error);
      setErrorMessage(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "An unexpected error occurred. Please try again.",
      );
      setIsProcessing(false);
    },
  });

  // Plan candidate from navigation state
  const planCandidate = location?.state?.planCandidate;

  // Use planId from URL params first, then fallback to planCandidate
  const effectivePlanId =
    planId ||
    planCandidate?._id ||
    planCandidate?.tier ||
    planCandidate?.planName;

  // Redirect if no plan identifier is available
  useEffect(() => {
    if (!effectivePlanId) {
      console.log("No plan ID found, redirecting to pricing");
      navigate("/pricing", { replace: true });
    }
  }, [effectivePlanId, navigate]);

  // Fetch plans to get plan details
  const { data: plansData, isLoading: plansLoading } = useQuery({
    queryKey: ["pricing-lists"],
    queryFn: fetchPlansAPI,
  });

  // Debug: Log plan ID and whether plans loaded
  console.log("Debug Info:");
  console.log("Plan ID from URL:", planId);
  console.log("Plan Candidate:", planCandidate);
  console.log("Effective Plan ID:", effectivePlanId);
  console.log(
    "Available plans:",
    Array.isArray(plansData?.plans) ? plansData.plans : [],
  );
  console.log("Stripe Loaded:", !!stripe);
  console.log("Elements Loaded:", !!elements);

  // Find the current plan with fallback if plans are not loaded
  let currentPlan =
    planCandidate ||
    plansData?.plans?.find(
      (plan) =>
        plan._id === effectivePlanId ||
        plan.tier === effectivePlanId ||
        plan.planName?.toLowerCase() === effectivePlanId?.toLowerCase(),
    );

  if (!currentPlan && effectivePlanId) {
    // Enhanced client-side fallback with full plan details
    const fallbackPlans = {
      free: {
        planName: "Free",
        tier: "free",
        price: 0,
        postLimit: 30,
        features: [
          "Create posts",
          "Basic editor",
          "Community access",
          "Mobile responsive",
        ],
      },
      premium: {
        planName: "Premium",
        tier: "premium",
        price: 29,
        postLimit: 100,
        features: [
          "Enhanced posting",
          "Advanced editor",
          "Priority support",
          "Custom branding",
          "Scheduled posts",
        ],
      },
      pro: {
        planName: "Pro",
        tier: "pro",
        price: 99,
        postLimit: 300,
        features: [
          "Unlimited features",
          "Advanced analytics",
          "API access",
          "White-label solution",
          "Dedicated support",
        ],
      },
    };
    currentPlan = fallbackPlans[`${effectivePlanId}`.toLowerCase()];
  }

  console.log("Current plan found:", currentPlan);

  // Get plan icon
  const getPlanIcon = (tier) => {
    switch (tier?.toLowerCase()) {
      case "pro":
        return <FaCrown className="text-yellow-500" />;
      case "premium":
        return <FaChartLine className="text-green-500" />;
      case "free":
        return <FaGift className="text-blue-500" />;
      default:
        return <FaStar className="text-gray-500" />;
    }
  };

  // Get plan color classes
  const getPlanColors = (tier) => {
    switch (tier?.toLowerCase()) {
      case "pro":
        return {
          bg: "bg-indigo-50 dark:bg-indigo-900/20",
          border: "border-indigo-200 dark:border-indigo-700",
          text: "text-indigo-700 dark:text-indigo-300",
          button: "bg-indigo-600 hover:bg-indigo-700",
        };
      case "premium":
        return {
          bg: "bg-green-50 dark:bg-green-900/20",
          border: "border-green-200 dark:border-green-700",
          text: "text-green-700 dark:text-green-300",
          button: "bg-green-600 hover:bg-green-700",
        };
      case "free":
        return {
          bg: "bg-gray-50 dark:bg-gray-900/20",
          border: "border-gray-200 dark:border-gray-700",
          text: "text-gray-700 dark:text-gray-300",
          button: "bg-gray-600 hover:bg-gray-700",
        };
      default:
        return {
          bg: "bg-gray-50 dark:bg-gray-900/20",
          border: "border-gray-200 dark:border-gray-700",
          text: "text-gray-700 dark:text-gray-300",
          button: "bg-gray-600 hover:bg-gray-700",
        };
    }
  };

  // Check if plan ID is valid
  if (effectivePlanId && !currentPlan && !plansLoading) {
    return (
      <div className="bg-gray-900 h-screen -mt-4 flex justify-center items-center">
        <div className="w-96 mx-auto my-4 p-6 bg-white rounded-lg shadow-md text-center">
          <div className="mb-4">
            <svg
              className="w-16 h-16 text-red-500 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid Plan</h2>
          <p className="text-gray-600 mb-4">
            The selected plan &quot;{effectivePlanId}&quot; is not valid. Please
            select a plan from our pricing page.
          </p>
          <button
            onClick={() => navigate("/pricing")}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            View Plans
          </button>
        </div>
      </div>
    );
  }

  // Handle submit for payment
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitLockRef.current) return;
    submitLockRef.current = true;

    if (!stripe || !elements) {
      setErrorMessage("Stripe is not loaded. Please refresh the page.");
      submitLockRef.current = false;
      return;
    }

    if (!effectivePlanId) {
      setErrorMessage("No plan selected. Please select a plan first.");
      submitLockRef.current = false;
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Submit the payment element
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setErrorMessage(submitError.message || "Payment submission failed");
        setIsProcessing(false);
        submitLockRef.current = false;
        return;
      }

      // Create payment intent - use the actual plan ID or fall back to plan tier
      const planIdToUse =
        currentPlan?._id || currentPlan?.tier || effectivePlanId;
      console.log("Creating payment intent for plan:", planIdToUse);

      const paymentResult = await paymentMutation.mutateAsync(planIdToUse);

      console.log("Payment result:", paymentResult);

      if (!paymentResult?.clientSecret) {
        console.error("No client secret in payment result:", paymentResult);
        setErrorMessage(
          `Failed to create payment intent for plan &quot;${planIdToUse}&quot;. Please try again or contact support.`,
        );
        setIsProcessing(false);
        submitLockRef.current = false;
        return;
      }

      // Confirm the payment
      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        clientSecret: paymentResult.clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/success`,
        },
      });

      if (confirmError) {
        setErrorMessage(confirmError.message || "Payment confirmation failed");
        setIsProcessing(false);
        submitLockRef.current = false;
        return;
      }

      // Payment successful - redirect will happen automatically
      setIsProcessing(false);
      submitLockRef.current = false;
    } catch (error) {
      console.error("Payment error:", error);
      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          "An unexpected error occurred. Please try again.",
      );
      setIsProcessing(false);
      submitLockRef.current = false;
    }
  };

  if (!stripe || !elements) {
    return (
      <div className="bg-gray-900 h-screen -mt-4 flex justify-center items-center">
        <div className="w-96 mx-auto my-4 p-6 bg-white rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment form...</p>
        </div>
      </div>
    );
  }

  const planColors = getPlanColors(currentPlan?.tier);

  return (
    <div className="bg-gray-900 min-h-screen -mt-4 flex justify-center items-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Plan Details Section */}
          <div
            className={`p-6 rounded-lg shadow-md ${planColors.bg} ${planColors.border} border`}
          >
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                {getPlanIcon(currentPlan?.tier)}
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {currentPlan?.planName}
              </h2>
              <div className="text-4xl font-bold mb-2">
                <span className={planColors.text}>${currentPlan?.price}</span>
                <span className="text-lg text-gray-600 dark:text-gray-400">
                  /month
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {currentPlan?.postLimit
                  ? `${currentPlan.postLimit} posts`
                  : "Unlimited posts"}
              </p>
            </div>

            {/* Plan Features */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                What&apos;s included:
              </h3>
              <ul className="space-y-3 max-h-96 overflow-y-auto">
                {currentPlan?.features?.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <FaCheck className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300 text-sm">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Plan Benefits */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                Plan Benefits:
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <FaInfinity className="text-blue-500 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {currentPlan?.postLimit
                      ? `${currentPlan.postLimit} posts`
                      : "Unlimited posts"}
                  </span>
                </div>
                <div className="flex items-center">
                  <FaStar className="text-yellow-500 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {currentPlan?.tier === "free"
                      ? "Basic"
                      : currentPlan?.tier === "premium"
                        ? "Advanced"
                        : "Premium"}{" "}
                    features
                  </span>
                </div>
                <div className="flex items-center">
                  <FaCheck className="text-green-500 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {currentPlan?.tier === "free" ? "Standard" : "Priority"}{" "}
                    support
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Complete Your Purchase
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {currentPlan
                  ? `Upgrading to ${currentPlan.planName}`
                  : "Enter your payment details to continue"}
              </p>
              {currentPlan?.price > 0 && (
                <p className="text-lg font-semibold text-green-600 mt-2">
                  ${currentPlan.price}/month
                </p>
              )}
            </div>

            {/* Stripe payment element */}
            <div className="mb-6">
              <PaymentElement />
            </div>

            {/* Display loading */}
            {isProcessing && (
              <AlertMessage
                type="loading"
                message="Processing payment, please wait..."
              />
            )}

            {/* Display error */}
            {paymentMutation?.isError && (
              <AlertMessage
                type="error"
                message={
                  paymentMutation?.error?.response?.data?.message ||
                  "Payment failed"
                }
              />
            )}

            {/* Display custom error */}
            {errorMessage && (
              <AlertMessage type="error" message={errorMessage} />
            )}

            {/* Submit button */}
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isProcessing || paymentMutation?.isPending}
              className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${planColors.button} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200`}
            >
              {isProcessing
                ? "Processing..."
                : `Pay $${currentPlan?.price || 0}`}
            </button>

            {/* Cancel button */}
            <button
              type="button"
              onClick={() => navigate("/pricing")}
              className="w-full mt-3 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              Cancel
            </button>

            {/* Security notice */}
            <div className="mt-4 text-xs text-gray-500 text-center">
              🔒 Your payment is secured by Stripe
            </div>

            {/* Money-back guarantee */}
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center text-sm text-green-700 dark:text-green-300">
                <FaCheck className="mr-2" />
                <span>30-day money-back guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;
