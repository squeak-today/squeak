import TeacherStoryList from './TeacherStoryList';
import { useEffect, useState, useCallback } from 'react';
import { useTeacherAPI } from '../services/hooks/useTeacherAPI';
import { useNotification } from '../context/NotificationContext';
import { AVAILABLE_TOPICS } from '../services/lib/topics';
import {
  Container,
  TeacherFilterContainer as FilterContainer,
  FilterLabel,
  FilterSelect,
  PaginationContainer,
  PageButton,
  DisclaimerText,
  NoContentMessage
} from '../styles/components/TeacherStoryBrowserStyles';

const TeacherStoryBrowser = ({ defaultLanguage = 'any' }) => {
  const contentPerPage = 6;
  const [content, setContent] = useState([]);
  const [isTeacher, setIsTeacher] = useState(false);
  const [currentFilters, setCurrentFilters] = useState({
    language: defaultLanguage,
    cefr: 'any',
    subject: 'any',
    page: 1,
    pagesize: 6,
    whitelist: 'accepted'
  });

  const { showNotification } = useNotification();
  const {
    verifyTeacher,
    fetchContent,
    acceptContent,
    rejectContent
  } = useTeacherAPI();

  const handlePageChange = useCallback((newPage) => {
    setCurrentFilters(prev => ({
      ...prev,
      page: newPage
    }));
  }, []);

  const handleFilterChange = useCallback((filterType, value) => {
    setCurrentFilters(prev => ({
      ...prev,
      [filterType]: value,
      page: 1
    }));
  }, []);

  const loadContent = useCallback(async () => {
    if (!isTeacher) return;
    try {
      const contentData = await fetchContent(currentFilters);
      setContent(contentData);
    } catch (error) {
      showNotification('Error loading content', 'error');
    }
  }, [fetchContent, currentFilters, isTeacher, showNotification]);

  const handleAccept = useCallback(async (story) => {
    try {
      await acceptContent(story);
      showNotification('Content accepted successfully', 'success');
      await loadContent();
    } catch (error) {
      showNotification('Error accepting content', 'error');
    }
  }, [acceptContent, showNotification, loadContent]);

  const handleReject = useCallback(async (story) => {
    try {
      await rejectContent(story);
      showNotification('Content rejected successfully', 'success');
      await loadContent();
    } catch (error) {
      showNotification('Error rejecting content', 'error');
    }
  }, [rejectContent, showNotification, loadContent]);

  useEffect(() => {
    const checkTeacherStatus = async () => {
      try {
        const result = await verifyTeacher();
        setIsTeacher(result.exists);
      } catch (error) {
        showNotification('Error verifying teacher status', 'error');
      }
    };
    checkTeacherStatus();
  }, [verifyTeacher, showNotification]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  return (
    <Container>
      <FilterContainer>
        <div style={{ flex: 1 }}>
          <FilterLabel>Status</FilterLabel>
          <FilterSelect
            value={currentFilters.whitelist}
            onChange={(e) => handleFilterChange('whitelist', e.target.value)}
          >
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </FilterSelect>
        </div>

        <div style={{ flex: 1 }}>
          <FilterLabel>Language</FilterLabel>
          <FilterSelect 
            value={currentFilters.language} 
            onChange={(e) => handleFilterChange('language', e.target.value)}
          >
            <option value="any">Any Language</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
          </FilterSelect>
        </div>

        <div style={{ flex: 1 }}>
          <FilterLabel>CEFR Level</FilterLabel>
          <FilterSelect 
            value={currentFilters.cefr} 
            onChange={(e) => handleFilterChange('cefr', e.target.value)}
          >
            <option value="any">Any Level</option>
            <option value="A1">A1 (Beginner)</option>
            <option value="A2">A2 (Elementary)</option>
            <option value="B1">B1 (Intermediate)</option>
            <option value="B2">B2 (Upper Intermediate)</option>
            <option value="C1">C1 (Advanced)</option>
            <option value="C2">C2 (Proficient)</option>
          </FilterSelect>
        </div>

        <div style={{ flex: 1 }}>
          <FilterLabel>Topic</FilterLabel>
          <FilterSelect 
            value={currentFilters.subject} 
            onChange={(e) => handleFilterChange('subject', e.target.value)}
          >
            <option value="any">Any Topic</option>
            {AVAILABLE_TOPICS.map(topic => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </FilterSelect>
        </div>
      </FilterContainer>
      
      {content.length > 0 ? (
        <TeacherStoryList 
          stories={content} 
          onAccept={handleAccept}
          onReject={handleReject}
          status={currentFilters.whitelist}
        />
      ) : (
        <NoContentMessage>No stories found for these filters!</NoContentMessage>
      )}

      <PaginationContainer>
        <PageButton 
          onClick={() => handlePageChange(currentFilters.page - 1)} 
          disabled={currentFilters.page === 1}
        >
          Previous
        </PageButton>
        <PageButton disabled>
          Page {currentFilters.page}
        </PageButton>
        <PageButton 
          onClick={() => handlePageChange(currentFilters.page + 1)} 
          disabled={content.length < contentPerPage}
        >
          Next
        </PageButton>
      </PaginationContainer>

      <DisclaimerText>
        Content may be AI-assisted. Please verify important details from official sources.
      </DisclaimerText>
    </Container>
  );
};

export default TeacherStoryBrowser;
