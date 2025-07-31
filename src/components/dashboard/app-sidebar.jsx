"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuLabel,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import Link from "next/link";

export function AppSidebar() {
  const pathname = usePathname();
  const isActive = (path) => pathname === path;

  const menuItems = [
    {
      label: "Overview",
      href: "/overview",
    },
    {
      label: "Employees",
      href: "/employees",
    },
    {
      label: "Sales / Revenue",
      href: "/sales-revenue",
    },
    {
      label: "Pump Management",
      href: "/pump-management",
    },
    {
      label: "Digital Signboard Mgmt",
      href: "/digital-signboard",
    },
  ];

  return (
    <Sidebar className="">
      <SidebarHeader className="mx-4 mt-4">
        <p className="text-2xl font-bold">FSMS</p>
      </SidebarHeader>
      <SidebarContent className="mx-4 w-[250px] mt-16">
        <SidebarMenu>
          {menuItems.map((item, index) => (
            <SidebarMenuItem key={index} className="px-2 my-1 font-semibold">
              <Link
                href={item.href}
                className={`${
                  isActive(item.href) ? "bg-red-100 px-2 py-1 rounded-md" : ""
                }`}
              >
                {item.label}
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Button variant="outline" className="w-full">
              User Profile
            </Button>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Button variant="destructive" className="w-full">
              Sign Out
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
