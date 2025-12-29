import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: BASE_URL, // Adjust based on your server port
  withCredentials: true, // IMPORTANT: This allows cookies to be sent/received
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Interceptor to handle global errors (like 401 Session Expired)
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Logic to redirect to login if session expires can go here
      // or handled in the UI
    }
    return Promise.reject(error);
  }
);

export default apiClient;
