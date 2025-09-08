"use client";
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
import { useRouter } from "next/navigation";
import { register as registerUser } from "@/services/auth";
import { toast } from "sonner";

function Signup() {
  const router = useRouter();
  const [fullName, setFullName] = React.useState("");
  const [branch, setBranch] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [acceptTerms, setAcceptTerms] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");
  const [role, setRole] = React.useState("");
  const [department, setDepartment] = React.useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!acceptTerms) {
      setError("Please accept the terms and conditions");
      toast.error("Please accept the terms and conditions");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }
    setIsSubmitting(true);
    try {
      await registerUser({
        fullName,
        branch,
        email,
        phone,
        password,
        confirmPassword,
        role,
        department,
      });
      router.push("/reports-analytics");
    } catch (err) {
      const message = err?.response?.data?.message || "Registration failed";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="flex flex-col items-center justify-center w-[400px]">
        <p className="text-4xl font-bold">FSMS</p>
        <p className="text-sm text-center mt-2">
          Filling Station Management System
        </p>
        <div className="flex flex-col gap-2 mt-8 justify-start w-full">
          <p className="font-bold text-2xl">REGISTER</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-sm">Full Name</label>
              <Input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-sm">Branch Name</label>
              <Select
                value={branch}
                onValueChange={setBranch}
                className="w-full"
              >
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
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-sm">Phone Number</label>
              <Input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-sm">Password</label>
              <Input
                type="password"
                placeholder="Enter New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-sm">Confirm Password</label>
              <Input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-row w-full gap-4">
              <div className="flex flex-col gap-1 w-full">
                <label className="font-semibold text-sm">Role</label>
                <Select value={role} onValueChange={setRole} className="w-full">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Station Manager">
                      Station Manager
                    </SelectItem>
                    <SelectItem value="Pump Attendant">
                      Pump Attendant
                    </SelectItem>
                    <SelectItem value="Cashier">Cashier</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1 w-full">
                <label className="font-semibold text-sm">Department</label>
                <Select
                  value={department}
                  onValueChange={setDepartment}
                  className="w-full"
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Management">Management</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-8">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={setAcceptTerms}
              />
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
            <Button
              type="submit"
              className="bg-black text-white w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating account..." : "REGISTER"}
            </Button>

            <div className="flex flex-col gap-2 mt-4 justify-start w-full">
              <p className="text-sm text-center justify-start">
                Already have an account?{" "}
                <Link href="/login" className="text-red-400 underline">
                  Login
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;
