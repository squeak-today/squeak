import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { FaPencilAlt, FaCheck, FaTimes, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import MultiSelect from './MultiSelect';

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
`;

const UsernameSection = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
`;

const Username = styled.h1`
    font-family: 'Lora', serif;
    font-size: 2rem;
    font-weight: 500;
    color: #333;
    margin: 0;
    word-break: break-word;
    max-width: 100%;
`;

const UsernameInput = styled.input`
    font-family: 'Lora', serif;
    font-size: 2rem;
    font-weight: 500;
    color: #333;
    border: none;
    border-bottom: 2px solid #666;
    background: transparent;
    padding: 0.2rem;
    width: 200px;
    max-width: 100%;
    &:focus {
        outline: none;
    }
`;

const EditButtons = styled.div`
    display: flex;
    gap: 0.5rem;
`;

const EditButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    color: #666;
    padding: 0.5rem;
    transition: color 0.2s;
    &:hover {
        color: #333;
    }
`;

const MainSection = styled.div`
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
`;

const ProfileSection = styled.div`
    flex: 1;
    min-width: 0;
`;

const ProfileLabel = styled.div`
    font-family: 'Lora', serif;
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 0.5rem;
`;

const TagsContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 15px;
    width: 100%;
`;

const Tag = styled.span`
    background: ${props => props.$type === 'cefr' ? props.$color : '#f0f0f0'};
    padding: 6px 12px;
    border-radius: 15px;
    font-size: 0.9em;
    color: #333;
    font-family: 'Lora', serif;
`;

const StatValue = styled.div`
    font-family: 'Lora', serif;
    font-size: 1.8rem;
    color: #333;
    font-weight: 500;
    text-align: center;
`;

const StatLabel = styled.div`
    font-family: 'Lora', serif;
    font-size: 0.9rem;
    color: #666;
    text-align: center;
    margin-bottom: 0.5rem;
`;

const LoadingText = styled.div`
    font-family: 'Lora', serif;
    color: #666;
    font-size: 1rem;
`;

const Select = styled.select`
    font-family: 'Lora', serif;
    font-size: 0.9rem;
    padding: 6px 12px;
    border-radius: 15px;
    border: 1px solid #ccc;
`;

const LanguageText = styled.div`
    font-family: 'Lora', serif;
    font-size: 1.2rem;
    font-weight: 500;
    color: #333;
`;

const SubTitle = styled.div`
    font-family: 'Lora', serif;
    font-size: 1.2rem;
    color: #666;
    margin-bottom: 1rem;
`;

const GoalAdjuster = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
`;

const GoalButton = styled(EditButton)`
    padding: 0.3rem;
    &:disabled {
        color: #ccc;
        cursor: not-allowed;
    }
`;

const LevelSection = styled.div`
    margin-bottom: 1rem;
`;

const ProgressBarContainer = styled.div`
    width: 100%;
    height: 8px;
    background-color: #f0f0f0;
    border-radius: 4px;
    margin-top: 1rem;
    overflow: hidden;
`;

const ProgressBarFill = styled.div`
    height: 100%;
    background-color: ${props => props.$percentage >= 100 ? '#90EE90' : '#FFB6C1'};
    width: ${props => Math.min(props.$percentage, 100)}%;
    transition: width 0.3s ease-in-out;
`;

const ProgressText = styled.div`
    font-family: 'Lora', serif;
    font-size: 0.9rem;
    color: #666;
    text-align: center;
    margin-top: 0.5rem;
`;

const StreakTag = styled(Tag)`
    margin-bottom: 1rem;
    background: ${props => getStreakColor(props.$streak)};
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
`;

const AVAILABLE_TOPICS = [
    'Politics',
    'Business',
    'Technology',
    'Sports'
];

const getCEFRColor = (level) => {
    const firstLetter = level.charAt(0);
    switch (firstLetter) {
        case 'C': return '#FFB3B3';
        case 'B': return '#FFD6B3';
        case 'A': return '#B3FFB3';
        default: return '#FFA07A';
    }
};

const getStreakColor = (streak) => {
    if (streak === 0) return '#f0f0f0';
    if (streak >= 60) return '#FFB3B3';
    if (streak >= 20) return '#FFD6B3';
    if (streak >= 5) return '#B3FFB3';
    return '#f0f0f0';
};

const ProfileDashboard = ({ profile, progress, onGetProfile, onUpdateProfile }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedUsername, setEditedUsername] = useState('');
    const [editedLanguage, setEditedLanguage] = useState('');
    const [editedLevel, setEditedLevel] = useState('');
    const [editedGoal, setEditedGoal] = useState(0);
    const [editedTopics, setEditedTopics] = useState([]);

    useEffect(() => {
        if (profile) {
            setEditedUsername(profile.username);
            setEditedLanguage(profile.learning_language);
            setEditedLevel(profile.skill_level);
            setEditedGoal(profile.daily_questions_goal);
            setEditedTopics(profile.interested_topics || []);
        }
    }, [profile]);

    if (!profile) {
        return <LoadingText>Loading profile...</LoadingText>;
    }

    const handleTopicToggle = (topic) => {
        setEditedTopics(prev => {
            if (prev.includes(topic)) {
                return prev.filter(t => t !== topic);
            }
            return [...prev, topic];
        });
    };

    const handleSave = async () => {
        const updatedProfile = {
            ...profile,
            username: editedUsername,
            learning_language: editedLanguage,
            skill_level: editedLevel,
            daily_questions_goal: editedGoal,
            interested_topics: editedTopics
        };

        const result = await onUpdateProfile(updatedProfile);
        if (result?.error === "Username already taken") {
            return; // error notif is handled by the onUpdateProfile
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedUsername(profile.username);
        setEditedLanguage(profile.learning_language);
        setEditedLevel(profile.skill_level);
        setEditedGoal(profile.daily_questions_goal);
        setEditedTopics(profile.interested_topics || []);
        setIsEditing(false);
    };

    const adjustGoal = (increment) => {
        const newGoal = editedGoal + increment;
        if (newGoal >= 0 && newGoal <= 20) {
            setEditedGoal(newGoal);
        }
    };

    return (
        <div>
            <SubTitle>Your Profile</SubTitle>
            <Header>
                <UsernameSection>
                    {isEditing ? (
                        <UsernameInput
                            value={editedUsername}
                            onChange={(e) => setEditedUsername(e.target.value)}
                        />
                    ) : (
                        <Username>{profile.username}</Username>
                    )}
                    {!isEditing && (
                        <Tag $type="cefr" $color={getCEFRColor(profile.skill_level)}>
                            {profile.skill_level}
                        </Tag>
                    )}
                </UsernameSection>
                <EditButtons>
                    {isEditing ? (
                        <>
                            <EditButton onClick={handleSave} title="Save">
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
            </Header>

            {isEditing && (
                <LevelSection>
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
                </LevelSection>
            )}

            <StreakTag $streak={progress?.streak || 0}>
                {progress?.streak || 0} day streak!
            </StreakTag>

            <MainSection>
                <ProfileSection>
                    <ProfileLabel>Learning</ProfileLabel>
                    {isEditing ? (
                        <Select
                            value={editedLanguage}
                            onChange={(e) => setEditedLanguage(e.target.value)}
                        >
                            <option value="French">French</option>
                            <option value="Spanish">Spanish</option>
                        </Select>
                    ) : (
                        <LanguageText>{profile.learning_language}</LanguageText>
                    )}
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

            <StatLabel>Daily Goal</StatLabel>
            {isEditing ? (
                <GoalAdjuster>
                    <GoalButton 
                        onClick={() => adjustGoal(-1)} 
                        disabled={editedGoal <= 1}
                    >
                        <FaChevronUp />
                    </GoalButton>
                    <StatValue>{editedGoal} questions</StatValue>
                    <GoalButton 
                        onClick={() => adjustGoal(1)} 
                        disabled={editedGoal >= 20}
                    >
                        <FaChevronDown />
                    </GoalButton>
                </GoalAdjuster>
            ) : (
                <StatValue>{profile.daily_questions_goal} questions</StatValue>
            )}

            {progress && (
                <>
                    <ProgressBarContainer>
                        <ProgressBarFill 
                            $percentage={(progress.questions_completed / profile.daily_questions_goal) * 100} 
                        />
                    </ProgressBarContainer>
                    <ProgressText>
                        {progress.questions_completed} of {profile.daily_questions_goal} completed
                    </ProgressText>
                </>
            )}
        </div>
    );
};

export default ProfileDashboard; 