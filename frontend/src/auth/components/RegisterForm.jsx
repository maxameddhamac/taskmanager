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
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api/apiClient";
import { extractErrorMessages } from "../../../util/errorUtils";

function SubmitButton({ pending = false }) {
  return (
    <Button type="submit" disabled={pending} className="w-full cursor-pointer">
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <LoaderCircle className="animate-spin" />
          Creating account...
        </span>
      ) : (
        "Create Account"
      )}
    </Button>
  );
}

const RegisterForm = () => {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState(null);
  const registerMutation = useMutation({
    mutationFn: async (userData) => {
      const response = await api.post("/auth/register", userData);
      return response.data;
    },
    onSuccess: () => {
      navigate("/login");
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

    const { name, email, password, confirmPassword } = formValues;
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    registerMutation.mutate({
      name: name.trim(),
      email: email.trim(),
      password,
    });
  };

  return (
    <Card className="mx-auto w-full max-w-md border-border">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-center text-xl">Create an account</CardTitle>
        <CardDescription className="text-center">
          Enter your details to register
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
              htmlFor="name"
              className="block text-left text-sm font-medium"
            >
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              required
              value={formValues.name}
              onChange={handleInputChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

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

          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="block text-left text-sm font-medium"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="******"
              required
              value={formValues.confirmPassword}
              onChange={handleInputChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="py-4">
            <SubmitButton pending={registerMutation.isPending} />
          </div>
        </CardContent>

        <CardFooter className="justify-center pt-0">
          <div className="text-center text-sm">
            Already have an account?{" "}
            <a
              href="/login"
              className="cursor-pointer text-primary hover:underline"
            >
              Sign in
            </a>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default RegisterForm;
