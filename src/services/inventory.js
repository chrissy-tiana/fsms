import api from "./axios";

// Get all inventory items
export const getInventory = async () => {
  const response = await api.get("/api/inventory");
  return response.data;
};

// Get inventory by fuel type
export const getInventoryByType = async (fuelType) => {
  const response = await api.get(`/api/inventory/${fuelType}`);
  return response.data;
};

// Create or update inventory item
export const updateInventory = async (inventoryData) => {
  const response = await api.post("/api/inventory", inventoryData);
  return response.data;
};

// Add stock (stock in)
export const addStock = async (stockData) => {
  const response = await api.post("/api/inventory/stock-in", stockData);
  return response.data;
};

// Get stock receipts
export const getStockReceipts = async (params = {}) => {
  const response = await api.get("/api/inventory/stock-receipts/all", { params });
  return response.data;
};

// Get inventory statistics
export const getInventoryStats = async () => {
  const response = await api.get("/api/inventory/stats/dashboard");
  return response.data;
};

// Update inventory thresholds
export const updateThresholds = async (fuelType, thresholds) => {
  const response = await api.patch(`/api/inventory/${fuelType}/thresholds`, thresholds);
  return response.data;
};