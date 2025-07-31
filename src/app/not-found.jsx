import Link from "next/link";
import React from "react";

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="flex flex-col items-center justify-center w-[400px]">
        <p className="text-4xl font-bold mb-4">404</p>
        <p className="text-sm font-semibold px-4 rounded-md ">
          Fuel Station Management System
        </p>
        <p className="text-sm text-gray-400">Page Not Found</p>
        <div className="flex flex-col gap-2 justify-start items-center w-full mt-8">
          <Link href="/" className="text-red-400 underline">
            <p className="text-sm text-center">Return to Home Page</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
