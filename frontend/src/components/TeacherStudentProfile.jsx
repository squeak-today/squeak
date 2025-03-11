import React from 'react';
import styled from 'styled-components';

// Styled components (adjust as per your design)
const ProfilesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

const ProfileCard = styled.div`
  border: 1px solid #ccc;
  padding: 1rem;
  border-radius: 5px;
  width: 300px;
`;

const ProfileTitle = styled.h2`
  font-family: 'Lora', serif;
  font-size: 1.5rem;
  margin: 0 0 1rem 0;
  color: #333;
`;

const ProfileDetail = styled.div`
  font-family: 'Lora', serif;
  font-size: 1rem;
  color: #666;
  margin-bottom: 0.5rem;
`;

const TeacherStudentProfiles = ({ profiles }) => {
  if (!profiles || profiles.length === 0) return <div>No student profiles found.</div>;

  return (
    <ProfilesContainer>
      {profiles.map((profile, index) => (
        <ProfileCard key={index}>
          <ProfileTitle>{profile.username}</ProfileTitle>
          <ProfileDetail>
            <strong>Learning Language:</strong> {profile.learning_language || 'N/A'}
          </ProfileDetail>
          <ProfileDetail>
            <strong>Skill Level:</strong> {profile.skill_level || 'N/A'}
          </ProfileDetail>
          <ProfileDetail>
            <strong>Interested Topics:</strong> {profile.interested_topics?.join(', ') || 'N/A'}
          </ProfileDetail>
          <ProfileDetail>
            <strong>Daily Questions Goal:</strong> {profile.daily_questions_goal || 'N/A'}
          </ProfileDetail>
        </ProfileCard>
      ))}
    </ProfilesContainer>
  );
};

export default TeacherStudentProfiles;