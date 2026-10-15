import { useQuery } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import api from "../../lib/api/apiClient";
import useAuthStore from "../authStore";

const ProtectedRoute = ({ children, requiredRole }) => {
  const location = useLocation();
  const { user, setAuth, clearAuth, token } = useAuthStore();

  const { data, error, isLoading, isFetching, isError, isSuccess } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const response = await api.get("/auth/profile");
      return response.data;
    },
    retry: 1,
    enabled: !!token,
  });

  useEffect(() => {
    if (error?.response?.status === 401) {
      clearAuth();
    }
  }, [error, clearAuth]);

  useEffect(() => {
    if (isSuccess && data?.user) {
      setAuth(data.user, token);
    }
  }, [isSuccess, data, setAuth, token]);

  if ((isLoading || (requiredRole && isFetching)) && !!token) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (!token) {
    return (
      <Navigate
        to="/login"
        state={{ from: location, authMessage: "No token provided" }}
        replace
      />
    );
  }

  if (isError && error?.response?.status === 401) {
    return (
      <Navigate
        to="/login"
        state={{ from: location, authMessage: "No token provided" }}
        replace
      />
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <p className="text-sm text-destructive" role="alert">
          Unable to verify your session. Please try again.
        </p>
      </div>
    );
  }

  if (!(data?.user || user)) {
    return (
      <Navigate
        to="/login"
        state={{ from: location, authMessage: "No token provided" }}
        replace
      />
    );
  }

  if (requiredRole && data?.user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
