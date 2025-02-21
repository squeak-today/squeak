import TeacherStoryList from './TeacherStoryList';
import { useState, useEffect } from 'react';
import { AVAILABLE_TOPICS } from '../lib/topics';
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

const TeacherStoryBrowser = ({ stories, onParamsSelect, onStoryBlockClick, onAccept, defaultLanguage }) => {
  const [filterLanguage, setFilterLanguage] = useState(defaultLanguage);
  const [filterCefr, setFilterCefr] = useState('any');
  const [filterSubject, setFilterSubject] = useState('any');
  const [currentPage, setCurrentPage] = useState(1);
  const storiesPerPage = 6;

  useEffect(() => {
    setFilterLanguage(defaultLanguage);
  }, [defaultLanguage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    onParamsSelect(filterLanguage, filterCefr, filterSubject, newPage, storiesPerPage);
  };

  return (
    <Container>
      <FilterContainer>
        <div style={{ flex: 1 }}>
          <FilterLabel>Language</FilterLabel>
          <FilterSelect 
            value={filterLanguage} 
            onChange={(e) => { 
              setFilterLanguage(e.target.value); 
              setCurrentPage(1);
              onParamsSelect(e.target.value, filterCefr, filterSubject, 1, storiesPerPage); 
            }}
          >
            <option value="any">Any Language</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
          </FilterSelect>
        </div>

        <div style={{ flex: 1 }}>
          <FilterLabel>CEFR Level</FilterLabel>
          <FilterSelect 
            value={filterCefr} 
            onChange={(e) => { 
              setFilterCefr(e.target.value); 
              setCurrentPage(1);
              onParamsSelect(filterLanguage, e.target.value, filterSubject, 1, storiesPerPage); 
            }}
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
            value={filterSubject} 
            onChange={(e) => { 
              setFilterSubject(e.target.value); 
              setCurrentPage(1);
              onParamsSelect(filterLanguage, filterCefr, e.target.value, 1, storiesPerPage); 
            }}
          >
            <option value="any">Any Topic</option>
            {AVAILABLE_TOPICS.map(topic => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </FilterSelect>
        </div>
      </FilterContainer>
      
      {stories.length > 0 ? (
        <TeacherStoryList 
          stories={stories} 
          onStoryBlockClick={onStoryBlockClick}
          onAccept={onAccept}
        />
      ) : (
        <NoContentMessage>No stories found for these filters!</NoContentMessage>
      )}

      {stories.length > 0 && (
        <PaginationContainer>
          <PageButton 
            onClick={() => handlePageChange(currentPage - 1)} 
            disabled={currentPage === 1}
          >
            Previous
          </PageButton>
          <PageButton disabled>
            Page {currentPage}
          </PageButton>
          <PageButton 
            onClick={() => handlePageChange(currentPage + 1)} 
            disabled={stories.length < storiesPerPage}
          >
            Next
          </PageButton>
        </PaginationContainer>
      )}

      <DisclaimerText>
        Content may be AI-assisted. Please verify important details from official sources.
      </DisclaimerText>
    </Container>
  );
};

export default TeacherStoryBrowser;
