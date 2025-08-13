"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "../ui/button";
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Boxes,
  Clock,
  User,
  LogOut,
  ChartArea,
  Clock1,
  ShoppingCart,
  Fuel,
} from "lucide-react";
import { logout } from "@/services/auth";

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (path) => pathname === path;

  // Grouped menu items
  const menuGroups = [
    {
      title: "Overview",
      key: "overview",
      items: [
        {
          label: "Dashboard",
          href: "/dashboard",
          icon: <LayoutDashboard className="h-5 w-5" />,
        },
        {
          label: "Reports and Analytics",
          href: "/reports-analytics",
          icon: <ChartArea className="h-5 w-5" />,
        },
      ],
    },
    {
      title: "Management",
      key: "management",
      items: [
        {
          label: "Fuel Sales",
          href: "/fuel-sales",
          icon: <Fuel className="h-5 w-5" />,
        },
        {
          label: "Inventory Management",
          href: "/inventory-management",
          icon: <ShoppingCart className="h-5 w-5" />,
        },
        {
          label: "Shift Management",
          href: "/shift-management",
          icon: <Clock1 className="h-5 w-5" />,
        },
        {
          label: "Employee Management",
          href: "/employee-management",
          icon: <Users className="h-5 w-5" />,
        },
        {
          label: "Financial Management",
          href: "/financial-management",
          icon: <DollarSign className="h-5 w-5" />,
        },
      ],
    },
    {
      title: "Hardware",
      key: "hardware",
      items: [
        {
          label: "Digital Signboard Mgmt",
          href: "/digital-signboard",
          icon: <Clock className="h-5 w-5" />,
        },
      ],
    },
  ];

  return (
    <Sidebar className="">
      <SidebarHeader className="mx-4 mt-4">
        <p className="text-2xl font-bold">FSMS</p>
      </SidebarHeader>
      <SidebarContent className="mx-4 mt-16">
        <SidebarMenu className="w-full">
          {menuGroups.map((group, groupIdx) => (
            <div key={group.key} className="w-full mb-4">
              <p className="uppercase text-xs font-bold text-gray-400 px-2 mb-1">
                {group.title}
              </p>
              {group.items.map((item, itemIdx) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  className={`hover:bg-red-100 my-1 w-full justify-start gap-2 px-2 text-left font-semibold text-sm ${
                    isActive(item.href) ? "bg-red-100" : ""
                  }`}
                  onClick={() => router.push(item.href)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Button>
              ))}
            </div>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => router.push("/profile")}
            >
              <User className="h-5 w-5" />
              Profile
            </Button>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Button
              variant="destructive"
              className="w-full justify-start gap-2"
              onClick={async () => {
                await logout();
                router.push("/login");
              }}
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
