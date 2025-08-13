import api from "./axios";

// Get all financial transactions
export const getTransactions = async (params = {}) => {
  const response = await api.get("/api/financial", { params });
  return response.data;
};

// Get transaction by ID
export const getTransaction = async (id) => {
  const response = await api.get(`/api/financial/${id}`);
  return response.data;
};

// Create new transaction
export const createTransaction = async (transactionData) => {
  const response = await api.post("/api/financial", transactionData);
  return response.data;
};

// Update transaction
export const updateTransaction = async (id, transactionData) => {
  const response = await api.put(`/api/financial/${id}`, transactionData);
  return response.data;
};

// Delete transaction
export const deleteTransaction = async (id) => {
  const response = await api.delete(`/api/financial/${id}`);
  return response.data;
};

// Get financial dashboard stats
export const getFinancialStats = async () => {
  const response = await api.get("/api/financial/stats/dashboard");
  return response.data;
};

// Get income vs expenses report
export const getIncomeExpensesReport = async (startDate, endDate) => {
  const response = await api.get("/api/financial/reports/income-expenses", {
    params: { startDate, endDate },
  });
  return response.data;
};