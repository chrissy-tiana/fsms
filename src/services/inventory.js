import api from "./axios";

// Get all inventory items
export const getInventory = async () => {
  try {
    const response = await api.get("/api/inventory");
    return {
      success: true,
      data: response.data.data || response.data || [],
    };
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || "Failed to fetch inventory",
    };
  }
};

// Get inventory by fuel type
export const getInventoryByType = async (fuelType) => {
  try {
    const response = await api.get(`/api/inventory/${fuelType}`);
    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error) {
    console.error("Error fetching inventory by type:", error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || "Failed to fetch inventory by type",
    };
  }
};

// Create or update inventory item
export const updateInventory = async (inventoryData) => {
  try {
    const response = await api.post("/api/inventory", inventoryData);
    return {
      success: true,
      data: response.data.data || response.data,
      message: "Inventory updated successfully",
    };
  } catch (error) {
    console.error("Error updating inventory:", error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || "Failed to update inventory",
    };
  }
};

// Add stock (stock in)
export const addStock = async (stockData) => {
  try {
    const response = await api.post("/api/inventory/stock-in", stockData);
    return {
      success: true,
      data: response.data.data || response.data,
      message: "Stock added successfully",
    };
  } catch (error) {
    console.error("Error adding stock:", error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || "Failed to add stock",
    };
  }
};

// Get stock receipts
export const getStockReceipts = async (params = {}) => {
  try {
    const response = await api.get("/api/inventory/stock-receipts/all", { params });
    return {
      success: true,
      data: response.data.data || response.data || [],
    };
  } catch (error) {
    console.error("Error fetching stock receipts:", error);
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || "Failed to fetch stock receipts",
    };
  }
};

// Get inventory statistics
export const getInventoryStats = async () => {
  try {
    const response = await api.get("/api/inventory/stats/dashboard");
    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error) {
    console.error("Error fetching inventory stats:", error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || "Failed to fetch inventory stats",
    };
  }
};

// Update inventory thresholds
export const updateThresholds = async (fuelType, thresholds) => {
  try {
    const response = await api.patch(`/api/inventory/${fuelType}/thresholds`, thresholds);
    return {
      success: true,
      data: response.data.data || response.data,
      message: "Thresholds updated successfully",
    };
  } catch (error) {
    console.error("Error updating thresholds:", error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || "Failed to update thresholds",
    };
  }
};