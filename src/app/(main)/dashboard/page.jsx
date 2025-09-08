"use client";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DollarSign,
  Users,
  Fuel,
  TrendingUp,
  AlertTriangle,
  Package,
  Clock,
  Activity,
  Loader2,
  LayoutDashboard,
} from "lucide-react";
import { getDashboardOverview } from "@/services/reports";
import { getEmployeeStats, getEmployees } from "@/services/employees";
import { getUsers } from "@/services/users";
import { getFuelSalesStats } from "@/services/fuelSales";
import { getInventoryStats } from "@/services/inventory";
import { getCurrentFuelPrices } from "@/services/fuelPrices";
import { getFuelSales } from "@/services/fuelSales";

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    sales: { revenue: 0, volume: 0, transactions: 0 },
    employees: { total: 0, active: 0 },
    inventory: { lowStock: 0, totalValue: 0 },
    financial: { todayIncome: 0, todayExpenses: 0, netIncome: 0 },
    fuelPrices: [],
    recentActivity: [],
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load all stats in parallel
      const [
        dashboardOverview,
        employeeStats,
        employeesData,
        usersData,
        salesStats,
        inventoryStats,
        fuelPrices,
        recentSales,
      ] = await Promise.all([
        getDashboardOverview(),
        getEmployeeStats(),
        getEmployees(),
        getUsers(),
        getFuelSalesStats(),
        getInventoryStats(),
        getCurrentFuelPrices(),
        getFuelSales({ limit: 5 }),
      ]);

      // Calculate combined employee and user counts
      const employees = employeesData.success ? employeesData.data || [] : [];
      const users = usersData.success ? usersData.data || [] : [];

      const activeEmployees = employees.filter(
        (emp) => emp.status === "active"
      );
      const activeUsers = users.filter(
        (user) => user.status === "active" || !user.status
      );
      const totalPersonnel = employees.length + users.length;
      const totalActive = activeEmployees.length + activeUsers.length;

      setStats({
        sales: {
          revenue: salesStats.data?.totalSalesAmount || 0,
          volume: salesStats.data?.totalVolume || 0,
          transactions: salesStats.data?.totalTransactions || 0,
        },
        employees: {
          total: totalPersonnel,
          active: totalActive,
        },
        inventory: {
          lowStock: inventoryStats.data?.lowStockItems || 0,
          totalValue: inventoryStats.data?.totalValue || 0,
        },
        financial: {
          todayIncome: salesStats.data?.totalSalesAmount || 0,
          todayExpenses: 0,
          netIncome: salesStats.data?.totalSalesAmount || 0,
        },
        fuelPrices: fuelPrices.success ? fuelPrices.data : [],
        recentActivity: [
          ...(recentSales.success
            ? recentSales.data.map((sale) => ({
                id: sale._id,
                type: "fuel_sale",
                description: `Fuel sale: ${
                  sale.totalVolume?.toFixed(1) || "0.0"
                }L ${sale.fuelType}`,
                amount: sale.totalAmount,
                time: sale.dateTime,
                user: sale.attendant,
              }))
            : []),
        ]
          .sort((a, b) => new Date(b.time) - new Date(a.time))
          .slice(0, 8),
      });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      toast.error("Some dashboard data could not be loaded");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="flex gap-2 items-center text-3xl font-bold">
          <LayoutDashboard />
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Overview of your fuel station operations
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₵{stats.sales.revenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.sales.transactions} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fuel Sold</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.sales.volume.toFixed(0)}L
            </div>
            <p className="text-xs text-muted-foreground">Today's volume</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Personnel
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.employees.active}</div>
            <p className="text-xs text-muted-foreground">
              of {stats.employees.total} total (employees + users)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Income
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₵{stats.financial.todayIncome.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Total income</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ₵{stats.financial.netIncome.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Today's profit</p>
          </CardContent>
        </Card>
      </div>

      {/* Current Fuel Prices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fuel className="h-5 w-5" />
            Current Fuel Prices
          </CardTitle>
          <CardDescription>Live pricing displayed on signboard</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.fuelPrices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.fuelPrices.map((price) => (
                <div
                  key={price.fuelType}
                  className="text-center p-4 border rounded-lg"
                >
                  <h4 className="font-medium text-lg">{price.fuelType}</h4>
                  <div className="text-2xl font-bold text-green-600 my-2">
                    ₵{price.price.toFixed(2)}
                  </div>
                  <p className="text-sm text-muted-foreground">per liter</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Updated:{" "}
                    {new Date(price.effectiveDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              No fuel prices available
            </p>
          )}
        </CardContent>
      </Card>

      {/* Inventory Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Inventory Value
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₵{stats.inventory.totalValue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Total stock value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Low Stock Alerts
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.inventory.lowStock}
            </div>
            <p className="text-xs text-muted-foreground">
              Items below threshold
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest transactions and operations</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {stats.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span>{activity.user}</span>
                      <span>•</span>
                      <span>{new Date(activity.time).toLocaleString()}</span>
                    </div>
                  </div>
                  <div
                    className={`font-bold text-sm ${
                      activity.type === "expense"
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {activity.type === "expense" ? "-" : "+"}₵
                    {activity.amount?.toFixed(2) || "0.00"}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              No recent activity
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <a
              href="/fuel-sales"
              className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Fuel className="h-8 w-8 mb-2 text-blue-600" />
              <span className="text-sm font-medium">Record Sale</span>
            </a>
            <a
              href="/inventory-management"
              className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Package className="h-8 w-8 mb-2 text-green-600" />
              <span className="text-sm font-medium">Add Stock</span>
            </a>
            <a
              href="/reports-analytics"
              className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Activity className="h-8 w-8 mb-2 text-purple-600" />
              <span className="text-sm font-medium">View Reports</span>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Dashboard;
