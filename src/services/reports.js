import api from "./axios";

// Get daily sales report
export const getDailySalesReport = async (date) => {
  try {
    const response = await api.get("/api/reports/daily-sales", {
      params: { date },
    });
    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error) {
    console.error("Error fetching daily sales report:", error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || "Failed to fetch daily sales report",
    };
  }
};

// Get monthly sales report
export const getMonthlySalesReport = async (year, month) => {
  try {
    const response = await api.get("/api/reports/monthly-sales", {
      params: { year, month },
    });
    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error) {
    console.error("Error fetching monthly sales report:", error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || "Failed to fetch monthly sales report",
    };
  }
};

// Get inventory report
export const getInventoryReport = async () => {
  try {
    const response = await api.get("/api/reports/inventory");
    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error) {
    console.error("Error fetching inventory report:", error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || "Failed to fetch inventory report",
    };
  }
};

// Get employee performance report
export const getEmployeePerformanceReport = async (startDate, endDate) => {
  try {
    const response = await api.get("/api/reports/employee-performance", {
      params: { startDate, endDate },
    });
    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error) {
    console.error("Error fetching employee performance report:", error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || "Failed to fetch employee performance report",
    };
  }
};

// Get financial summary report
export const getFinancialSummaryReport = async (startDate, endDate) => {
  try {
    const response = await api.get("/api/reports/financial-summary", {
      params: { startDate, endDate },
    });
    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error) {
    console.error("Error fetching financial summary report:", error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || "Failed to fetch financial summary report",
    };
  }
};

// Get dashboard overview
export const getDashboardOverview = async () => {
  try {
    const response = await api.get("/api/reports/dashboard-overview");
    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error) {
    console.error("Error fetching dashboard overview:", error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || "Failed to fetch dashboard overview",
    };
  }
};