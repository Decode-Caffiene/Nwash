import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Also read localStorage directly: React's state batch may not have flushed
  // yet when navigate() fires immediately after login(), causing a false block.
  const hasSession = localStorage.getItem("isLoggedIn") === "true";

  if (!isAuthenticated && !hasSession) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
