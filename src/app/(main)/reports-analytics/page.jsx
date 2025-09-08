"use client";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartArea,
  FileText,
  Download,
  Calendar,
  BarChart,
  TrendingUp,
  Loader2,
} from "lucide-react";
import {
  getDailySalesReport,
  getMonthlySalesReport,
  getInventoryReport,
  getFinancialSummaryReport,
  getDashboardOverview,
} from "@/services/reports";
import {
  exportToCSV,
  exportToExcel,
  generatePDFReport,
  generateQuickReport,
} from "@/lib/exportUtils";

function ReportsAndAnalytics() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  // State for all backend data
  const [overviewMetrics, setOverviewMetrics] = useState({
    totalRevenue: 0,
    netProfit: 0,
    totalTransactions: 0,
    avgTransaction: 0,
  });

  const [salesData, setSalesData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [pumpPerformance, setPumpPerformance] = useState([]);
  const [financialData, setFinancialData] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    grossProfit: 0,
    netProfit: 0,
    profitMargin: 0,
    incomeByCategory: {},
    expensesByCategory: {},
  });

  const [allTimeFinancialData, setAllTimeFinancialData] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    grossProfit: 0,
    netProfit: 0,
    profitMargin: 0,
    monthlyTrends: [],
    yearlyBreakdown: [],
    incomeByCategory: {},
    expensesByCategory: {},
  });

  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
  });

  // Load initial data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  // Reload data when date range changes (except for overview tab)
  useEffect(() => {
    if (activeTab !== "overview") {
      loadTabData(activeTab);
    }
  }, [dateRange]);

  // Load specific tab data when tab changes
  useEffect(() => {
    if (activeTab !== "overview") {
      loadTabData(activeTab);
    }
  }, [activeTab]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.allSettled([
        loadOverviewMetrics(),
        loadRecentSalesData(),
        loadInventoryData(),
        loadFinancialData(),
      ]);
    } catch (error) {
      console.error("Error loading initial data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadOverviewMetrics = async () => {
    try {
      // Load financial summary for the date range to get overview metrics
      const financialResponse = await getFinancialSummaryReport(
        dateRange.startDate,
        dateRange.endDate
      );

      if (financialResponse.success && financialResponse.data) {
        const summary = financialResponse.data.summary;

        // Calculate total transactions from recent sales
        const salesPromises = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          salesPromises.push(
            getDailySalesReport(date.toISOString().split("T")[0])
          );
        }

        const salesResults = await Promise.allSettled(salesPromises);
        let totalTransactions = 0;

        salesResults.forEach((result) => {
          if (result.status === "fulfilled" && result.value.success) {
            totalTransactions +=
              result.value.data.summary.totalTransactions || 0;
          }
        });

        setOverviewMetrics({
          totalRevenue: summary.totalRevenue || 0,
          netProfit: summary.netIncome || 0,
          totalTransactions,
          avgTransaction:
            totalTransactions > 0
              ? (summary.totalRevenue || 0) / totalTransactions
              : 0,
        });
      }
    } catch (error) {
      console.error("Error loading overview metrics:", error);
      setOverviewMetrics({
        totalRevenue: 0,
        netProfit: 0,
        totalTransactions: 0,
        avgTransaction: 0,
      });
    }
  };

  const loadRecentSalesData = async () => {
    try {
      const salesPromises = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        salesPromises.push(
          getDailySalesReport(date.toISOString().split("T")[0])
        );
      }

      const salesResults = await Promise.allSettled(salesPromises);
      const processedSalesData = [];
      const pumpData = {};

      salesResults.forEach((result, index) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - index));
        const dateStr = date.toISOString().split("T")[0];

        if (result.status === "fulfilled" && result.value.success) {
          const data = result.value.data;
          processedSalesData.push({
            date: dateStr,
            totalSales: data.summary.totalSales || 0,
            petrol: data.salesByFuelType?.Petrol || 0,
            diesel: data.salesByFuelType?.Diesel || 0,
            premium: data.salesByFuelType?.Premium || 0,
            transactions: data.summary.totalTransactions || 0,
          });

          // Aggregate pump performance data
          if (data.salesByPump) {
            Object.entries(data.salesByPump).forEach(([pump, sales]) => {
              if (!pumpData[pump]) {
                pumpData[pump] = { totalSales: 0, transactions: 0 };
              }
              pumpData[pump].totalSales += sales;
              pumpData[pump].transactions += Math.floor(sales / 300); // Estimate
            });
          }
        } else {
          // Add empty data for failed requests
          processedSalesData.push({
            date: dateStr,
            totalSales: 0,
            petrol: 0,
            diesel: 0,
            premium: 0,
            transactions: 0,
          });
        }
      });

      setSalesData(processedSalesData);

      // Convert pump data to array
      const pumpArray = Object.entries(pumpData).map(([pump, data]) => ({
        pumpNumber: pump,
        totalSales: data.totalSales,
        volume: data.totalSales / 6.5, // Estimate volume
        transactions: data.transactions,
        avgPerTransaction:
          data.transactions > 0 ? data.totalSales / data.transactions : 0,
      }));

      setPumpPerformance(pumpArray);
    } catch (error) {
      console.error("Error loading sales data:", error);
      setSalesData([]);
      setPumpPerformance([]);
    }
  };

  const loadInventoryData = async () => {
    try {
      const response = await getInventoryReport();
      if (response.success && response.data.inventory) {
        const processedInventoryData = response.data.inventory.map((item) => ({
          fuelType: item.fuelType,
          openingStock:
            item.openingStock ||
            item.currentStock - (item.stockIn || 0) + (item.stockOut || 0),
          stockIn: item.stockIn || 0,
          stockOut: item.stockOut || 0,
          closingStock: item.currentStock,
          value: item.currentStock * (item.costPerLiter || 6.5),
        }));
        setInventoryData(processedInventoryData);
      }
    } catch (error) {
      console.error("Error loading inventory data:", error);
      setInventoryData([]);
    }
  };

  const loadFinancialData = async () => {
    try {
      const response = await getFinancialSummaryReport(
        dateRange.startDate,
        dateRange.endDate
      );

      if (response.success && response.data) {
        const summary = response.data.summary;
        const grossProfit = (summary.totalRevenue || 0) * 0.4; // Assuming 40% gross margin

        setFinancialData({
          totalRevenue: summary.totalRevenue || 0,
          totalExpenses: summary.totalExpenses || 0,
          grossProfit,
          netProfit: summary.netIncome || 0,
          profitMargin:
            summary.totalRevenue > 0
              ? ((summary.netIncome || 0) / summary.totalRevenue) * 100
              : 0,
          incomeByCategory: response.data.incomeByCategory || {},
          expensesByCategory: response.data.expensesByCategory || {},
        });
      }
    } catch (error) {
      console.error("Error loading financial data:", error);
      setFinancialData({
        totalRevenue: 0,
        totalExpenses: 0,
        grossProfit: 0,
        netProfit: 0,
        profitMargin: 0,
        incomeByCategory: {},
        expensesByCategory: {},
      });
    }
  };

  const loadAllTimeFinancialData = async () => {
    try {
      // Get data for the last 2 years for comprehensive analysis
      const endDate = new Date();
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 2);

      const response = await getFinancialSummaryReport(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );

      if (response.success && response.data) {
        const summary = response.data.summary;
        const grossProfit = (summary.totalRevenue || 0) * 0.4;

        // Generate monthly trends for the last 12 months
        const monthlyTrends = [];
        for (let i = 11; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const year = date.getFullYear();
          const month = date.getMonth() + 1;
          
          try {
            const monthlyResponse = await getMonthlySalesReport(year, month);
            if (monthlyResponse.success && monthlyResponse.data) {
              const monthlyData = monthlyResponse.data.summary || {};
              monthlyTrends.push({
                month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                revenue: monthlyData.totalSales || 0,
                profit: (monthlyData.totalSales || 0) * 0.25,
                transactions: monthlyData.totalTransactions || 0,
              });
            } else {
              monthlyTrends.push({
                month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                revenue: 0,
                profit: 0,
                transactions: 0,
              });
            }
          } catch (error) {
            monthlyTrends.push({
              month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
              revenue: 0,
              profit: 0,
              transactions: 0,
            });
          }
        }

        // Generate yearly breakdown
        const currentYear = new Date().getFullYear();
        const yearlyBreakdown = [];
        
        for (let year = currentYear - 1; year <= currentYear; year++) {
          let yearlyRevenue = 0;
          let yearlyTransactions = 0;
          
          for (let month = 1; month <= 12; month++) {
            try {
              const monthlyResponse = await getMonthlySalesReport(year, month);
              if (monthlyResponse.success && monthlyResponse.data) {
                const monthlyData = monthlyResponse.data.summary || {};
                yearlyRevenue += monthlyData.totalSales || 0;
                yearlyTransactions += monthlyData.totalTransactions || 0;
              }
            } catch (error) {
              // Continue with zeros for failed requests
            }
          }
          
          yearlyBreakdown.push({
            year,
            revenue: yearlyRevenue,
            profit: yearlyRevenue * 0.25,
            transactions: yearlyTransactions,
            avgMonthlyRevenue: yearlyRevenue / 12,
          });
        }

        setAllTimeFinancialData({
          totalRevenue: summary.totalRevenue || 0,
          totalExpenses: summary.totalExpenses || 0,
          grossProfit,
          netProfit: summary.netIncome || 0,
          profitMargin:
            summary.totalRevenue > 0
              ? ((summary.netIncome || 0) / summary.totalRevenue) * 100
              : 0,
          monthlyTrends,
          yearlyBreakdown,
          incomeByCategory: response.data.incomeByCategory || {},
          expensesByCategory: response.data.expensesByCategory || {},
        });
      }
    } catch (error) {
      console.error("Error loading all-time financial data:", error);
      setAllTimeFinancialData({
        totalRevenue: 0,
        totalExpenses: 0,
        grossProfit: 0,
        netProfit: 0,
        profitMargin: 0,
        monthlyTrends: [],
        yearlyBreakdown: [],
        incomeByCategory: {},
        expensesByCategory: {},
      });
    }
  };

  const loadTabData = async (tab) => {
    setLoading(true);
    try {
      switch (tab) {
        case "sales":
          await loadRecentSalesData();
          break;
        case "inventory":
          await loadInventoryData();
          break;
        case "financial":
          await Promise.all([loadFinancialData(), loadAllTimeFinancialData()]);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(`Error loading ${tab} data:`, error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (reportType, format) => {
    toast.info(`Generating ${reportType} report...`);

    try {
      let data;

      // Load fresh data for report generation
      switch (reportType) {
        case "Daily Sales":
          // Load fresh sales data
          const salesPromises = [];
          for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            salesPromises.push(
              getDailySalesReport(date.toISOString().split("T")[0])
            );
          }

          const salesResults = await Promise.allSettled(salesPromises);
          const processedSalesData = [];

          salesResults.forEach((result, index) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - index));
            const dateStr = date.toISOString().split("T")[0];

            if (result.status === "fulfilled" && result.value.success) {
              const resultData = result.value.data;
              processedSalesData.push({
                date: dateStr,
                totalSales: resultData.summary.totalSales || 0,
                petrol: resultData.salesByFuelType?.Petrol || 0,
                diesel: resultData.salesByFuelType?.Diesel || 0,
                premium: resultData.salesByFuelType?.Premium || 0,
                transactions: resultData.summary.totalTransactions || 0,
              });
            } else {
              processedSalesData.push({
                date: dateStr,
                totalSales: 0,
                petrol: 0,
                diesel: 0,
                premium: 0,
                transactions: 0,
              });
            }
          });

          data = processedSalesData;
          break;

        case "Inventory Report":
          // Load fresh inventory data
          const invResponse = await getInventoryReport();
          if (invResponse.success && invResponse.data.inventory) {
            data = invResponse.data.inventory.map((item) => ({
              fuelType: item.fuelType,
              openingStock:
                item.openingStock ||
                item.currentStock - (item.stockIn || 0) + (item.stockOut || 0),
              stockIn: item.stockIn || 0,
              stockOut: item.stockOut || 0,
              closingStock: item.currentStock,
              value: item.currentStock * (item.costPerLiter || 6.5),
            }));
          } else {
            data = [];
          }
          break;

        case "P&L Statement":
        case "Profit & Loss":
          // Load fresh financial data
          const finResponse = await getFinancialSummaryReport(
            dateRange.startDate,
            dateRange.endDate
          );

          if (finResponse.success && finResponse.data) {
            const summary = finResponse.data.summary;
            const grossProfit = (summary.totalRevenue || 0) * 0.4;

            data = {
              totalRevenue: summary.totalRevenue || 0,
              totalExpenses: summary.totalExpenses || 0,
              grossProfit,
              netProfit: summary.netIncome || 0,
              profitMargin:
                summary.totalRevenue > 0
                  ? ((summary.netIncome || 0) / summary.totalRevenue) * 100
                  : 0,
              incomeByCategory: finResponse.data.incomeByCategory || {},
              expensesByCategory: finResponse.data.expensesByCategory || {},
            };
          } else {
            data = null;
          }
          break;

        default:
          toast.error("Unknown report type");
          return;
      }

      // Check if data is still empty after loading
      if (!data || (Array.isArray(data) && data.length === 0)) {
        toast.error("No data available for this report");
        return;
      }

      if (format === "PDF") {
        generatePDFReport(
          reportType === "Daily Sales"
            ? "Daily Sales Report"
            : reportType === "P&L Statement"
            ? "Profit & Loss Statement"
            : reportType,
          data,
          dateRange
        );
      } else {
        generateQuickReport(reportType, format, data, dateRange);
      }

      toast.success(`${reportType} report generated successfully!`);
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report");
    }
  };

  const exportData = (data, filename) => {
    toast.info(`Exporting ${filename}...`);

    try {
      const format = filename.endsWith(".xlsx") ? "excel" : "csv";

      if (format === "excel") {
        exportToExcel(data, filename.replace(".xlsx", ""));
      } else {
        exportToCSV(data, filename.replace(".csv", ""));
      }

      toast.success(`Data exported successfully!`);
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data");
    }
  };

  if (loading && activeTab === "overview") {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-3 text-lg">Loading reports...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ChartArea className="h-8 w-8" />
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive business insights and performance reports
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <Input
              type="date"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, startDate: e.target.value }))
              }
              className="w-auto"
            />
            <span>to</span>
            <Input
              type="date"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
              }
              className="w-auto"
            />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 border-b">
        {["overview", "sales", "inventory", "financial"].map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "default" : "ghost"}
            onClick={() => setActiveTab(tab)}
            className="rounded-b-none"
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Key Metrics from Backend Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ₵{overviewMetrics.totalRevenue.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Last 7 days</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Net Profit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  ₵{overviewMetrics.netProfit.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {overviewMetrics.totalRevenue > 0
                    ? (
                        (overviewMetrics.netProfit /
                          overviewMetrics.totalRevenue) *
                        100
                      ).toFixed(1)
                    : "0.0"}
                  % margin
                </p>
              </CardContent>
            </Card> */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {overviewMetrics.totalTransactions}
                </div>
                <p className="text-xs text-muted-foreground">All pumps</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg Transaction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₵{overviewMetrics.avgTransaction.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Per transaction</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Report Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Reports</CardTitle>
              <CardDescription>
                Generate and download common reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center gap-2"
                  onClick={() => generateReport("Daily Sales", "PDF")}
                >
                  <FileText className="h-6 w-6" />
                  <span>Daily Sales</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center gap-2"
                  onClick={() => generateReport("Inventory Report", "Excel")}
                >
                  <BarChart className="h-6 w-6" />
                  <span>Inventory Report</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center gap-2"
                  onClick={() => generateReport("P&L Statement", "PDF")}
                >
                  <TrendingUp className="h-6 w-6" />
                  <span>P&L Statement</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sales Reports Tab */}
      {activeTab === "sales" && (
        <div className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading sales data...</span>
            </div>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Daily Sales Report
                    <Button
                      size="sm"
                      onClick={() =>
                        exportData(salesData, "daily_sales_report.xlsx")
                      }
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Sales breakdown by date and fuel type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Total Sales</TableHead>
                        <TableHead>Petrol</TableHead>
                        <TableHead>Diesel</TableHead>
                        <TableHead>Premium</TableHead>
                        <TableHead>Transactions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salesData.length > 0 ? (
                        salesData.map((day, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {new Date(day.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="font-medium">
                              ₵{day.totalSales.toFixed(2)}
                            </TableCell>
                            <TableCell>₵{day.petrol.toFixed(2)}</TableCell>
                            <TableCell>₵{day.diesel.toFixed(2)}</TableCell>
                            <TableCell>₵{day.premium.toFixed(2)}</TableCell>
                            <TableCell>{day.transactions}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center py-8 text-muted-foreground"
                          >
                            No sales data available for the selected period
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Pump Performance
                    <Button
                      size="sm"
                      onClick={() =>
                        exportData(pumpPerformance, "pump_performance.xlsx")
                      }
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </CardTitle>
                  <CardDescription>Sales performance by pump</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pump</TableHead>
                        <TableHead>Total Sales</TableHead>
                        <TableHead>Volume (L)</TableHead>
                        <TableHead>Transactions</TableHead>
                        <TableHead>Avg/Transaction</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pumpPerformance.length > 0 ? (
                        pumpPerformance.map((pump, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {pump.pumpNumber}
                            </TableCell>
                            <TableCell>₵{pump.totalSales.toFixed(2)}</TableCell>
                            <TableCell>{pump.volume.toFixed(2)}</TableCell>
                            <TableCell>{pump.transactions}</TableCell>
                            <TableCell>
                              ₵{pump.avgPerTransaction.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center py-8 text-muted-foreground"
                          >
                            No pump performance data available
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* Inventory Reports Tab */}
      {activeTab === "inventory" && (
        <div className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading inventory data...</span>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Inventory Movement Report
                  <Button
                    size="sm"
                    onClick={() =>
                      exportData(inventoryData, "inventory_movement.xlsx")
                    }
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </CardTitle>
                <CardDescription>
                  Stock movements and current values
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fuel Type</TableHead>
                      <TableHead>Opening Stock (L)</TableHead>
                      <TableHead>Stock In (L)</TableHead>
                      <TableHead>Stock Out (L)</TableHead>
                      <TableHead>Closing Stock (L)</TableHead>
                      <TableHead>Value (₵)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventoryData.length > 0 ? (
                      inventoryData.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {item.fuelType}
                          </TableCell>
                          <TableCell>{item.openingStock.toFixed(2)}</TableCell>
                          <TableCell className="text-green-600">
                            +{item.stockIn.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-red-600">
                            -{item.stockOut.toFixed(2)}
                          </TableCell>
                          <TableCell className="font-medium">
                            {item.closingStock.toFixed(2)}
                          </TableCell>
                          <TableCell>₵{item.value.toFixed(2)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No inventory data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Financial Reports Tab */}
      {activeTab === "financial" && (
        <div className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading financial data...</span>
            </div>
          ) : (
            <>
              {/* All-Time Financial Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      All-Time Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      ₵{allTimeFinancialData.totalRevenue.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">Total earnings</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      All-Time Profit
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      ₵{allTimeFinancialData.netProfit.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {allTimeFinancialData.profitMargin.toFixed(1)}% margin
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Monthly Average
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ₵{allTimeFinancialData.monthlyTrends.length > 0 
                        ? (allTimeFinancialData.totalRevenue / Math.max(allTimeFinancialData.monthlyTrends.length, 1)).toFixed(2)
                        : "0.00"}
                    </div>
                    <p className="text-xs text-muted-foreground">Revenue per month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Best Month
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">
                      ₵{allTimeFinancialData.monthlyTrends.length > 0 
                        ? Math.max(...allTimeFinancialData.monthlyTrends.map(m => m.revenue)).toFixed(2)
                        : "0.00"}
                    </div>
                    <p className="text-xs text-muted-foreground">Peak performance</p>
                  </CardContent>
                </Card>
              </div>

              {/* Monthly Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Monthly Performance Trends
                    <Button
                      size="sm"
                      onClick={() => exportData(allTimeFinancialData.monthlyTrends, "monthly_trends.xlsx")}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </CardTitle>
                  <CardDescription>Revenue and profit trends over the last 12 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Estimated Profit</TableHead>
                        <TableHead>Transactions</TableHead>
                        <TableHead>Avg/Transaction</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allTimeFinancialData.monthlyTrends.length > 0 ? (
                        allTimeFinancialData.monthlyTrends.map((month, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{month.month}</TableCell>
                            <TableCell>₵{month.revenue.toFixed(2)}</TableCell>
                            <TableCell className="text-green-600">₵{month.profit.toFixed(2)}</TableCell>
                            <TableCell>{month.transactions}</TableCell>
                            <TableCell>
                              ₵{month.transactions > 0 ? (month.revenue / month.transactions).toFixed(2) : "0.00"}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No monthly trend data available
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Yearly Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Yearly Performance Analysis
                    <Button
                      size="sm"
                      onClick={() => exportData(allTimeFinancialData.yearlyBreakdown, "yearly_analysis.xlsx")}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </CardTitle>
                  <CardDescription>Year-over-year performance comparison</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Year</TableHead>
                        <TableHead>Total Revenue</TableHead>
                        <TableHead>Estimated Profit</TableHead>
                        <TableHead>Monthly Average</TableHead>
                        <TableHead>Growth Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allTimeFinancialData.yearlyBreakdown.length > 0 ? (
                        allTimeFinancialData.yearlyBreakdown.map((year, index) => {
                          const prevYear = index > 0 ? allTimeFinancialData.yearlyBreakdown[index - 1] : null;
                          const growthRate = prevYear && prevYear.revenue > 0 
                            ? ((year.revenue - prevYear.revenue) / prevYear.revenue * 100)
                            : 0;
                          
                          return (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{year.year}</TableCell>
                              <TableCell>₵{year.revenue.toFixed(2)}</TableCell>
                              <TableCell className="text-green-600">₵{year.profit.toFixed(2)}</TableCell>
                              <TableCell>₵{year.avgMonthlyRevenue.toFixed(2)}</TableCell>
                              <TableCell className={growthRate >= 0 ? "text-green-600" : "text-red-600"}>
                                {growthRate >= 0 ? "+" : ""}{growthRate.toFixed(1)}%
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No yearly data available
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Current Period P&L Statement */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Profit & Loss Statement - Selected Period
                    <Button
                      size="sm"
                      onClick={() => generateReport("Profit & Loss", "PDF")}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Generate PDF
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Financial performance for {new Date(dateRange.startDate).toLocaleDateString()} - {new Date(dateRange.endDate).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-green-600 mb-2">
                          Revenue
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Fuel Sales</span>
                            <span>₵{financialData.totalRevenue.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-medium border-t pt-2">
                            <span>Total Revenue</span>
                            <span>₵{financialData.totalRevenue.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-red-600 mb-2">
                          Expenses
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Cost of Goods Sold</span>
                            <span>
                              ₵
                              {(
                                financialData.totalRevenue -
                                financialData.grossProfit
                              ).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Operating Expenses</span>
                            <span>₵{financialData.totalExpenses.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-medium border-t pt-2">
                            <span>Total Expenses</span>
                            <span>₵{financialData.totalExpenses.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Gross Profit</span>
                          <span className="font-medium">
                            ₵{financialData.grossProfit.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-lg font-bold">
                          <span>Net Profit</span>
                          <span className="text-green-600">
                            ₵{financialData.netProfit.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Profit Margin</span>
                          <span>{financialData.profitMargin.toFixed(2)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Income & Expense Categories */}
              {(Object.keys(allTimeFinancialData.incomeByCategory).length > 0 || 
                Object.keys(allTimeFinancialData.expensesByCategory).length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-green-600">Income by Category</CardTitle>
                      <CardDescription>Revenue breakdown by source</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(allTimeFinancialData.incomeByCategory).map(([category, amount]) => (
                          <div key={category} className="flex justify-between">
                            <span className="capitalize">{category}</span>
                            <span>₵{amount.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-red-600">Expenses by Category</CardTitle>
                      <CardDescription>Cost breakdown by type</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(allTimeFinancialData.expensesByCategory).map(([category, amount]) => (
                          <div key={category} className="flex justify-between">
                            <span className="capitalize">{category}</span>
                            <span>₵{amount.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ReportsAndAnalytics;
