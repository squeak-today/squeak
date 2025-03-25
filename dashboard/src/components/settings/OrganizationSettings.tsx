import React from 'react';
import {
  Section,
  SectionTitle,
  CurrentPlanContainer,
  PlanName,
  CurrentPlanTag,
  BillingPeriodRow
} from '../../styles/components/SettingsPageStyles';
import SubscriptionDetails from './SubscriptionDetails';
import { PlansContainer } from '../../styles/components/SubscriptionDetailsStyles';

const OrganizationSettings: React.FC = () => {
  const handleProPlanClick = () => {
    console.log('Pro plan clicked');
  };

  const handleEnterprisePlanClick = () => {
    console.log('Enterprise plan clicked');
  };

  return (
    <>
      <Section>
        <SectionTitle>Billing</SectionTitle>
        
        <CurrentPlanContainer>
          <PlanName>Free</PlanName>
          <CurrentPlanTag>Current plan</CurrentPlanTag>
        </CurrentPlanContainer>
        
        <BillingPeriodRow>
          Current billing period end: August 31, 2025
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
            buttonText="Start 14-day free trial"
            onButtonClick={handleProPlanClick}
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
    </>
  );
};

export default OrganizationSettings; 