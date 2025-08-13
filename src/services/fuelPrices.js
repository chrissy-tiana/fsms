import api from "./axios";

// Get current fuel prices
export const getCurrentFuelPrices = async () => {
  const response = await api.get("/api/fuel-prices/current");
  return response.data;
};

// Get all fuel prices with history
export const getFuelPrices = async (params = {}) => {
  const response = await api.get("/api/fuel-prices", { params });
  return response.data;
};

// Create/Update fuel price
export const updateFuelPrice = async (priceData) => {
  const response = await api.post("/api/fuel-prices", priceData);
  return response.data;
};

// Get price history for specific fuel type
export const getFuelPriceHistory = async (fuelType, limit = 10) => {
  const response = await api.get(`/api/fuel-prices/${fuelType}/history`, {
    params: { limit },
  });
  return response.data;
};

// Get fuel price statistics
export const getFuelPriceStats = async () => {
  const response = await api.get("/api/fuel-prices/stats/dashboard");
  return response.data;
};