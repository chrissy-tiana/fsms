import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

function ResetLinkSentPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="flex flex-col items-center justify-center w-[400px] text-center">
        <p className="text-4xl font-bold mb-4">FSMS</p>
        <p className="text-sm font-semibold px-4 rounded-md mb-8">
          Filling Station Management System
        </p>
        <div className="flex flex-col gap-2 mt-8 justify-start w-full items-center">
          <p className="font-bold text-lg">RESET TOKEN SENT</p>
          <p className="text-sm text-gray-500 mt-2">
            Check your email for a token to reset your password..
            <br />
            Check spam if mail is not in inbox.
          </p>
          <Link href="/create-new-password" passHref className="w-full mt-4">
            <Button className="w-full">CREATE NEW PASSWORD</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ResetLinkSentPage;
