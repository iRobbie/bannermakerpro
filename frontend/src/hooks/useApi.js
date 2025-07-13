import { useState, useCallback } from 'react';
import { apiService } from '../services/api';

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);

  const uploadImages = useCallback(async (images) => {
    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await apiService.uploadImages(images);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Brief delay to show 100% progress
      setTimeout(() => {
        setUploadProgress(0);
        setIsUploading(false);
      }, 500);

      return result;
    } catch (error) {
      setUploadError(error.message);
      setIsUploading(false);
      setUploadProgress(0);
      throw error;
    }
  }, []);

  const clearError = useCallback(() => {
    setUploadError(null);
  }, []);

  return {
    isUploading,
    uploadProgress,
    uploadError,
    uploadImages,
    clearError
  };
};

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const projectList = await apiService.getProjects();
      setProjects(projectList);
      return projectList;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProject = useCallback(async (projectData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newProject = await apiService.createProject(projectData);
      setProjects(prev => [newProject, ...prev]);
      setCurrentProject(newProject);
      return newProject;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProject = useCallback(async (projectId, updateData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedProject = await apiService.updateProject(projectId, updateData);
      setProjects(prev => prev.map(p => p.id === projectId ? updatedProject : p));
      if (currentProject && currentProject.id === projectId) {
        setCurrentProject(updatedProject);
      }
      return updatedProject;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentProject]);

  const deleteProject = useCallback(async (projectId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await apiService.deleteProject(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
      if (currentProject && currentProject.id === projectId) {
        setCurrentProject(null);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentProject]);

  const loadProject = useCallback(async (projectId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const project = await apiService.getProject(projectId);
      setCurrentProject(project);
      return project;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    projects,
    currentProject,
    isLoading,
    error,
    loadProjects,
    createProject,
    updateProject,
    deleteProject,
    loadProject,
    setCurrentProject,
    clearError
  };
};

export const useExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportError, setExportError] = useState(null);

  const exportBanner = useCallback(async (projectId) => {
    setIsExporting(true);
    setExportError(null);
    setExportProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setExportProgress(prev => Math.min(prev + 15, 90));
      }, 300);

      const result = await apiService.exportBanner(projectId);
      
      clearInterval(progressInterval);
      setExportProgress(100);
      
      // Brief delay to show 100% progress
      setTimeout(() => {
        setExportProgress(0);
        setIsExporting(false);
      }, 500);

      return result;
    } catch (error) {
      setExportError(error.message);
      setIsExporting(false);
      setExportProgress(0);
      throw error;
    }
  }, []);

  const downloadBanner = useCallback(async (projectId, filename = 'banner') => {
    setIsExporting(true);
    setExportError(null);
    setExportProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setExportProgress(prev => Math.min(prev + 20, 90));
      }, 200);

      const blob = await apiService.downloadBanner(projectId);
      
      clearInterval(progressInterval);
      setExportProgress(100);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setTimeout(() => {
        setExportProgress(0);
        setIsExporting(false);
      }, 500);

      return true;
    } catch (error) {
      setExportError(error.message);
      setIsExporting(false);
      setExportProgress(0);
      throw error;
    }
  }, []);

  const clearError = useCallback(() => {
    setExportError(null);
  }, []);

  return {
    isExporting,
    exportProgress,
    exportError,
    exportBanner,
    downloadBanner,
    clearError
  };
};