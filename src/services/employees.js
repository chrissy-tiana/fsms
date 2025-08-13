import api from "./axios";

// Get all employees
export const getEmployees = async () => {
  const response = await api.get("/api/employees");
  return response.data;
};

// Get employee by ID
export const getEmployee = async (id) => {
  const response = await api.get(`/api/employees/${id}`);
  return response.data;
};

// Create new employee
export const createEmployee = async (employeeData) => {
  const response = await api.post("/api/employees", employeeData);
  return response.data;
};

// Update employee
export const updateEmployee = async (id, employeeData) => {
  const response = await api.put(`/api/employees/${id}`, employeeData);
  return response.data;
};

// Update employee status
export const updateEmployeeStatus = async (id, status) => {
  const response = await api.patch(`/api/employees/${id}/status`, { status });
  return response.data;
};

// Delete employee
export const deleteEmployee = async (id) => {
  const response = await api.delete(`/api/employees/${id}`);
  return response.data;
};

// Get employee statistics
export const getEmployeeStats = async () => {
  const response = await api.get("/api/employees/stats/dashboard");
  return response.data;
};