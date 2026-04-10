import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getStoredToken } from "../services/api";

export default function ProtectedRoute() {
  const location = useLocation();
  const token = getStoredToken();

  if (!token) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
