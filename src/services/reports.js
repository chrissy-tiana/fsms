import api from "./axios";

// Get daily sales report
export const getDailySalesReport = async (date) => {
  const response = await api.get("/api/reports/daily-sales", {
    params: { date },
  });
  return response.data;
};

// Get monthly sales report
export const getMonthlySalesReport = async (year, month) => {
  const response = await api.get("/api/reports/monthly-sales", {
    params: { year, month },
  });
  return response.data;
};

// Get inventory report
export const getInventoryReport = async () => {
  const response = await api.get("/api/reports/inventory");
  return response.data;
};

// Get employee performance report
export const getEmployeePerformanceReport = async (startDate, endDate) => {
  const response = await api.get("/api/reports/employee-performance", {
    params: { startDate, endDate },
  });
  return response.data;
};

// Get financial summary report
export const getFinancialSummaryReport = async (startDate, endDate) => {
  const response = await api.get("/api/reports/financial-summary", {
    params: { startDate, endDate },
  });
  return response.data;
};

// Get dashboard overview
export const getDashboardOverview = async () => {
  const response = await api.get("/api/reports/dashboard-overview");
  return response.data;
};