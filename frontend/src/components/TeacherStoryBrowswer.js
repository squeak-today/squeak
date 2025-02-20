import styled from 'styled-components';
import StoryList from './StoryList';
import { useState, useEffect } from 'react';
import { AVAILABLE_TOPICS } from '../lib/topics';

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 1.5em;
`;

const Header = styled.h1`
  font-family: 'Lora', serif;
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 1.5em;
  color: #000;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 1em;
  margin-bottom: 1.25em;
  padding: 0 1.5em;
  
  @media (max-width: 800px) {
    display: grid;
    grid-template-columns: 1fr 1fr; 
    gap: 1em;
  }
`;

const FilterLabel = styled.label`
  display: block;
  margin-bottom: 0.3em;
  font-family: 'Lora', serif;
`;

const FilterSelect = styled.select`
  padding: 0.5em;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  font-family: 'Lora', serif;
  width: 100%;
  background: white;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5em;
  margin-top: 1em;
`;

const PageButton = styled.button`
  padding: 0.5em 1em;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  font-family: 'Lora', serif;
  font-size: 1rem;

  &:disabled {
    background: #eee;
    cursor: not-allowed;
  }
`;

const DisclaimerText = styled.p`
  color: #999;
  font-size: 0.75rem;
  text-align: center;
  margin-top: 2rem;
  font-family: 'Lora', serif;
  font-style: italic;
`;

const NoContentMessage = styled.div`
  text-align: center;
  padding: 2em;
  color: #666;
  font-family: 'Lora', serif;
  font-style: italic;
`;

const TeacherStoryBrowswer = ({ stories, onParamsSelect, onStoryBlockClick, defaultLanguage }) => {
  const [filterLanguage, setFilterLanguage] = useState(defaultLanguage);
  const [filterLevel, setFilterLevel] = useState('any');
  const [filterTopic, setFilterTopic] = useState('any');
  const [currentPage, setCurrentPage] = useState(1);
  const storiesPerPage = 6;

  useEffect(() => {
    setFilterLanguage(defaultLanguage);
  }, [defaultLanguage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    onParamsSelect(filterLanguage, filterLevel, filterTopic, newPage, storiesPerPage);
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setFilterLanguage(newLanguage);
    setCurrentPage(1);
    onParamsSelect(newLanguage, filterLevel, filterTopic, 1, storiesPerPage);
  };

  const handleLevelChange = (e) => {
    const newLevel = e.target.value;
    setFilterLevel(newLevel);
    setCurrentPage(1);
    onParamsSelect(filterLanguage, newLevel, filterTopic, 1, storiesPerPage);
  };

  const handleTopicChange = (e) => {
    const newTopic = e.target.value;
    setFilterTopic(newTopic);
    setCurrentPage(1);
    onParamsSelect(filterLanguage, filterLevel, newTopic, 1, storiesPerPage);
  };

  return (
    <Container>
      <Header>Browse Stories</Header>
      <FilterContainer>
        <div style={{ flex: 1 }}>
          <FilterLabel>Language</FilterLabel>
          <FilterSelect 
            value={filterLanguage} 
            onChange={handleLanguageChange}
          >
            <option value="any">Any Language</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
          </FilterSelect>
        </div>

        <div style={{ flex: 1 }}>
          <FilterLabel>Reading Level</FilterLabel>
          <FilterSelect 
            value={filterLevel} 
            onChange={handleLevelChange}
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
            value={filterTopic} 
            onChange={handleTopicChange}
          >
            <option value="any">Any Topic</option>
            {AVAILABLE_TOPICS.map(topic => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </FilterSelect>
        </div>
      </FilterContainer>
      
      {stories.length > 0 ? (
        <StoryList stories={stories} onStoryBlockClick={onStoryBlockClick} />
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
        Content may be AI-assisted. While we strive for accuracy, please verify important information from official sources.
      </DisclaimerText>
    </Container>
  );
};

export default TeacherStoryBrowswer;
