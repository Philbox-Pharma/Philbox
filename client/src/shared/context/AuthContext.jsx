import { createContext, useContext, useState, useEffect } from 'react';
import { adminAuthApi } from '../../core/api/admin/auth';
import { doctorAuthApi } from '../../core/api/doctor/auth';
import { customerAuthApi } from '../../core/api/customer/auth';
import { salespersonAuthApi } from '../../core/api/salesperson/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize user from localStorage if available (to persist on refresh)
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('authUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [loading, setLoading] = useState(true);

  // Function to save user data
  const loginSuccess = userData => {
    setUser(userData);
    localStorage.setItem('authUser', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      // Role-based logout
      if (user?.role === 'doctor') {
        await doctorAuthApi.logout();
      } else if (user?.role === 'customer') {
        await customerAuthApi.logout();
      } else if (user?.role === 'salesperson') {
        await salespersonAuthApi.logout();
      } else {
        await adminAuthApi.logout();
      }
    } catch (error) {
      console.error('Logout failed on server', error);
    } finally {
      setUser(null);
      localStorage.removeItem('authUser');
    }
  };

  // Verify session on mount
  useEffect(() => {
    const checkSession = async () => {
      // If no user in localStorage, nothing to check with cookies for now
      // (Unless we want to check even if local is empty - but usually local has 'remembers')
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        let response;
        if (user.role === 'doctor') {
          response = await doctorAuthApi.getMe();
        } else if (user.role === 'customer') {
          response = await customerAuthApi.getMe();
        } else if (user.role === 'salesperson') {
          response = await salespersonAuthApi.getMe();
        } else {
          response = await adminAuthApi.getMe();
        }

        const latestUser = response.data || response;
        loginSuccess({ ...user, ...latestUser });
      } catch (err) {
        console.error('Session verification failed:', err);
        // If 401/403, our cookie is gone or invalid
        if (err.response?.status === 401 || err.response?.status === 403) {
          setUser(null);
          localStorage.removeItem('authUser');
        }
      } finally {
        setLoading(false);
      }
    };

    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loginSuccess, logout, loading, setLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
