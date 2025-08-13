"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
  SidebarGroup,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { User, LogOut, Fuel } from "lucide-react";
import React from "react";
import DynamicBreadcrumb from "@/components/dynamic-breadcrumb";
import { logout } from "@/services/auth";

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className="min-h-screen bg-white">{children}</main>;
}
