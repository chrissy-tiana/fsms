"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import React from "react";
import { useRouter } from "next/navigation";
import { login } from "@/services/auth";
import { toast } from "sonner";

function Login() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await login({ email, password });
      router.push("/reports-analytics");
    } catch (err) {
      const message = err?.response?.data?.message || "Login failed";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="flex flex-col items-center justify-center w-[400px]">
        <p className="text-4xl font-bold mb-4">FSMS</p>
        <p className="text-sm font-semibold px-4 rounded-md ">
          Fuel Station Management System
        </p>
        <div className="flex flex-col gap-2 mt-8 justify-start w-full">
          <p className="font-semibold">LOGIN</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-4">
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="flex justify-between items-center space-x-2 mt-8 mb-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember-me" />
                <label
                  htmlFor="remember-me"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember me
                </label>
              </div>
              <Link
                href="/forgot-password"
                className="text-sm text-red-400 underline"
              >
                Forgot Password?
              </Link>
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "LOGIN"}
            </Button>
            <p className="text-sm text-center mt-4">
              Don't have an account?{" "}
              <Link href="/signup" className="text-red-400 underline">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
