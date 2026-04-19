import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaCrown, FaChartLine } from "react-icons/fa";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { isAuthenticated } from "../../redux/slices/authSlices";
import { paymentVerificationAPI } from "../../APIServices/stripe/plans";
import { userProfileAPI } from "../../APIServices/users/usersAPI";
import { getPlanTier, getPlanInfo, PLAN_TIERS } from "../../utils/planUtils";

const PaymentSuccess = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const paymentIntentId = searchParams.get("payment_intent");
  
  const { isError: paymentError, isLoading: paymentLoading, isSuccess: paymentSuccess, data: paymentData } = useQuery({
    queryKey: ["verify-payment"],
    queryFn: () => paymentVerificationAPI(paymentIntentId),
    enabled: !!paymentIntentId,
    onSuccess: (data) => {
      console.log("Payment verification successful:", data);
      // Force invalidate all relevant queries to refresh data
      queryClient.invalidateQueries(["user-auth"]);
      queryClient.invalidateQueries(["profile"]);
      queryClient.invalidateQueries(["user-plan-usage"]);
      
      // If the payment verification returned user data with plan, update Redux immediately
      if (data?.userFound?.plan) {
        console.log("Updating Redux with user data:", data.userFound);
        dispatch(isAuthenticated(data.userFound));
      }
    }
  });

  // Fetch updated user profile to show new plan
  const { data: userData, refetch: refetchUserProfile } = useQuery({
    queryKey: ["profile"],
    queryFn: userProfileAPI,
    enabled: paymentSuccess,
    onSuccess: (data) => {
      console.log("User profile fetched:", data);
      // Update Redux auth state with new user data including plan
      if (data?.user) {
        console.log("Updating Redux with profile data:", data.user);
        dispatch(isAuthenticated(data.user));
      }
    }
  });

  // Force refetch user profile after payment success
  useEffect(() => {
    if (paymentSuccess) {
      // Wait a bit for the backend to process the plan update
      const timeoutId = setTimeout(() => {
        console.log("Forcing user profile refetch...");
        refetchUserProfile();
      }, 2000); // Increased delay to ensure backend has processed the update
      
      return () => clearTimeout(timeoutId);
    }
  }, [paymentSuccess, refetchUserProfile]);

  const userPlan = userData?.user?.plan || paymentData?.userFound?.plan;
  const planTier = getPlanTier(userPlan);
  const planInfo = getPlanInfo(userPlan);

  console.log("Current userPlan:", userPlan);
  console.log("Current planTier:", planTier);
  console.log("Current planInfo:", planInfo);

  const getPlanIcon = (tier) => {
    switch (tier) {
      case PLAN_TIERS.PRO:
        return <FaCrown className="text-yellow-500" />;
      case PLAN_TIERS.PREMIUM:
        return <FaChartLine className="text-green-500" />;
      default:
        return null;
    }
  };

  const getPlanColor = (tier) => {
    switch (tier) {
      case PLAN_TIERS.PRO:
        return "text-indigo-600 bg-indigo-50";
      case PLAN_TIERS.PREMIUM:
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="p-8 bg-black/40 backdrop-blur-md text-white  shadow-xl max-w-md w-full">
        {paymentLoading ? (
          <div className="flex flex-col items-center space-y-4">
            <FaSpinner className="animate-spin text-4xl text-green-500" />
            <p className="text-lg text-gray-600">
              Verifying your payment, please wait...
            </p>
          </div>
        ) : paymentError ? (
          <div className="flex flex-col items-center space-y-4">
            <FaTimesCircle className="text-5xl text-red-500" />
            <h1 className="text-2xl font-bold text-red-600">Payment Verification Failed</h1>
            <p className="text-red-500 text-center">{paymentError.message}</p>
            <Link
              to="/dashboard"
              className="w-full flex items-center justify-center py-2 px-4 bg-gray-500 text-white  hover:bg-gray-600 focus:outline-none"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : paymentSuccess ? (
          <div className="flex flex-col items-center space-y-6">
            <FaCheckCircle className="text-6xl text-green-500" />
            <h1 className="text-3xl font-bold text-white">Payment Successful!</h1>
            
            {/* Plan Access Info */}
            {userPlan && (
              <div className={`w-full p-4  border ${getPlanColor(planTier)}`}>
                <div className="flex items-center justify-center space-x-2 mb-2">
                  {getPlanIcon(planTier)}
                  <h2 className="text-xl font-semibold">
                    Welcome to {planInfo.name}!
                  </h2>
                </div>
                <p className="text-center text-sm">
                  You now have access to {planInfo.postLimit ? `${planInfo.postLimit} posts` : 'unlimited posts'} and premium features.
                </p>
              </div>
            )}

            <p className="text-gray-600 text-center">
              Thank you for your payment. Your transaction has been processed successfully.
            </p>
            
            {paymentIntentId && (
              <p className="text-xs text-gray-500 text-center">
                Transaction ID: {paymentIntentId}
              </p>
            )}

            {/* Feature Highlights */}
            {planInfo && planInfo.features && (
              <div className="w-full">
                <h3 className="font-semibold text-white mb-2">Your new features include:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  {Object.entries(planInfo.features)
                    .filter(([, value]) => value === true)
                    .slice(0, 5)
                    .map(([feature], index) => (
                    <li key={index} className="flex items-center">
                      <FaCheckCircle className="text-green-500 mr-2 text-xs" />
                      {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </li>
                  ))}
                  {Object.entries(planInfo.features).filter(([, value]) => value === true).length > 5 && (
                    <li className="text-gray-500 italic">
                      ...and {Object.entries(planInfo.features).filter(([, value]) => value === true).length - 5} more features
                    </li>
                  )}
                </ul>
              </div>
            )}

            <div className="w-full space-y-3">
              <Link
                to="/dashboard/create-post"
                className="w-full flex items-center justify-center py-3 px-4 bg-green-600 text-white  hover:bg-green-700 focus:outline-none font-semibold transition-colors"
              >
                Start Creating Content
              </Link>
              
              <Link
                to="/dashboard"
                className="w-full flex items-center justify-center py-2 px-4 border border-white/20 text-gray-700  hover:bg-gray-50 focus:outline-none transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <FaSpinner className="animate-spin text-4xl text-gray-500" />
            <p className="text-lg text-gray-600">Processing...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
