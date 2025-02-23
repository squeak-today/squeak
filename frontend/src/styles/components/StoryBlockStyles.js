import styled from 'styled-components';

export const StoryBlockContainer = styled.div`
  background: white;
  border-radius: 15px;
  padding: 1.25em 1.25em 1em;
  margin: 1.25em 0;
  cursor: pointer;
  transition: transform 0.2s;
  font-family: 'Lora', serif;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  border: 1px solid #e0e0e0;

  &:hover {
    transform: translateY(-2px);
  }
`;

export const TopSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 500px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5em;
  }
`;

export const DateText = styled.div`
  color: #888;
  font-size: 0.875em;
  text-align: right;
  padding-right: 0.5em;

  @media (max-width: 500px) {
    text-align: left;
    padding-right: 0;
    margin-top: 0.5em;
  }
`;

export const Title = styled.h2`
  margin: 1em 0 0.625em 0;
  font-size: 1.25em;
  color: #333;
  font-family: 'Lora', serif;
`;

export const ContentWrapper = styled.div`
  margin-right: 0;
  margin-top: 0.5em;
  padding-right: 0.5em;
`;

export const Preview = styled.p`
  color: #666;
  font-size: 0.875em;
  font-family: 'Lora', serif;
`;

export const TagContainer = styled.div`
  display: flex;
  gap: 0.625em;
  font-family: 'Lora', serif;
  flex-wrap: wrap;
`;

export const Tag = styled.span`
  background: ${props => props.cefr ? getCEFRColor(props.cefr) : '#E0E0E0'};
  padding: 0.4em 1em;
  border-radius: 15px;
  font-size: 0.875em;
  color: black;
  font-family: 'Lora', serif;
  ${props => props.cefr && 'font-weight: bold;'}
`;

// For TeacherStoryBlock only
export const AcceptButton = styled.button`
  position: absolute;
  bottom: 1em;
  right: 1em;
  background-color: rgba(250, 212, 143, 0.5);
  color: black;
  border: none;
  border-radius: 6px;
  padding: 0.5em 1em;
  font-family: 'Lora', serif;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #e0a700;
  }
`;

// Helper function used by Tag component
export const getCEFRColor = (level) => {
  const firstLetter = level.charAt(0);
  switch (firstLetter) {
    case 'C':
      return '#FFB3B3'; // pastel red
    case 'B':
      return '#FFD6B3'; // pastel orange
    case 'A':
      return '#B3FFB3'; // pastel green
    default:
      return '#FFA07A'; // default color
  }
}; 