import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DynamicBreadcrumb from "../../components/dynamic-breadcrumb";

export default function Layout({ children }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="p-4 w-full">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <DynamicBreadcrumb />
        </div>
        {children}
      </main>
    </SidebarProvider>
  );
}
