import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { NoRecommendationsMessage } from '../styles/LearnPageStyles';

const Container = styled.div`
  margin-bottom: 2em;
  padding-left: 1.5em;
  padding-right: 1.5em;
  max-width: 800px;
  margin: 0 auto 2em;
`;

const Title = styled.h2`
  font-family: 'Lora', serif;
  font-weight: bold;
  font-size: 1.5em;
  margin-bottom: 1em;
  color: #333;
`;

const RecommendationsRow = styled.div`
  display: flex;
  gap: 1em;
  overflow-x: auto;
  padding-bottom: 0.5em;
`;

const RecommendationBlock = styled.div`
  min-width: 250px;
  background: white;
  border-radius: 12px;
  padding: 1em;
  cursor: pointer;
  transition: transform 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  border: 1px solid #e0e0e0;

  &:hover {
    transform: translateY(-2px);
  }
`;

const BlockTitle = styled.h3`
  font-family: 'Lora', serif;
  font-size: 1em;
  color: #333;
  margin: 0.75em 0;
`;

const TagContainer = styled.div`
  display: flex;
  gap: 0.5em;
  flex-wrap: wrap;
`;

const Tag = styled.span`
  background: ${props => props.cefr ? getCEFRColor(props.cefr) : '#E0E0E0'};
  padding: 0.3em 0.8em;
  border-radius: 12px;
  font-size: 0.75em;
  color: black;
  font-family: 'Lora', serif;
  ${props => props.cefr && 'font-weight: bold;'}
`;

const getCEFRColor = (level) => {
    const firstLetter = level.charAt(0);
    switch (firstLetter) {
        case 'C': return '#FFB3B3';
        case 'B': return '#FFD6B3';
        case 'A': return '#B3FFB3';
        default: return '#FFA07A';
    }
};

const NewsRecommendations = ({ recommendations }) => {
    const navigate = useNavigate();

    const handleClick = (story) => {
        navigate(`/read/News/${story.id}`);
    };

    return (
        <Container>
            <Title>Recommended Articles</Title>
            {recommendations?.length > 0 ? (
                <RecommendationsRow>
                    {recommendations.map((story) => (
                        <RecommendationBlock key={story.id} onClick={() => handleClick(story)}>
                            <TagContainer>
                                <Tag cefr={story.cefr_level}>{story.cefr_level}</Tag>
                                <Tag>{story.language}</Tag>
                                <Tag>{story.topic}</Tag>
                            </TagContainer>
                            <BlockTitle>{story.title}</BlockTitle>
                        </RecommendationBlock>
                    ))}
                </RecommendationsRow>
            ) : (
                <NoRecommendationsMessage>No news recommendations available!</NoRecommendationsMessage>
            )}
        </Container>
    );
};

export default NewsRecommendations; 