import styled from 'styled-components';
import StoryBlock from './StoryBlock';

const ListContainer = styled.div`
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
	font-family: 'Lora', serif;
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
`;

const StoryList = ({ stories, onStoryBlockClick }) => {
    return (
        <ListContainer>
            {stories.map((story, index) => (
                <StoryBlock
                    key={index}
                    type={story.type}
                    title={story.title}
                    preview={story.preview}
                    tags={story.tags}
                    difficulty={story.difficulty}
                    date={story.date_created}
                    onStoryBlockClick={() => { onStoryBlockClick(story) }}
                />
            ))}
        </ListContainer>
    );
};

export default StoryList; 