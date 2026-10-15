import { useQuery } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import React from "react";
import api from "../lib/api/apiClient";

const AdminPage = () => {
  const { data, error, isLoading } = useQuery({
    queryKey: ["adminDashboard"],
    queryFn: async () => {
      const response = await api.get("/admin/dashboard");
      return response.data;
    },
  });

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground">
      <section className="mx-auto w-full max-w-5xl">
        <h1 className="text-3xl font-bold">Admin dashboard</h1>
        {isLoading ? (
          <div className="mt-6 flex items-center gap-2">
            <Loader className="animate-spin" aria-hidden="true" />
            <p>Loading admin dashboard...</p>
          </div>
        ) : error ? (
          <p className="mt-6 text-destructive" role="alert">
            {error.response?.data?.message ??
              "Unable to load the admin dashboard."}
          </p>
        ) : (
          <p className="mt-4">{data.message}</p>
        )}
      </section>
    </main>
  );
};

export default AdminPage;
