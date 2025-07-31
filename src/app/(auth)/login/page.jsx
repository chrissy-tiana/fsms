import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import React from "react";

function Login() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="flex flex-col items-center justify-center w-[400px]">
        <p className="text-4xl font-bold mb-4">FSMS</p>
        <p className="text-sm font-semibold px-4 rounded-md ">
          Fuel Station Management System
        </p>
        <div className="flex flex-col gap-2 mt-8 justify-start w-full">
          <p className="font-semibold">LOGIN</p>

          <div className="flex flex-col gap-2 mt-4">
            <Input type="email" placeholder="Email" />
            <Input type="password" placeholder="Password" />
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
            <Button>
              <Link href="/overview">LOGIN</Link>
            </Button>
            <p className="text-sm text-center mt-4">
              Don't have an account?{" "}
              <Link href="/signup" className="text-red-400 underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
