import "./config/walletProvider.js";

import { useMemo, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import Landing from "./pages/Landing";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ConsumerDashboard from "./pages/ConsumerDashboard";
import WorkerDashboard from "./pages/WorkerDashboard";
import { useFirebaseAuth } from "./hooks/useFirebaseAuth.js";

// stripe
import { CheckoutProvider } from "@stripe/react-stripe-js/checkout";
import { loadStripe } from "@stripe/stripe-js";

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(
  "pk_test_51T5s80Ln3nYuA8wyLQTdzPx0hKNqtHKrgwqyflGgqJrccBIhmoe0SxTiIuNLNLXhmMju23a2q4waXY6XnxLO99GI00la1l6j8T",
);

export default function App() {
  const { user, logout, loading: loadingAuth } = useFirebaseAuth();
  const [currentView, setCurrentView] = useState<
    "landing" | "signin" | "signup" | "dashboard"
  >("landing");
  const [userRole, setUserRole] = useState<"consumer" | "worker">("consumer");

  const promise = useMemo(() => {
    return fetch("/create-checkout-session", {
      method: "POST",
    })
      .then((res) => res.json())
      .then((data) => data.clientSecret);
  }, []);

  const handleLaunchApp = () => {
    if (user) {
      setCurrentView("dashboard");
    } else {
      setCurrentView("signin");
    }
  };

  const handleSignIn = () => {
    setCurrentView("dashboard");
  };

  const handleSignUp = () => {
    setCurrentView("dashboard");
  };

  const handleRoleSwitch = () => {
    setUserRole((prev) => (prev === "consumer" ? "worker" : "consumer"));
  };

  const handleLogout = () => {
    setCurrentView("landing");
    setUserRole("consumer");
    logout();
  };

  if (loadingAuth) return;
  <Box
    display={"flex"}
    alignItems={"center"}
    justifyContent={"center"}
    margin={10}
  >
    <CircularProgress />
  </Box>;

  return (
    <CheckoutProvider
      stripe={stripePromise}
      options={{ clientSecret: promise }}
    >
      <Box>
        {currentView === "landing" && <Landing onLaunchApp={handleLaunchApp} />}
        {currentView === "signin" && (
          <SignIn
            onSignIn={handleSignIn}
            onGoToSignUp={() => setCurrentView("signup")}
          />
        )}
        {currentView === "signup" && (
          <SignUp
            onSignUp={handleSignUp}
            onGoToSignIn={() => setCurrentView("signin")}
          />
        )}
        {currentView === "dashboard" && userRole === "consumer" && (
          <ConsumerDashboard
            onRoleSwitch={handleRoleSwitch}
            onLogout={handleLogout}
            user={user}
          />
        )}
        {currentView === "dashboard" && userRole === "worker" && (
          <WorkerDashboard
            onRoleSwitch={handleRoleSwitch}
            onLogout={handleLogout}
            user={user}
          />
        )}
      </Box>
    </CheckoutProvider>
  );
}
