import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPencilAlt, FaCheck, FaTimes, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import spanishFlag from '../assets/flags/spanish.png';
import frenchFlag from '../assets/flags/french.png';
import NavPage from '../components/NavPage';
import MultiSelect from '../components/MultiSelect';
import SubscriptionModal from '../components/SubscriptionModal';
import SubscriptionDetails from '../components/SubscriptionDetails';
import { AVAILABLE_TOPICS } from '../lib/topics';
import { useProfileAPI } from '../hooks/useProfileAPI';
import { useProgressAPI } from '../hooks/useProgressAPI';
import { useTeacherAPI } from '../hooks/useTeacherAPI';
import { useNotification } from '../context/NotificationContext';
import { useBillingAPI } from '../hooks/useBillingAPI';
import { usePlatform } from '../context/PlatformContext';
import { theme } from '../styles/theme';
import {
  MenuContainer,
  ProfileContainer,
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
  GoalAdjuster,
  StreakContainer,
  StreakValue,
  StreakLabel,
  StreakMessage,
  BannerContainer,
  BannerFlag,
  BannerOverlay,
  FormRow,
  FormColumn,
  BillingContainer,
  PremiumTitle,
  PremiumSubtitle,
  PremiumButton,
  SubscriptionHeader,
  SubscriptionTitle,
  CancelSubscriptionTitle,
  SubscriptionPlansContainer,
  ConfirmationContainer,
  CancelSubscriptionText,
  ButtonsContainer,
  ActionButton,
  PlanValue,
  UsageLimitContainer,
  UsageLimitTitle,
  UsageLimitItem,
  UsageLimitLabel,
  UsageLimitBarContainer,
  UsageLimitBarWrapper,
  UsageLimitBarFill,
  UsageLimitValue,
  UsageLimitUnlimited,
  NoteText
} from '../styles/pages/ProfilePageStyles';
import { getCEFRColor } from '../lib/cefr';
import {
  PlanSection,
  PlanSectionTitle,
  PlanName,
  CanceledTag
} from '../styles/components/PlanComponentStyles';

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

type BillingAccountData = {
  plan: string;
  expiration: string;
  canceled: boolean;
}

type UsageData = {
  natural_tts_usage: number;
  max_natural_tts_usage: number;
  premium_stt_usage: number;
  max_premium_stt_usage: number;
}

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

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

function Profile() {
  const navigate = useNavigate();
  const { getPremium } = useParams<{ getPremium?: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [isTeacher, setIsTeacher] = useState(false);
  const { isStudent, organizationPlan } = usePlatform();
  const [billingAccount, setBillingAccount] = useState<BillingAccountData | null>(null);
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  
  const [editedUsername, setEditedUsername] = useState('');
  const [editedLanguage, setEditedLanguage] = useState('');
  const [editedLevel, setEditedLevel] = useState('');
  const [editedGoal, setEditedGoal] = useState(0);
  const [editedTopics, setEditedTopics] = useState<string[]>([]);
  
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isCancellationConfirmation, setIsCancellationConfirmation] = useState(false);
  const [isCancellingSubscription, setIsCancellingSubscription] = useState(false);

  const { getProfile, upsertProfile } = useProfileAPI();
  const { getProgress, getStreak } = useProgressAPI();
  const { verifyTeacher } = useTeacherAPI();
  const { showNotification } = useNotification();
  const { getBillingAccount, getBillingAccountUsage, createCheckoutSession, cancelSubscriptionAtEndOfPeriod } = useBillingAPI();

  const checkTeacherStatus = async () => {
    try {
      const data = await verifyTeacher();
      setIsTeacher(data.exists);
    } catch (error) {
      console.error('Error checking teacher status:', error);
      setIsTeacher(false);
    }
  };

  const fetchBillingAccount = async () => {
    try {
      const result = await getBillingAccount();
      if (result.data) {
        setBillingAccount(result.data as BillingAccountData);
        return result.data;
      }
    } catch (error) {
      console.error('Error fetching billing account:', error);
      showNotification('Failed to load subscription information.', 'error');
    }
    return null;
  };

  const fetchUsageData = async (plan: string) => {
    try {
      const result = await getBillingAccountUsage({ plan });
      if (result.data) {
        setUsageData(result.data as UsageData);
      }
    } catch (error) {
      console.error('Error fetching usage data:', error);
      showNotification('Failed to load usage information.', 'error');
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
      const { data } = await getProfile();
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

  const handleOpenSubscriptionModal = () => {
    setIsCancellationConfirmation(false);
    setIsSubscriptionModalOpen(true);
  };
  
  const handleCloseSubscriptionModal = () => {
    if (getPremium === 'get-premium') {
      navigate('/profile');
      setIsSubscriptionModalOpen(false);
      setIsCancellationConfirmation(false);
    } else {
      setIsSubscriptionModalOpen(false);
      setIsCancellationConfirmation(false);
    }
  };
  
  const handleGetPremium = async () => {
    try {
      setIsProcessingPayment(true);
      const result = await createCheckoutSession({});
      if (result.data && result.data.redirect_url) {
        window.location.href = result.data.redirect_url;
      } else {
        showNotification('Failed to create checkout session', 'error');
        setIsProcessingPayment(false);
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      showNotification('Failed to create checkout session', 'error');
      setIsProcessingPayment(false);
    }
  };

  const handleShowCancellationConfirmation = () => {
    setIsCancellationConfirmation(true);
    setIsSubscriptionModalOpen(true);
  };

  const handleCancelSubscription = async () => {
    try {
      setIsCancellingSubscription(true);
      await cancelSubscriptionAtEndOfPeriod({});
      await fetchBillingAccount();
      showNotification('Your subscription has been canceled and will end at the current billing period.', 'success');
      setIsCancellingSubscription(false);
      setIsSubscriptionModalOpen(false);
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      showNotification('Failed to cancel subscription', 'error');
      setIsCancellingSubscription(false);
    }
  };
  
  const renderSubscriptionContent = () => {
    if (isCancellationConfirmation) {
      return (
        <ConfirmationContainer>
          <CancelSubscriptionTitle>Cancel Subscription</CancelSubscriptionTitle>
          <CancelSubscriptionText>
            Are you sure you want to cancel your Premium subscription? 
            You'll continue to have access until the end of your billing period on {formatDate(billingAccount?.expiration)}.
          </CancelSubscriptionText>
          <ButtonsContainer>
            <ActionButton 
              $variant="secondary" 
              onClick={handleCloseSubscriptionModal}
              disabled={isCancellingSubscription}
            >
              Keep Subscription
            </ActionButton>
            <ActionButton 
              $variant="danger" 
              onClick={handleCancelSubscription}
              disabled={isCancellingSubscription}
            >
              {isCancellingSubscription ? "Processing..." : "Confirm Cancellation"}
            </ActionButton>
          </ButtonsContainer>
        </ConfirmationContainer>
      );
    }
    
    const freeBenefits = [
      '20 Natural Pronunciations',
      '20 Premium Speech Recognition calls',
      '2 Squeak Tutor sessions (coming soon!)',
    ];
    
    const premiumBenefits = [
      'Unlimited Natural Pronunciations',
      'Unlimited Premium Speech Recognition calls',
      'Unlimited Squeak Tutor sessions (coming soon!)',
    ];
    
    return (
      <>
        <SubscriptionHeader>
          <SubscriptionTitle>Learn better with Squeak Premium</SubscriptionTitle>
        </SubscriptionHeader>
        
        <SubscriptionPlansContainer>
          <SubscriptionDetails
            title="Free"
            price={0}
            priceUnit="/month"
            benefits={freeBenefits}
            buttonText="Current Plan"
            onButtonClick={() => {}}
            disabled={true}
          />
          
          <SubscriptionDetails
            title="Premium"
            price={0.99}
            priceUnit="/month"
            addOnText="Every upcoming feature without limits (for a dollar). Try free for 7 days."
            benefits={premiumBenefits}
            buttonText={isProcessingPayment ? "Processing..." : "GET PREMIUM"}
            onButtonClick={handleGetPremium}
            disabled={isProcessingPayment}
            noteText="*Cancel anytime before your trial ends to avoid being charged."
          />
        </SubscriptionPlansContainer>
      </>
    );
  };

  const renderUsageLimitPanel = () => {
    const isPremium = billingAccount?.plan === 'PREMIUM';
    
    if (!usageData) {
      return null;
    }

    return (
      <BillingContainer>
        <UsageLimitTitle>Feature Usage</UsageLimitTitle>
        
        <UsageLimitContainer>
          <UsageLimitItem>
            <UsageLimitLabel>Natural Text-to-Speech</UsageLimitLabel>
            <UsageLimitBarContainer>
              {isPremium ? (
                <>
                  <UsageLimitBarWrapper>
                    <UsageLimitBarFill 
                      $percentage={100} 
                      $atLimit={false}
                    />
                  </UsageLimitBarWrapper>
                  <UsageLimitUnlimited>Unlimited</UsageLimitUnlimited>
                </>
              ) : (
                <>
                  <UsageLimitBarWrapper>
                    <UsageLimitBarFill 
                      $percentage={(usageData.natural_tts_usage / usageData.max_natural_tts_usage) * 100} 
                      $atLimit={usageData.natural_tts_usage >= usageData.max_natural_tts_usage}
                    />
                  </UsageLimitBarWrapper>
                  <UsageLimitValue>
                    {usageData.natural_tts_usage}/{usageData.max_natural_tts_usage}
                  </UsageLimitValue>
                </>
              )}
            </UsageLimitBarContainer>
          </UsageLimitItem>
          
          <UsageLimitItem>
            <UsageLimitLabel>Premium Speech Recognition</UsageLimitLabel>
            <UsageLimitBarContainer>
              {isPremium ? (
                <>
                  <UsageLimitBarWrapper>
                    <UsageLimitBarFill 
                      $percentage={100} 
                      $atLimit={false}
                    />
                  </UsageLimitBarWrapper>
                  <UsageLimitUnlimited>Unlimited</UsageLimitUnlimited>
                </>
              ) : (
                <>
                  <UsageLimitBarWrapper>
                    <UsageLimitBarFill 
                      $percentage={(usageData.premium_stt_usage / usageData.max_premium_stt_usage) * 100} 
                      $atLimit={usageData.premium_stt_usage >= usageData.max_premium_stt_usage}
                    />
                  </UsageLimitBarWrapper>
                  <UsageLimitValue>
                    {usageData.premium_stt_usage}/{usageData.max_premium_stt_usage}
                  </UsageLimitValue>
                </>
              )}
            </UsageLimitBarContainer>
          </UsageLimitItem>
        </UsageLimitContainer>
      </BillingContainer>
    );
  };

  const renderBillingSection = () => {
    if (!billingAccount || billingAccount.plan === 'FREE') {
      return (
        <BillingContainer>
          <PremiumTitle>Squeak Premium</PremiumTitle>
          <PremiumSubtitle>All features, unlimited usage. Try free for 7 days.</PremiumSubtitle>
          <PremiumButton onClick={handleOpenSubscriptionModal}>GET PREMIUM</PremiumButton>
          {organizationPlan === 'CLASSROOM' && <NoteText>
            {isStudent ? "Premium is already provided by your teacher!" : "Premium is already provided by your organization!"}
          </NoteText>}
          {organizationPlan === 'FREE' && <NoteText>
            {isStudent ? "Ask your teacher for class-wide premium!" : "If you're an admin with your organization, you can also get premium for everyone!"}
          </NoteText>}
        </BillingContainer>
      );
    }
    
    return (
      <BillingContainer>
        <PremiumTitle>Your Subscription</PremiumTitle>
        
        <PlanSection>
          <PlanSectionTitle>Plan</PlanSectionTitle>
          <PlanName>
            Premium
            {billingAccount.canceled && (
              <CanceledTag>Canceled</CanceledTag>
            )}
          </PlanName>
        </PlanSection>
        
        <PlanSection>
          <PlanSectionTitle>Billing Period End</PlanSectionTitle>
          <PlanValue>{formatDate(billingAccount.expiration)}</PlanValue>
        </PlanSection>
        
        {!billingAccount.canceled && (
          <ActionButton 
            $variant="secondary" 
            onClick={handleShowCancellationConfirmation}
          >
            Cancel Subscription
          </ActionButton>
        )}

        {organizationPlan === 'CLASSROOM' && <NoteText>
          {isStudent ? "Premium is already provided by your teacher!" + organizationPlan : "Premium is already provided by your organization!"}
        </NoteText>}
        {organizationPlan === 'FREE' && <NoteText>
          {isStudent ? "Since you are in a student, try asking your teacher for premium for the whole class!" : "If you're an admin with your organization, you can also get premium for everyone!"}
        </NoteText>}

      </BillingContainer>
    );
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
      
      const billingData = await fetchBillingAccount();
      
      await Promise.all([
        fetchProgress(),
        checkTeacherStatus(),
        fetchUsageData(billingData?.plan || 'FREE')
      ]);
      
      setIsLoading(false);
    };

    initializeProfile();
  }, []);

  useEffect(() => {
    if (getPremium === 'get-premium' && billingAccount?.plan === 'FREE') {
      setIsCancellationConfirmation(false);
      setIsSubscriptionModalOpen(true);
    }
  }, [getPremium, billingAccount]);

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
      <MenuContainer>
      <ProfileContainer $width="60%">
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
            <FormRow>
              <FormColumn>
                <ProfileLabel>Language</ProfileLabel>
                <Select
                  value={editedLanguage}
                  onChange={(e) => setEditedLanguage(e.target.value)}
                >
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                </Select>
              </FormColumn>
              <FormColumn>
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
              </FormColumn>
            </FormRow>
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
                fullWidth={true}
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
        </MainSection>
      </ProfileContainer>
      <ProfileContainer $width="40%">
        {renderBillingSection()}
        {renderUsageLimitPanel()}
      </ProfileContainer>
      </MenuContainer>
      
      <SubscriptionModal 
        width={isCancellationConfirmation ? "50%" : "80%"}
        isOpen={isSubscriptionModalOpen}
        onClose={handleCloseSubscriptionModal}
      >
        {renderSubscriptionContent()}
      </SubscriptionModal>
    </NavPage>
  );
}

export default Profile; 