import api from "./axios";

// Get all fuel sales
export const getFuelSales = async (params = {}) => {
  const response = await api.get("/api/fuel-sales", { params });
  return response.data;
};

// Get fuel sale by ID
export const getFuelSale = async (id) => {
  const response = await api.get(`/api/fuel-sales/${id}`);
  return response.data;
};

// Create new fuel sale
export const createFuelSale = async (saleData) => {
  const response = await api.post("/api/fuel-sales", saleData);
  return response.data;
};

// Update fuel sale
export const updateFuelSale = async (id, saleData) => {
  const response = await api.put(`/api/fuel-sales/${id}`, saleData);
  return response.data;
};

// Delete fuel sale
export const deleteFuelSale = async (id) => {
  const response = await api.delete(`/api/fuel-sales/${id}`);
  return response.data;
};

// Get fuel sales statistics
export const getFuelSalesStats = async () => {
  const response = await api.get("/api/fuel-sales/stats/dashboard");
  return response.data;
};

// Get sales by date range
export const getSalesByDateRange = async (startDate, endDate) => {
  const response = await api.get("/api/fuel-sales/stats/range", {
    params: { startDate, endDate },
  });
  return response.data;
};