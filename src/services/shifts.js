import api from "./axios";

// Get all shifts
export const getShifts = async (params = {}) => {
  const response = await api.get("/api/shifts", { params });
  return response.data;
};

// Get shift by ID
export const getShift = async (id) => {
  const response = await api.get(`/api/shifts/${id}`);
  return response.data;
};

// Start new shift
export const startShift = async (shiftData) => {
  const response = await api.post("/api/shifts/start", shiftData);
  return response.data;
};

// End shift
export const endShift = async (id, endData) => {
  const response = await api.patch(`/api/shifts/${id}/end`, endData);
  return response.data;
};

// Add break to shift
export const addBreak = async (id, breakData) => {
  const response = await api.patch(`/api/shifts/${id}/break`, breakData);
  return response.data;
};

// Get active shifts
export const getActiveShifts = async () => {
  const response = await api.get("/api/shifts/active/all");
  return response.data;
};

// Get shift statistics
export const getShiftStats = async () => {
  const response = await api.get("/api/shifts/stats/dashboard");
  return response.data;
};

// Cancel shift
export const cancelShift = async (id, reason) => {
  const response = await api.patch(`/api/shifts/${id}/cancel`, { reason });
  return response.data;
};