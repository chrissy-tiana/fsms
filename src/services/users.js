import api from "./axios";

export const getUsers = async () => {
  try {
    const response = await api.get("/api/users");
    return {
      success: true,
      data: response.data.data || response.data || [],
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || "Failed to fetch users",
    };
  }
};

export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/api/users/${userId}`);
    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || "Failed to fetch user",
    };
  }
};

export const updateUserStatus = async (userId, status) => {
  try {
    const response = await api.patch(`/api/users/${userId}/status`, { status });
    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error) {
    console.error("Error updating user status:", error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || "Failed to update user status",
    };
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/api/users/${userId}`);
    return {
      success: true,
      message: "User deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to delete user",
    };
  }
};