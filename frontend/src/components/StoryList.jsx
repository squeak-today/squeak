import styled from 'styled-components';
import ContentBlock from './ContentBlock';
import { useNavigate } from 'react-router-dom';

const ListContainer = styled.div`
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: 'Lora', serif;
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
`;

const StoryList = ({ stories }) => {
    const navigate = useNavigate();

    const handleContentBlockClick = async (story) => {
        navigate(`/read/${story.type}/${story.id}`);
    }

    return (
        <ListContainer>
            {stories.map((story, index) => (
                <ContentBlock
                    key={index}
                    title={story.title}
                    preview={story.preview}
                    tags={story.tags}
                    difficulty={story.difficulty}
                    date={story.date_created}
                    onContentBlockClick={() => { handleContentBlockClick(story) }}
                />
            ))}
        </ListContainer>
    );
};

export default StoryList; 