import { useState, useCallback } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { teacherService } from '../lib/teacherService';

export const useTeacher = () => {
  const [content, setContent] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [classroomInfo, setClassroomInfo] = useState(null);
  const { showNotification } = useNotification();

  const [currentFilters, setCurrentFilters] = useState({
    language: 'any',
    cefr: 'any',
    subject: 'any',
    page: 1,
    pagesize: 6,
    whitelist: 'accepted'
  });

  const updateContentFilters = useCallback((updates) => {
    setCurrentFilters(prev => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const verifyTeacher = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await teacherService.verifyTeacher();
      return data.exists;
    } catch (error) {
      showNotification('Error verifying teacher status', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [showNotification]);

  const fetchClassroomInfo = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await teacherService.getClassroomInfo();
      setClassroomInfo(data);
      return data;
    } catch (error) {
      showNotification('Error fetching classroom info', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [showNotification]);

  const fetchContent = useCallback(async (filters = currentFilters) => {
    setIsLoading(true);
    try {
      const data = await teacherService.fetchContent(filters);
      setContent(data);
      return data;
    } catch (error) {
      showNotification('Error fetching content', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentFilters, showNotification]);

  const acceptStory = useCallback(async (story) => {
    setIsLoading(true);
    try {
      await teacherService.acceptContent(story);
      showNotification('Story accepted successfully', 'success');
    } catch (error) {
      showNotification('Error accepting story', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [showNotification]);

  const rejectStory = useCallback(async (story) => {
    setIsLoading(true);
    try {
      await teacherService.rejectContent(story);
      showNotification('Story rejected successfully', 'success');
    } catch (error) {
      showNotification('Error rejecting story', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [showNotification]);

  return {
    isLoading,
    content,
    classroomInfo,
    currentFilters,
    updateContentFilters,
    verifyTeacher,
    fetchClassroomInfo,
    fetchContent,
    acceptStory,
    rejectStory
  };
}; 