import axios from "axios";

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: "http://localhost:5000/api", // Adjust based on your server port
  withCredentials: true, // IMPORTANT: This allows cookies to be sent/received
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: Interceptor to handle global errors (like 401 Session Expired)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Logic to redirect to login if session expires can go here
      // or handled in the UI
    }
    return Promise.reject(error);
  }
);

export default apiClient;
