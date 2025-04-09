import React from 'react';
import {
  ContentBlockContainer,
  TopSection,
  DateText,
  Title,
  ContentWrapper,
  Preview,
  TagContainer,
  Tag,
  AcceptButton,
  RejectButton
} from '../styles/components/ContentBlockStyles';
import checkIcon from '../assets/icons/check.png';

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

interface TeacherContentBlockProps {
  story: Story;
  onAccept: (story: Story) => void;
  onReject: (story: Story) => void;
  status: string;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid Date";
  
  const month = date.toLocaleString('en-US', { month: 'long' });
  const day = date.getDate();
  const year = date.getFullYear();
  
  const getOrdinal = (n: number): string => {
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

const TeacherContentBlock: React.FC<TeacherContentBlockProps> = ({ 
  story, 
  onAccept, 
  onReject, 
  status 
}) => {
  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (status === 'rejected') {
      onAccept(story);
    } else {
      onReject(story);
    }
  };

  function getTag(tier: string) {
    tier = tier.toLowerCase();
    const text = String(tier).charAt(0).toUpperCase() + String(tier).slice(1);
    return (
      <span className="bg-purple-200 px-4 py-1.5 sm:rounded-full rounded-[12px] text-sm text-gray-800 flex items-center">
        {text}{" Audiobook Available"}
        <img src={checkIcon} alt="checkmark" className="ml-1 h-4 w-4 opacity-50" />
      </span>
    )
  }

  const handleClick = () => {
    const baseUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:3000'
      : 'https://squeak.today';
    const url = `${baseUrl}/read/${story.content_type}/${story.id}`;
    window.open(url, '_blank');
  };

  return (
    <ContentBlockContainer onClick={handleClick}>
      <TopSection>
        <TagContainer>
          <Tag cefr={story.cefr_level}>{story.cefr_level}</Tag>
          <Tag>{story.language}</Tag>
          <Tag>{story.topic}</Tag>
          {story.audiobook_tier && getTag(story.audiobook_tier)}
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
    </ContentBlockContainer>
  );
};

export default TeacherContentBlock; 