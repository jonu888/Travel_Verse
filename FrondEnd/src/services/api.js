import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API calls
export const authService = {
  register: async (userData) => {
    const response = await api.post('/register/', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/login/', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.user.id || response.data.userId);
      console.log("Login successful - Token:", response.data.token); // Debug log
      console.log("Login successful - User ID:", response.data.user.id || response.data.userId);
    }
    console.log("Login response:", response.data);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/logout/');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    return response.data;
  },
};

// User Profile API calls
export const userProfileService = {
  getProfile: async () => {
    const response = await api.get('/profile/');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.post('/profile/', profileData);
    return response.data;
  },
};

// Test API call
export const testApi = async () => {
  const response = await api.get('/test/');
  return response.data;
};

export default api;

const API_BASE_URL = "http://localhost:8000/api/plans/"; // Update this URL if needed

// Fetch all plans
export const fetchPlans = async () => {
  try {
    const response = await api.get(API_BASE_URL); // Use the configured api instance
    return response.data;
  } catch (error) {
    console.error("Error fetching plans:", error.response?.data || error.message);
    throw error;
  }
};

// Fetch a single plan by ID
export const fetchPlanById = async (id) => {
  try {
    const response = await api.get(`/plans/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching plan with ID ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

// Create a new plan
export const createPlan = async (tripData) => {
  try {
    console.log("Sending data to API:", tripData);
    const response = await axios.post(`${API_BASE_URL}`, tripData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    console.log("API response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating trip:", error.response?.data || error.message);
    throw error;
  }
};

// Update an existing plan
export const updatePlan = async (id, planData) => {
  try {
    const response = await api.put(`/plans/${id}/`, planData);
    return response.data;
  } catch (error) {
    console.error(`Error updating plan with ID ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

// Delete a plan
export const deletePlan = async (id) => {
  try {
    const response = await api.delete(`/plans/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting plan with ID ${id}:`, error.response?.data || error.message);
    throw error;
  }
};