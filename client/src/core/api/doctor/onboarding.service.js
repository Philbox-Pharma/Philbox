import apiClient from "../client";

const BASE_URL = "/doctor/onboarding";

export const doctorOnboardingApi = {
  // Submit Application (Document Upload)
  submitApplication: async (formData) => {
    const response = await apiClient.post(`${BASE_URL}/submit-application`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get Application Status
  getApplicationStatus: async () => {
    const response = await apiClient.get(`${BASE_URL}/application-status`);
    return response.data;
  },

  // Resubmit Application (for rejected applications)
  resubmitApplication: async (formData) => {
    const response = await apiClient.post(`${BASE_URL}/resubmit-application`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Complete Profile (Education, Experience, etc.)
  completeProfile: async (formData) => {
    const response = await apiClient.post(`${BASE_URL}/complete-profile`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
