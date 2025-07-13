import axios from 'axios';

// Create axios instance with base URL from environment
const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add session ID
api.interceptors.request.use((config) => {
  // Get or generate session ID
  let sessionId = localStorage.getItem('banner_maker_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('banner_maker_session_id', sessionId);
  }
  
  config.headers['X-Session-ID'] = sessionId;
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      throw new Error(data.detail || `Server error: ${status}`);
    } else if (error.request) {
      // No response received
      throw new Error('No response from server. Please check your connection.');
    } else {
      // Request setup error
      throw new Error('Request failed. Please try again.');
    }
  }
);

export const apiService = {
  // Image API calls
  async uploadImages(images) {
    try {
      // Convert images to base64 format expected by backend
      const imageData = await Promise.all(
        images.map(async (image) => {
          const base64 = await fileToBase64(image.file);
          return {
            name: image.name,
            size: image.size,
            content_type: image.file.type,
            data: base64
          };
        })
      );

      const response = await api.post('/api/images/upload', {
        images_data: JSON.stringify(imageData)
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        transformRequest: [(data) => {
          const formData = new FormData();
          formData.append('images_data', data.images_data);
          return formData;
        }]
      });

      return response.data;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  },

  async getImages() {
    const response = await api.get('/api/images/');
    return response.data;
  },

  async deleteImage(imageId) {
    const response = await api.delete(`/api/images/${imageId}`);
    return response.data;
  },

  async getImageFile(imageId) {
    const response = await api.get(`/api/images/${imageId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Project API calls
  async createProject(projectData) {
    const response = await api.post('/api/projects/', projectData);
    return response.data;
  },

  async getProjects() {
    const response = await api.get('/api/projects/');
    return response.data;
  },

  async getProject(projectId) {
    const response = await api.get(`/api/projects/${projectId}`);
    return response.data;
  },

  async updateProject(projectId, updateData) {
    const response = await api.put(`/api/projects/${projectId}`, updateData);
    return response.data;
  },

  async deleteProject(projectId) {
    const response = await api.delete(`/api/projects/${projectId}`);
    return response.data;
  },

  async duplicateProject(projectId) {
    const response = await api.post(`/api/projects/${projectId}/duplicate`);
    return response.data;
  },

  // Export API calls
  async exportBanner(projectId) {
    const response = await api.post(`/api/export/${projectId}/generate`);
    return response.data;
  },

  async downloadBanner(projectId) {
    const response = await api.get(`/api/export/${projectId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Health check
  async healthCheck() {
    const response = await api.get('/api/health');
    return response.data;
  }
};

// Helper function to convert file to base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remove data URL prefix to get pure base64
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

export default api;