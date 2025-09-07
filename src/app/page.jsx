import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <p className="text-4xl font-bold mb-4">FSMS</p>
      <AuthLanding />
    </div>
  );
}

function AuthLanding() {
  return (
    <div className="flex flex-col items-center justify-center">
      <p className="text-sm font-semibold px-4 rounded-md bg-gray-100 border-gray-200">
        Fuel Station Management System
      </p>
      <div className="flex gap-2 mt-8">
        <Button variant="outline">
          <Link href="/login">Login</Link>
        </Button>
        {/* <Button>
          <Link href="/dashboard">Dashboard</Link>
        </Button> */}
      </div>
    </div>
  );
}
