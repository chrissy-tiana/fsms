"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

function ForgotPassword() {
  const [isResetLinkSent, setIsResetLinkSent] = useState(false);

  const handleSendResetLink = () => {
    setIsResetLinkSent(true);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="flex flex-col items-center justify-center w-[400px]">
        <p className="text-4xl font-bold mb-4">FSMS</p>
        <p className="text-sm font-semibold px-4 rounded-md ">
          Fuel Station Management System
        </p>
        {isResetLinkSent ? (
          <ResetLinkSent />
        ) : (
          <div className="flex flex-col gap-2 mt-8 justify-start w-full">
            <p className="font-semibold">FORGOT PASSWORD</p>

            <div className="flex flex-col gap-2 mt-8">
              <Input type="email" placeholder="Email" />
              <Button onClick={handleSendResetLink}>Send Reset Link</Button>
              <div className="flex gap-2 justify-start items-center w-full mt-8">
                <Link href="/" className="text-red-400 underline">
                  <p className="text-sm text-center">Return to Home Page</p>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ResetLinkSent() {
  return (
    <div className="flex flex-col items-center justify-start w-full mt-8 gap-2">
      <div className="flex flex-col items-center justify-center w-[400px]">
        <p className="text-2xl font-bold">Rest Token Sent</p>
        <p>Check your email for a token to reset your password</p>
        <p className="text-sm text-gray-400">
          Check spam if mail is not in inbox.
        </p>
      </div>
      <div className=" gap-2 justify-start items-center w-full mt-8">
        <Link href="/" className="text-red-400 underline">
          <p className="text-sm text-center">Return to Home Page</p>
        </Link>
      </div>
    </div>
  );
}

export default ForgotPassword;
