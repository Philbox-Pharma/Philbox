import { createContext, useContext, useState, useEffect } from "react";
import { adminAuthApi } from "../../core/api/admin/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize user from localStorage if available (to persist on refresh)
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("adminUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [loading, setLoading] = useState(false);

  // Function to save user data after successful OTP verification
  const loginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem("adminUser", JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await adminAuthApi.logout();
    } catch (error) {
      console.error("Logout failed on server", error);
    } finally {
      setUser(null);
      localStorage.removeItem("adminUser");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loginSuccess, logout, loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
