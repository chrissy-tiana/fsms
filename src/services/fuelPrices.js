import api from "./axios";

// Get current fuel prices
export const getCurrentFuelPrices = async () => {
  try {
    const response = await api.get("/api/fuel-prices/current");
    return {
      success: true,
      data: response.data.data || response.data || [],
    };
  } catch (error) {
    console.error("Error fetching current fuel prices:", error);
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || "Failed to fetch current fuel prices",
    };
  }
};

// Get all fuel prices with history
export const getFuelPrices = async (params = {}) => {
  try {
    const response = await api.get("/api/fuel-prices", { params });
    return {
      success: true,
      data: response.data.data || response.data || [],
    };
  } catch (error) {
    console.error("Error fetching fuel prices:", error);
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || "Failed to fetch fuel prices",
    };
  }
};

// Create/Update fuel price
export const updateFuelPrice = async (priceData) => {
  try {
    const response = await api.post("/api/fuel-prices", priceData);
    return {
      success: true,
      data: response.data.data || response.data,
      message: "Fuel price updated successfully",
    };
  } catch (error) {
    console.error("Error updating fuel price:", error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || "Failed to update fuel price",
    };
  }
};

// Get price history for specific fuel type
export const getFuelPriceHistory = async (fuelType, limit = 10) => {
  try {
    const response = await api.get(`/api/fuel-prices/${fuelType}/history`, {
      params: { limit },
    });
    return {
      success: true,
      data: response.data.data || response.data || [],
    };
  } catch (error) {
    console.error("Error fetching fuel price history:", error);
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || "Failed to fetch fuel price history",
    };
  }
};

// Get fuel price statistics
export const getFuelPriceStats = async () => {
  try {
    const response = await api.get("/api/fuel-prices/stats/dashboard");
    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error) {
    console.error("Error fetching fuel price stats:", error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || "Failed to fetch fuel price stats",
    };
  }
};