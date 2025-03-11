import {
  StoryBlockContainer,
  TopSection,
  DateText,
  Title,
  ContentWrapper,
  Preview,
  TagContainer,
  Tag,
  AcceptButton,
  RejectButton
} from '../styles/components/TeacherStoryBlockStyles';
import { useNavigate } from 'react-router-dom';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date)) return "Invalid Date";
  const month = date.toLocaleString('en-US', { month: 'long' });
  const day = date.getDate();
  const year = date.getFullYear();
  const getOrdinal = (n) => {
    if (n > 3 && n < 21) return 'th';
    switch (n % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };
  return `${month} ${day}${getOrdinal(day)}, ${year}`;
};

const TeacherStoryBlock = ({ story, onAccept, onReject, status }) => {
  const navigate = useNavigate();

  const handleAction = (e) => {
    e.stopPropagation();
    if (status === 'rejected') {
      onAccept(story);
    } else {
      onReject(story);
    }
  };

  const handleClick = (story) => {
    navigate(`/read/${story.content_type}/${story.id}`, {
        state: {
            backTo: '/teacher',
            backText: 'Back to Teacher Dashboard'
        }
    });
  };

  // Expect story properties: title, preview_text, language, topic, cefr_level, date_created
  return (
    <StoryBlockContainer onClick={() => handleClick(story)}>
      <TopSection>
        <TagContainer>
          <Tag cefr={story.cefr_level}>{story.cefr_level}</Tag>
          <Tag>{story.language}</Tag>
          <Tag>{story.topic}</Tag>
        </TagContainer>
        <DateText>{formatDate(story.date_created)}</DateText>
      </TopSection>
      <Title>{story.title}</Title>
      <ContentWrapper>
        <Preview>{story.preview_text}</Preview>
      </ContentWrapper>
      {status === 'rejected' ? (
        <AcceptButton onClick={handleAction}>
          Accept
        </AcceptButton>
      ) : (
        <RejectButton onClick={handleAction}>
          Reject
        </RejectButton>
      )}
    </StoryBlockContainer>
  );
};

export default TeacherStoryBlock;
