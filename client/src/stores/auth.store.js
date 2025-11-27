import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      userRole: null, // 'doctor' | 'customer' | null
      loading: false,
      error: null,

      // Actions
      login: async (credentials, role) => {
        set({ loading: true, error: null });
        try {
          // TODO: Replace with actual API call
          const response = await fetch(`/api/${role}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
          });

          if (!response.ok) throw new Error('Login failed');

          const data = await response.json();

          set({
            user: data.user,
            isAuthenticated: true,
            userRole: role,
            loading: false,
            error: null,
          });

          return { success: true };
        } catch (error) {
          set({
            loading: false,
            error: error.message,
          });
          return { success: false, error: error.message };
        }
      },

      signup: async (userData, role) => {
        set({ loading: true, error: null });
        try {
          // TODO: Replace with actual API call
          const response = await fetch(`/api/${role}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
          });

          if (!response.ok) throw new Error('Signup failed');

          const data = await response.json();

          set({
            user: data.user,
            isAuthenticated: true,
            userRole: role,
            loading: false,
            error: null,
          });

          return { success: true };
        } catch (error) {
          set({
            loading: false,
            error: error.message,
          });
          return { success: false, error: error.message };
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          userRole: null,
          error: null,
        });
      },

      clearError: () => {
        set({ error: null });
      },

      // Getters
      getUser: () => get().user,
      getUserRole: () => get().userRole,
      isDoctor: () => get().userRole === 'doctor',
      isCustomer: () => get().userRole === 'customer',
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: state => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        userRole: state.userRole,
      }),
    }
  )
);

export default useAuthStore;
