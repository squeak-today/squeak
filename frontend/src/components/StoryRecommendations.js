import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

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
    width: 140px;
    height: 200px;
    background: linear-gradient(
        to right,
        #f2f2f2 0%,
        white 8%,
        white 20%
    );
    border-radius: 8px;
    padding: 1em;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 5px 5px 0 rgba(0, 0, 0, 0.15);
    border: 1px solid #e0e0e0;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 8px 8px 0 rgba(0, 0, 0, 0.15);
    }
`;

const BlockTitle = styled.h3`
    font-family: 'Lora', serif;
    font-size: 1.2em;
    color: #333;
    margin: 0.75em 0;
    line-height: 1.3;
    word-wrap: break-word;
    overflow-wrap: break-word;
    width: 100%;
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

const PageCount = styled.span`
    font-size: 0.8em;
    color: #666;
    display: block;
    margin-top: 0.5em;
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

const StoryRecommendations = ({ recommendations }) => {
    const navigate = useNavigate();

    const handleClick = (story) => {
        navigate(`/read/Story/${story.id}`);
    };

    return (
        <Container>
            <Title>Recommended Stories</Title>
            <RecommendationsRow>
                {recommendations?.map((story) => (
                    <RecommendationBlock key={story.id} onClick={() => handleClick(story)}>
                        <TagContainer>
                            <Tag cefr={story.cefr_level}>{story.cefr_level}</Tag>
                            <Tag>{story.language}</Tag>
                            <Tag>{story.topic}</Tag>
                        </TagContainer>
                        <BlockTitle>{story.title}</BlockTitle>
                        <PageCount>Pages: {story.pages}</PageCount>
                    </RecommendationBlock>
                ))}
            </RecommendationsRow>
        </Container>
    );
};

export default StoryRecommendations; 