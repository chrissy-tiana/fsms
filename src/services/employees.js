import api from "./axios";

// Get all employees
export const getEmployees = async () => {
  try {
    const response = await api.get("/api/employees");
    return {
      success: true,
      data: response.data.data || response.data || [],
    };
  } catch (error) {
    console.error("Error fetching employees:", error);
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || "Failed to fetch employees",
    };
  }
};

// Get employee by ID
export const getEmployee = async (id) => {
  try {
    const response = await api.get(`/api/employees/${id}`);
    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error) {
    console.error("Error fetching employee:", error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || "Failed to fetch employee",
    };
  }
};

// Create new employee
export const createEmployee = async (employeeData) => {
  try {
    const response = await api.post("/api/employees", employeeData);
    return {
      success: true,
      data: response.data.data || response.data,
      message: "Employee created successfully",
    };
  } catch (error) {
    console.error("Error creating employee:", error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || "Failed to create employee",
    };
  }
};

// Update employee
export const updateEmployee = async (id, employeeData) => {
  try {
    const response = await api.put(`/api/employees/${id}`, employeeData);
    return {
      success: true,
      data: response.data.data || response.data,
      message: "Employee updated successfully",
    };
  } catch (error) {
    console.error("Error updating employee:", error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || "Failed to update employee",
    };
  }
};

// Update employee status
export const updateEmployeeStatus = async (id, status) => {
  try {
    const response = await api.patch(`/api/employees/${id}/status`, { status });
    return {
      success: true,
      data: response.data.data || response.data,
      message: "Employee status updated successfully",
    };
  } catch (error) {
    console.error("Error updating employee status:", error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || "Failed to update employee status",
    };
  }
};

// Delete employee
export const deleteEmployee = async (id) => {
  try {
    const response = await api.delete(`/api/employees/${id}`);
    return {
      success: true,
      message: "Employee deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting employee:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to delete employee",
    };
  }
};

// Get employee statistics
export const getEmployeeStats = async () => {
  try {
    const response = await api.get("/api/employees/stats/dashboard");
    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error) {
    console.error("Error fetching employee stats:", error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || "Failed to fetch employee stats",
    };
  }
};