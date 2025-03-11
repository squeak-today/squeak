import React from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';
import FrenchFlag from '../assets/vectors/frenchFlag.svg';
import SpanishFlag from '../assets/vectors/spanishFlag.svg';

const ProfilesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.md};
`;

const ProfileCard = styled.div`
  border-radius: 12px;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 260px;
  padding: 0;
  overflow: hidden;
`;

const ProfileHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.md} ${theme.spacing.md} ${theme.spacing.sm};
`;

const ProfileName = styled.h3`
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: ${theme.colors.text.primary};
`;

const ProfileAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${props => props.bgColor || '#673ab7'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${theme.typography.fontFamily.secondary};
  font-weight: 500;
`;

const ProfileDetails = styled.div`
  padding: 0 ${theme.spacing.md} ${theme.spacing.md};
`;

const DetailRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${theme.spacing.sm};
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: 0.9rem;
  color: ${theme.colors.text.secondary};
`;

const LanguageRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${theme.spacing.sm};
  font-family: ${theme.typography.fontFamily.secondary};
  font-size: 0.9rem;
  
  img {
    width: 20px;
    height: auto;
    margin-left: 8px;
  }
`;

const StrongLabel = styled.strong`
  margin-right: 5px;
`;

const SkillLevel = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  background-color: ${props => {
    if (props.level === 'Beginner') return theme.colors.cefr.beginner.bg;
    if (props.level === 'Intermediate') return theme.colors.cefr.intermediate.bg;
    if (props.level === 'Advanced') return theme.colors.cefr.advanced.bg;
    return theme.colors.background;
  }};
  color: ${props => {
    if (props.level === 'Beginner') return theme.colors.cefr.beginner.text;
    if (props.level === 'Intermediate') return theme.colors.cefr.intermediate.text;
    if (props.level === 'Advanced') return theme.colors.cefr.advanced.text;
    return theme.colors.text.secondary;
  }};
`;

// Array of vibrant colors for avatars
const vibrantColors = [
  '#FF5252', // Red
  '#FF4081', // Pink
  '#E040FB', // Purple
  '#7C4DFF', // Deep Purple
  '#536DFE', // Indigo
  '#448AFF', // Blue
  '#40C4FF', // Light Blue
  '#18FFFF', // Cyan
  '#64FFDA', // Teal
  '#69F0AE', // Green
  '#B2FF59', // Light Green
  '#EEFF41', // Lime
  '#FFFF00', // Yellow
  '#FFD740', // Amber
  '#FFAB40', // Orange
  '#FF6E40'  // Deep Orange
];

// Helper function to get flag based on language
const getLanguageFlag = (language) => {
  if (!language) return null;
  
  const lowerCaseLanguage = language.toLowerCase();
  if (lowerCaseLanguage.includes('french')) {
    return <img src={FrenchFlag} alt="French flag" />;
  } else if (lowerCaseLanguage.includes('spanish')) {
    return <img src={SpanishFlag} alt="Spanish flag" />;
  }
  return null;
};

// Helper function to generate initials
const getInitials = (name) => {
  return name ? name.charAt(0).toLowerCase() : '';
};

// Helper function to get a deterministic color based on username
const getAvatarColor = (username) => {
  if (!username) return vibrantColors[0];
  
  // Use the username to generate a deterministic index
  // This ensures the same user always gets the same color
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Get a positive index within the array range
  const index = Math.abs(hash) % vibrantColors.length;
  return vibrantColors[index];
};

const TeacherStudentProfiles = ({ profiles }) => {
  if (!profiles || profiles.length === 0) return <div>No student profiles found.</div>;

  return (
    <ProfilesContainer>
      {profiles.map((profile, index) => (
        <ProfileCard key={index}>
          <ProfileHeader>
            <ProfileName>{profile.username}</ProfileName>
            <ProfileAvatar bgColor={getAvatarColor(profile.username)}>
              {getInitials(profile.username)}
            </ProfileAvatar>
          </ProfileHeader>
          
          <ProfileDetails>
            <LanguageRow>
              <StrongLabel>Learning:</StrongLabel> {profile.learning_language || 'N/A'}
              {getLanguageFlag(profile.learning_language)}
            </LanguageRow>
            
            <DetailRow>
              <StrongLabel>Level:</StrongLabel> {' '}
              <SkillLevel level={profile.skill_level}>{profile.skill_level || 'N/A'}</SkillLevel>
            </DetailRow>
            
            <DetailRow>
              <StrongLabel>Topics:</StrongLabel> {profile.interested_topics?.join(', ') || 'N/A'}
            </DetailRow>
            
            <DetailRow>
              <StrongLabel>Daily Goal:</StrongLabel> {profile.daily_questions_goal || 'N/A'}
            </DetailRow>
          </ProfileDetails>
        </ProfileCard>
      ))}
    </ProfilesContainer>
  );
};

export default TeacherStudentProfiles;