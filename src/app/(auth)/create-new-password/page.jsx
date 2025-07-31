import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import React from "react";

function CreateNewPassword() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="flex flex-col items-center justify-center w-[400px]">
        <p className="text-4xl font-bold mb-4">FSMS</p>
        <p className="text-sm font-semibold px-4 rounded-md ">
          Filling Station Management System
        </p>
        <div className="flex flex-col gap-2 mt-8 justify-start w-full">
          <p className="font-bold text-xl text-center">CREATE NEW PASSWORD</p>

          <div className="flex flex-col gap-4 mt-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <label htmlFor="token" className="text-sm font-medium">
                Password Reset Token
              </label>
              <Input type="text" id="token" placeholder="Email" />
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <label htmlFor="password" className="text-sm font-medium">
                New Password
              </label>
              <Input type="password" id="password" placeholder="Password" />
            </div>

            <Button className="mt-4">SET NEW PASSWORD</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateNewPassword;
