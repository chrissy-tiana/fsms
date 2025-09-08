import api from "./axios";

// Get all fuel sales
export const getFuelSales = async (params = {}) => {
  try {
    const response = await api.get("/api/fuel-sales", { params });
    return {
      success: true,
      data: response.data.data || response.data || [],
    };
  } catch (error) {
    console.error("Error fetching fuel sales:", error);
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || "Failed to fetch fuel sales",
    };
  }
};

// Get fuel sale by ID
export const getFuelSale = async (id) => {
  try {
    const response = await api.get(`/api/fuel-sales/${id}`);
    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error) {
    console.error("Error fetching fuel sale:", error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || "Failed to fetch fuel sale",
    };
  }
};

// Create new fuel sale
export const createFuelSale = async (saleData) => {
  try {
    const response = await api.post("/api/fuel-sales", saleData);
    return {
      success: true,
      data: response.data.data || response.data,
      message: "Fuel sale created successfully",
    };
  } catch (error) {
    console.error("Error creating fuel sale:", error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || "Failed to create fuel sale",
    };
  }
};

// Update fuel sale
export const updateFuelSale = async (id, saleData) => {
  try {
    const response = await api.put(`/api/fuel-sales/${id}`, saleData);
    return {
      success: true,
      data: response.data.data || response.data,
      message: "Fuel sale updated successfully",
    };
  } catch (error) {
    console.error("Error updating fuel sale:", error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || "Failed to update fuel sale",
    };
  }
};

// Delete fuel sale
export const deleteFuelSale = async (id) => {
  try {
    await api.delete(`/api/fuel-sales/${id}`);
    return {
      success: true,
      message: "Fuel sale deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting fuel sale:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to delete fuel sale",
    };
  }
};

// Get fuel sales statistics
export const getFuelSalesStats = async () => {
  try {
    const response = await api.get("/api/fuel-sales/stats/dashboard");
    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error) {
    console.error("Error fetching fuel sales stats:", error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || "Failed to fetch fuel sales stats",
    };
  }
};

// Get sales by date range
export const getSalesByDateRange = async (startDate, endDate) => {
  try {
    const response = await api.get("/api/fuel-sales/stats/range", {
      params: { startDate, endDate },
    });
    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error) {
    console.error("Error fetching sales by date range:", error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || "Failed to fetch sales by date range",
    };
  }
};