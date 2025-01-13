import styled from 'styled-components';
import StoryBlock from './StoryBlock';

const ListContainer = styled.div`
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: 'Noto Serif', serif;
`;

const StoryList = ({ stories }) => {
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
                />
            ))}
        </ListContainer>
    );
};

export default StoryList; 