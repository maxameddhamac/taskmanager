import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api/apiClient";
import useAuthStore from "../authStore";
import { extractErrorMessages } from "../../../util/errorUtils";

function SubmitButton({ pending = false }) {
  return (
    <Button type="submit" disabled={pending} className="w-full cursor-pointer">
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <LoaderCircle className="animate-spin" />
          Signing in...
        </span>
      ) : (
        "Sign in"
      )}
    </Button>
  );
}

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(location.state?.authMessage ?? null);
  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const response = await api.post("/auth/login", credentials);
      if (!response.data?.token) {
        throw new Error(
          "Login response did not include an authentication token.",
        );
      }
      return response.data;
    },
    onSuccess: ({ token, user }) => {
      setAuth(user, token);
      navigate(user?.role === "admin" ? "/admin" : "/dashboard");
    },
    onError: (mutationError) => setError(extractErrorMessages(mutationError)),
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError(null);

    const { email, password } = formValues;
    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    loginMutation.mutate({
      email: email.trim(),
      password,
    });
  };

  return (
    <Card className="mx-auto w-full max-w-md border-border">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-center text-xl">
          Sign in to your account
        </CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-0">
          {error && (
            <div
              role="alert"
              className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
            >
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-left text-sm font-medium"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="email@email.com"
              required
              value={formValues.email}
              onChange={handleInputChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-left text-sm font-medium"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="******"
              required
              value={formValues.password}
              onChange={handleInputChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="py-4">
            <SubmitButton pending={loginMutation.isPending} />
          </div>
        </CardContent>

        <CardFooter className="justify-center pt-0">
          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Create account
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LoginForm;
