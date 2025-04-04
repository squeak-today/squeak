import React, { useState, useEffect } from 'react';
import {
  Section,
  SectionTitle,
  CurrentPlanContainer,
  PlanName,
  CurrentPlanTag,
  BillingPeriodRow,
  CancelPlanButton
} from '../../styles/components/SettingsPageStyles';
import LoadingScreen from '../LoadingScreen';
import SubscriptionDetails from './SubscriptionDetails';
import { PlansContainer } from '../../styles/components/SubscriptionDetailsStyles';
import ConfirmationModal from './ConfirmationModal';
import { useOrganizationAPI } from '../../hooks/useOrganizationAPI';
import { theme } from '../../styles/theme';

type PlanType = 'FREE' | 'CLASSROOM' | 'ENTERPRISE';

const OrganizationSettings: React.FC = () => {
  const { getOrganization, createCheckoutSession, cancelSubscriptionAtEndOfPeriod } = useOrganizationAPI();
  
  const [currentPlan, setCurrentPlan] = useState<PlanType>('FREE');
  const [expirationDate, setExpirationDate] = useState<string | null>(null);
  const [canceled, setCanceled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalConfirmColor, setModalConfirmColor] = useState('#f5f5f5');
  const [modalTextColor, setModalTextColor] = useState('#000000');
  const [modalConfirmAction, setModalConfirmAction] = useState<() => void>(() => {});
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => {
    const fetchOrganizationData = async () => {
      try {
        const result = await getOrganization();
        if (result?.data) {
          setCurrentPlan(result.data.plan as PlanType || 'FREE');
          setExpirationDate(result.data.expiration_date || null);
          setCanceled(result.data.canceled || false);
        }
      } catch (error) {
        console.error('Failed to fetch organization data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrganizationData();
  }, [getOrganization]);
  
  const formatExpirationDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  const handleClassroomPlanClick = () => {
    if (currentPlan === 'CLASSROOM') return;
    
    setModalTitle('Start a 14-day free trial.');
    setModalMessage('You can cancel at any time before the trial ends and you won\'t be charged.');
    setModalConfirmColor('#f5f5f5');
    setModalTextColor('#000000');
    setModalConfirmAction(() => handleConfirmStartTrial);
    setIsModalOpen(true);
  };
  
  const handleEnterprisePlanClick = () => {
    window.location.href = 'mailto:connor@squeak.today';
  };
  
  const handleCancelSubscription = () => {
    setModalMessage('Are you sure you want to cancel your plan? We hate to see you go :(');
    setModalConfirmColor(theme.colors.danger);
    setModalTextColor('#ffffff');
    setModalConfirmAction(() => handleConfirmCancelSubscription);
    setIsModalOpen(true);
  };
  
  const handleConfirmStartTrial = async () => {
    setIsProcessing(true);
    try {
      const { data } = await createCheckoutSession();
      if (data) {
        window.location.href = data.redirect_url;
      }
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      setIsProcessing(false);
      setIsModalOpen(false);
    }
  };
  
  const handleConfirmCancelSubscription = async () => {
    setIsProcessing(true);
    try {
      await cancelSubscriptionAtEndOfPeriod();
      window.location.reload();
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      setIsProcessing(false);
      setIsModalOpen(false);
    }
  };
  
  const closeModal = () => {
    if (!isProcessing) {
      setIsModalOpen(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Section>
          <LoadingScreen />
        </Section>
      </>
    );
  }

  return (
    <>
      <Section>
        <SectionTitle>Billing</SectionTitle>
        
        <CurrentPlanContainer>
          <PlanName>{currentPlan === 'FREE' ? 'Free' : 
                   currentPlan === 'CLASSROOM' ? 'Classroom' : 
                   'Enterprise'}</PlanName>
          <CurrentPlanTag canceled={canceled}>{canceled ? "Canceled until end of period" : "Current plan"}</CurrentPlanTag>
        </CurrentPlanContainer>
        
        <BillingPeriodRow>
          Current billing period end: {currentPlan === 'FREE' ? 'N/A' : formatExpirationDate(expirationDate)}
        </BillingPeriodRow>
      </Section>
      
      <Section>
        <SectionTitle>Available Plans</SectionTitle>
        
        <PlansContainer>
          <SubscriptionDetails
            title="Classroom"
            price={14.99}
            priceUnit="/mo"
            addOnText="Premium for every student"
            benefits={[
              "Unlimited Natural Pronunciations",
              "Unlimited Premium Speech Recognition",
              "All upcoming features (Unlimited)"
            ]}
            buttonText={currentPlan === 'CLASSROOM' ? 'Subscribed :)' : 'Start 14-day free trial'}
            onButtonClick={handleClassroomPlanClick}
            disabled={currentPlan === 'CLASSROOM'}
          />
          
          <SubscriptionDetails
            title="Squeak for School Boards"
            price={-1}
            priceUnit="/mo"
            addOnText="Built for school boards and administrators. Includes everything in Classroom, for unlimited classrooms and teachers, at better pricing per teacher. Reach out to founders@squeak.today!"
            benefits={[]}
            buttonText="Contact sales"
            onButtonClick={handleEnterprisePlanClick}
          />
        </PlansContainer>
      </Section>
      
      {currentPlan !== 'FREE' && !canceled && (
        <CancelPlanButton onClick={handleCancelSubscription}>
          Cancel Plan
        </CancelPlanButton>
      )}
      
      <ConfirmationModal
        isOpen={isModalOpen}
        title={modalTitle}
        message={modalMessage}
        onCancel={closeModal}
        onConfirm={modalConfirmAction}
        confirmButtonColor={modalConfirmColor}
        confirmButtonTextColor={modalTextColor}
        isLoading={isProcessing}
      />
    </>
  );
};

export default OrganizationSettings; 