import { useEffect, useState, useCallback } from 'react';
import { useTeacherAPI } from '../hooks/useTeacherAPI';
import { useNotification } from '../context/NotificationContext';
import { AVAILABLE_TOPICS } from '../lib/topics';
import { useDashboard } from '../context/DashboardContext';
import TeacherContentBlock from './TeacherContentBlock';
import {
  Container,
  TeacherFilterContainer as FilterContainer,
  FilterLabel,
  FilterSelect,
  PaginationContainer,
  PageButton,
  DisclaimerText,
  NoContentMessage,
  ListContainer
} from '../styles/components/ContentBrowserStyles';

interface Story {
  id: string;
  title: string;
  preview_text: string;
  language: string;
  topic: string;
  cefr_level: string;
  date_created: string;
  content_type: string;
  audiobook_tier: string;
  [key: string]: any;
}

interface TeacherStoryBrowserProps {
  defaultLanguage?: string;
}

const TeacherStoryBrowser = ({ defaultLanguage = 'any' }: TeacherStoryBrowserProps) => {
  const contentPerPage = 6;
  const [content, setContent] = useState<Story[]>([]);
  const [isTeacher, setIsTeacher] = useState(false);
  const { selectedClassroom } = useDashboard();
  const [currentFilters, setCurrentFilters] = useState({
    language: defaultLanguage,
    cefr: 'any',
    subject: 'any',
    page: '1',
    pagesize: '6',
    whitelist: 'accepted'
  });

  const { showNotification } = useNotification();
  const {
    verifyTeacher,
    fetchContent,
    acceptContent,
    rejectContent
  } = useTeacherAPI();

  const handlePageChange = useCallback(async (newPage: number) => {
    setCurrentFilters(prev => ({
      ...prev,
      page: newPage.toString()
    }));
  }, []);

  const handleFilterChange = useCallback(async (filterType: string, value: string) => {
    setCurrentFilters(prev => ({
      ...prev,
      [filterType]: value,
      page: '1'
    }));
  }, []);

  const loadContent = useCallback(async () => {
    if (!isTeacher || selectedClassroom === '') return;
    try {
      const contentData = await fetchContent(
        {
          ...currentFilters,
          classroom_id: selectedClassroom
        }
      );
      setContent(contentData);
    } catch (error) {
      showNotification('Error loading content', 'error');
    }
  }, [currentFilters, selectedClassroom, fetchContent]);

  const handleAccept = useCallback(async (story: Story) => {
    try {
      await acceptContent({ 
        content_id: parseInt(story.id), 
        content_type: story.content_type,
        classroom_id: selectedClassroom
      });
      showNotification('Content accepted successfully', 'success');
      await loadContent();
    } catch (error) {
      showNotification('Error accepting content', 'error');
    }
  }, [acceptContent, showNotification, loadContent, selectedClassroom]);

  const handleReject = useCallback(async (story: Story) => {
    try {
      await rejectContent({ 
        content_id: parseInt(story.id), 
        content_type: story.content_type,
        classroom_id: selectedClassroom
      });
      showNotification('Content rejected successfully', 'success');
      await loadContent();
    } catch (error) {
      showNotification('Error rejecting content', 'error');
    }
  }, [rejectContent, showNotification, loadContent, selectedClassroom]);

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
  }, [selectedClassroom, currentFilters]);

  return (
    <Container>
      <FilterContainer>
        <div style={{ flex: 1 }}>
          <FilterLabel>Status</FilterLabel>
          <FilterSelect
            value={currentFilters.whitelist}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange('whitelist', e.target.value)}
          >
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </FilterSelect>
        </div>

        <div style={{ flex: 1 }}>
          <FilterLabel>Language</FilterLabel>
          <FilterSelect 
            value={currentFilters.language} 
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange('language', e.target.value)}
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
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange('cefr', e.target.value)}
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
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange('subject', e.target.value)}
          >
            <option value="any">Any Topic</option>
            {AVAILABLE_TOPICS.map(topic => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </FilterSelect>
        </div>
      </FilterContainer>
      
      {content.length > 0 ? (
        <ListContainer>
          {content.map((story) => (
            <TeacherContentBlock
              key={story.id}
              story={story}
              onAccept={handleAccept}
              onReject={handleReject}
              status={currentFilters.whitelist}
            />
          ))}
        </ListContainer>
      ) : (
        <NoContentMessage>No stories found for these filters!</NoContentMessage>
      )}

      <PaginationContainer>
        <PageButton 
          onClick={() => handlePageChange(currentFilters.page === '1' ? 1 : parseInt(currentFilters.page) - 1)} 
          disabled={currentFilters.page === '1'}
        >
          Previous
        </PageButton>
        <PageButton disabled>
          Page {currentFilters.page}
        </PageButton>
        <PageButton 
          onClick={() => handlePageChange(parseInt(currentFilters.page) + 1)} 
          disabled={content.length < contentPerPage}
        >
          Next
        </PageButton>
      </PaginationContainer>

      <DisclaimerText>
        Always double check content before accepting to your student(s).
      </DisclaimerText>
    </Container>
  );
};

export default TeacherStoryBrowser; 