import React from "react";
import LoginForm from "../components/LoginForm";

const LoginPage = () => {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
      <div className="z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground">Welcome back</h1>
          <p>We're glad to see you again</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
};

export default LoginPage;
