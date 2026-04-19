import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import "./index.css";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./redux/store/store.js";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { STRIPE_PUBLISHABLE_KEY } from "./config/stripe.js";



//!Create instance of client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnMount: false,
      refetchOnReconnect: 'always',
      suspense: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

//configure stripe
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY).catch(() => {
  // Stripe loading error handled silently
  return null;
});

//stripe options - removed hardcoded amount
const options = {
  mode: "payment",
  currency: "usd",
  amount: 1000, // Minimum amount for initialization (will be overridden by payment intent)
  appearance: {
    theme: 'stripe',
  },
  // Add loader configuration for better UX
  loader: 'always',
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
                  <PersistGate loading={
          <div className="min-h-screen bg-black text-white flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-400">Restoring your session...</p>
            </div>
          </div>
        } persistor={persistor}>
            <Elements stripe={stripePromise} options={options}>
              <App />
            </Elements>
          </PersistGate>
        </Provider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
