import { useState, useEffect } from 'react';
import { FaPencilAlt, FaCheck, FaTimes, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import spanishFlag from '../assets/flags/spanish.png';
import frenchFlag from '../assets/flags/french.png';
import NavPage from '../components/NavPage';
import MultiSelect from '../components/MultiSelect';
import { AVAILABLE_TOPICS } from '../lib/topics';
import { useProfileAPI } from '../hooks/useProfileAPI';
import { useProgressAPI } from '../hooks/useProgressAPI';
import { useTeacherAPI } from '../hooks/useTeacherAPI';
import { useStudentAPI } from '../hooks/useStudentAPI';
import { useNotification } from '../context/NotificationContext';
import { theme } from '../styles/theme';
import {
  ProfileContainer,
  SubTitle,
  Header,
  UsernameSection,
  Username,
  UsernameInput,
  EditButtons,
  EditButton,
  MainSection,
  ProfileSection,
  ProfileLabel,
  TagsContainer,
  Tag,
  Select,
  ProgressBarContainer,
  ProgressBarFill,
  ProgressText,
  StatValue,
  StatLabel,
  GoalAdjuster,
  ActionButton,
  ActionButtonsContainer,
  StreakContainer,
  StreakValue,
  StreakLabel,
  StreakMessage,
  BannerContainer,
  BannerFlag,
  BannerOverlay
} from '../styles/pages/ProfilePageStyles';

type ProfileData = {
  username: string;
  learning_language: string;
  skill_level: string;
  daily_questions_goal?: number;
  interested_topics: string[];
}

type ProgressData = {
  questions_completed: number;
  goal_met: boolean;
  streak: number;
  completed_today: boolean;
}

type CEFRLevel = 'A' | 'B' | 'C';

const getCEFRColor = (level: string) => {
  const firstLetter = level.charAt(0) as CEFRLevel;
  return theme.colors.cefr[firstLetter].bg;
};

const getLanguageBackground = (language: string) => {
  switch (language) {
    case 'Spanish':
      return theme.colors.languages.spanish.bg;
    case 'French':
      return theme.colors.languages.french.bg;
    default:
      return theme.colors.border;
  }
};

function Profile() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [isTeacher, setIsTeacher] = useState(false);
  const [isStudent, setIsStudent] = useState(false);
  
  const [editedUsername, setEditedUsername] = useState('');
  const [editedLanguage, setEditedLanguage] = useState('');
  const [editedLevel, setEditedLevel] = useState('');
  const [editedGoal, setEditedGoal] = useState(0);
  const [editedTopics, setEditedTopics] = useState<string[]>([]);

  const { getProfile, upsertProfile } = useProfileAPI();
  const { getProgress, getStreak } = useProgressAPI();
  const { verifyTeacher } = useTeacherAPI();
  const { getStudentStatus } = useStudentAPI();
  const { showNotification } = useNotification();

  const checkTeacherStatus = async () => {
    try {
      const data = await verifyTeacher();
      setIsTeacher(data.exists);
    } catch (error) {
      console.error('Error checking teacher status:', error);
      setIsTeacher(false);
    }
  };

  const checkStudentStatus = async () => {
    try {
      const data = await getStudentStatus();
      setIsStudent(data.classroom_id !== "");
    } catch (error) {
      console.error('Error checking student status:', error);
      setIsStudent(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const [progressData, streakData] = await Promise.all([
        getProgress(),
        getStreak()
      ]);

      setProgress({
        questions_completed: progressData?.questions_completed || 0,
        goal_met: progressData?.goal_met || false,
        streak: streakData?.streak || 0,
        completed_today: streakData?.completed_today || false
      });
      
      return progressData;
    } catch (error) {
      console.error('Error fetching progress and/or streak:', error);
      showNotification('Failed to load progress and/or streak. Please try again.', 'error');
      setProgress({
        questions_completed: 0,
        goal_met: false,
        streak: 0,
        completed_today: false
      });
    }
  };

  const handleGetProfile = async () => {
    try {
      const data = await getProfile();
      setProfile(data as ProfileData);
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      showNotification('Failed to load profile. Please try again.', 'error');
      return null;
    }
  };

  const handleUpdateProfile = async () => {
    if (!profile) return;

    const updatedProfile = {
      ...profile,
      username: editedUsername,
      learning_language: editedLanguage,
      skill_level: editedLevel,
      daily_questions_goal: editedGoal,
      interested_topics: editedTopics
    };

    try {
      const result = await upsertProfile(updatedProfile);
      if ('error' in result && result.error === "Username already taken") {
        showNotification('Username already taken. Please try again.', 'error');
        return;
      }
      setProfile(updatedProfile);
      await fetchProgress();
      showNotification('Profile updated successfully!', 'success');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification('Failed to update profile. Please try again.', 'error');
    }
  };

  const handleCancel = () => {
    if (!profile) return;
    
    setEditedUsername(profile.username);
    setEditedLanguage(profile.learning_language);
    setEditedLevel(profile.skill_level);
    setEditedGoal(profile.daily_questions_goal || 0);
    setEditedTopics(profile.interested_topics || []);
    setIsEditing(false);
  };

  const handleTopicToggle = (topic: string) => {
    setEditedTopics(prev => {
      if (prev.includes(topic)) {
        return prev.filter(t => t !== topic);
      }
      return [...prev, topic];
    });
  };

  const adjustGoal = (increment: number) => {
    const newGoal = editedGoal + increment;
    if (newGoal >= 0 && newGoal <= 20) {
      setEditedGoal(newGoal);
    }
  };

  const getLanguageFlag = (language: string) => {
    switch (language) {
      case 'Spanish':
        return spanishFlag;
      case 'French':
        return frenchFlag;
      default:
        return null;
    }
  };

  useEffect(() => {
    const initializeProfile = async () => {
      const profileData = await handleGetProfile();
      if (profileData) {
        setEditedUsername(profileData.username);
        setEditedLanguage(profileData.learning_language);
        setEditedLevel(profileData.skill_level);
        setEditedGoal(profileData.daily_questions_goal || 0);
        setEditedTopics(profileData.interested_topics || []);
      }
      await Promise.all([
        fetchProgress(),
        checkTeacherStatus(),
        checkStudentStatus()
      ]);
      setIsLoading(false);
    };

    initializeProfile();
  }, []);

  if (!profile) {
    return (
      <NavPage isLoading={isLoading} initialActiveNav="profile">
        <ProfileContainer>
          <div>Loading profile...</div>
        </ProfileContainer>
      </NavPage>
    );
  }

  const renderGoalEditor = () => (
    <GoalAdjuster>
      <EditButton 
        onClick={() => adjustGoal(-1)} 
        $disabled={editedGoal < 1}
      >
        <FaChevronDown />
      </EditButton>
      <StatValue>{editedGoal} questions</StatValue>
      <EditButton 
        onClick={() => adjustGoal(1)} 
        $disabled={editedGoal > 20}
      >
        <FaChevronUp />
      </EditButton>
    </GoalAdjuster>
  );

  const renderProgressBar = () => {
    if (!progress || !profile.daily_questions_goal) return null;
    
    const percentage = (progress.questions_completed / profile.daily_questions_goal) * 100;
    const completed = progress.questions_completed >= profile.daily_questions_goal;

    return (
      <>
        <ProgressBarContainer>
          <ProgressBarFill 
            $completed={completed}
            $percentage={percentage}
          />
        </ProgressBarContainer>
        <ProgressText>
          {progress.questions_completed} of {profile.daily_questions_goal} completed
        </ProgressText>
      </>
    );
  };

  return (
    <NavPage isLoading={isLoading} initialActiveNav="profile">
      <ProfileContainer>
        {profile?.learning_language && (
          <BannerContainer style={{ background: getLanguageBackground(profile.learning_language) }}>
            {getLanguageFlag(profile.learning_language) && (
              <BannerFlag 
                src={getLanguageFlag(profile.learning_language)!} 
                alt={`${profile.learning_language} flag`}
              />
            )}
            <BannerOverlay>
              <UsernameSection>
                {isEditing ? (
                  <UsernameInput
                    value={editedUsername}
                    onChange={(e) => setEditedUsername(e.target.value)}
                  />
                ) : (
                  <Username>{profile.username}</Username>
                )}
                <Tag $type="cefr" $color={getCEFRColor(profile.skill_level)}>
                  {profile.skill_level}
                </Tag>
                {isTeacher && <Tag $type="teacher">Teacher</Tag>}
              </UsernameSection>
              <EditButtons>
                {isEditing ? (
                  <>
                    <EditButton onClick={handleUpdateProfile} title="Save">
                      <FaCheck />
                    </EditButton>
                    <EditButton onClick={handleCancel} title="Cancel">
                      <FaTimes />
                    </EditButton>
                  </>
                ) : (
                  <EditButton onClick={() => setIsEditing(true)} title="Edit">
                    <FaPencilAlt />
                  </EditButton>
                )}
              </EditButtons>
            </BannerOverlay>
          </BannerContainer>
        )}

        {isEditing && (
          <ProfileSection>
            <div style={{ display: 'flex', gap: theme.spacing.md }}>
              <div style={{ flex: 1 }}>
                <ProfileLabel>Language</ProfileLabel>
                <Select
                  value={editedLanguage}
                  onChange={(e) => setEditedLanguage(e.target.value)}
                >
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                </Select>
              </div>
              <div style={{ flex: 1 }}>
                <ProfileLabel>Skill Level</ProfileLabel>
                <Select
                  value={editedLevel}
                  onChange={(e) => setEditedLevel(e.target.value)}
                >
                  <option value="A1">A1 (Beginner)</option>
                  <option value="A2">A2 (Elementary)</option>
                  <option value="B1">B1 (Intermediate)</option>
                  <option value="B2">B2 (Upper Intermediate)</option>
                  <option value="C1">C1 (Advanced)</option>
                  <option value="C2">C2 (Proficient)</option>
                </Select>
              </div>
            </div>
          </ProfileSection>
        )}

        <MainSection>
          <ProfileSection>
            <StreakContainer>
              <StreakMessage>
                {(progress?.streak || 0) === 0 ? 'Exciting!' : 'Keep Going!'}
              </StreakMessage>
              <StreakValue>{progress?.streak || 0} days</StreakValue>
              <StreakLabel>Current Streak</StreakLabel>
            </StreakContainer>
          </ProfileSection>

          <ProfileSection>
            <ProfileLabel>Interested In</ProfileLabel>
            {isEditing ? (
              <MultiSelect
                options={AVAILABLE_TOPICS}
                selected={editedTopics}
                onToggle={handleTopicToggle}
              />
            ) : (
              <TagsContainer>
                {profile.interested_topics?.map((topic, index) => (
                  <Tag key={index}>{topic}</Tag>
                ))}
              </TagsContainer>
            )}
          </ProfileSection>
        </MainSection>

        <MainSection>
          <ProfileSection>
            <div style={{ textAlign: 'center' }}>
              <ProfileLabel>Daily Goal</ProfileLabel>
              {isEditing ? renderGoalEditor() : (
                <StatValue>{profile.daily_questions_goal} questions</StatValue>
              )}
            </div>
            {renderProgressBar()}
          </ProfileSection>

          <ProfileSection>
            <ActionButtonsContainer>
              <ActionButton 
                onClick={() => navigate('/teacher')}
                $disabled={!isTeacher && isStudent}
              >
                Teacher Dashboard
              </ActionButton>
              <ActionButton 
                onClick={() => navigate('/student/become')}
                $disabled={isStudent || isTeacher}
              >
                Join Classroom
              </ActionButton>
            </ActionButtonsContainer>
          </ProfileSection>
        </MainSection>
      </ProfileContainer>
    </NavPage>
  );
}

export default Profile; 