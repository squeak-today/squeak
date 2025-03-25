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
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    
    setModalMessage('Start a 14-day free trial of the Classroom plan?');
    setModalConfirmColor('#f5f5f5');
    setModalTextColor('#000000');
    setModalConfirmAction(() => handleConfirmStartTrial);
    setIsModalOpen(true);
  };
  
  const handleEnterprisePlanClick = () => {
    console.log('Enterprise plan clicked - Contact sales');
  };
  
  const handleCancelSubscription = () => {
    setModalMessage('Are you sure you want to cancel your plan?');
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
          <CurrentPlanTag>Current plan</CurrentPlanTag>
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
            price={7.99}
            priceUnit="/teacher/mo"
            benefits={[
              "Up to 3 classrooms per teacher",
              "Unlimited audio transcriptions",
              "Unlimited Tutor conversations",
              "Unlimited news articles",
              "Unlimited stories"
            ]}
            buttonText={currentPlan === 'CLASSROOM' ? 'Subscribed :)' : 'Start 14-day free trial'}
            onButtonClick={handleClassroomPlanClick}
            disabled={currentPlan === 'CLASSROOM'}
          />
          
          <SubscriptionDetails
            title="Squeak for School Boards"
            price={-1}
            priceUnit="/mo"
            addOnText="Built for school boards and administrators. Includes everything in Classroom, for unlimited classrooms and teachers, at better pricing per teacher."
            benefits={[]}
            buttonText="Contact sales"
            onButtonClick={handleEnterprisePlanClick}
          />
        </PlansContainer>
      </Section>
      
      {currentPlan !== 'FREE' && (
        <CancelPlanButton onClick={handleCancelSubscription}>
          Cancel Plan
        </CancelPlanButton>
      )}
      
      <ConfirmationModal
        isOpen={isModalOpen}
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