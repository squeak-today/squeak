import styled from 'styled-components';
import TeacherStoryBlock from './TeacherStoryBlock';

const ListContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Lora', serif;
  display: flex;
  flex-direction: column;
  gap: 1em;
`;

const TeacherStoryList = ({ stories, onAccept, onReject, status }) => {
  return (
    <ListContainer>
      {stories.map((story) => (
        <TeacherStoryBlock
          key={story.id}
          story={story}
          onAccept={onAccept}
          onReject={onReject}
          status={status}
        />
      ))}
    </ListContainer>
  );
};

export default TeacherStoryList;
