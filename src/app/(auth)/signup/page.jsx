import { Input } from "@/components/ui/input";
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function Signup() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="flex flex-col items-center justify-center w-[400px]">
        <p className="text-4xl font-bold">FSMS</p>
        <p className="text-sm text-center mt-2">
          Filling Station Management System
        </p>
        <div className="flex flex-col gap-2 mt-8 justify-start w-full">
          <p className="font-bold text-2xl">REGISTER</p>

          <div className="flex flex-col gap-4 mt-4">
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-sm">Full Name</label>
              <Input type="text" placeholder="Full Name" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-sm">Branch Name</label>
              <Select className="w-full">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a Branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ayeduase">Ayeduase</SelectItem>
                  <SelectItem value="kentinkrono">Kentinkrono</SelectItem>
                  <SelectItem value="kotei">Kotei</SelectItem>
                  <SelectItem value="deduako">Deduako</SelectItem>
                  <SelectItem value="boadi">Boadi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-sm">Email</label>
              <Input type="email" placeholder="Email" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-sm">Password</label>
              <Input type="password" placeholder="Enter New Password" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-sm">Confirm Password</label>
              <Input type="password" placeholder="Confirm Password" />
            </div>
            <div className="flex items-center space-x-2 mt-8">
              <Checkbox id="terms" />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I accept the{" "}
                <Link href="/terms" className="text-red-500">
                  terms and conditions
                </Link>
              </label>
            </div>
            <Button className="bg-black text-white w-full">
              <Link href="/overview">REGISTER</Link>
            </Button>

            <div className="flex flex-col gap-2 mt-4 justify-start w-full">
              <p className="text-sm text-center justify-start">
                Already have an account?{" "}
                <Link href="/login" className="text-red-400 underline">
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
