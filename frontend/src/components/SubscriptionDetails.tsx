import React from 'react';
import checkIcon from '../assets/icons/check.png';
import {
  SubscriptionCard,
  PlanTitle,
  PriceContainer,
  Price,
  PriceUnit,
  AddOnText,
  BenefitsList,
  BenefitItem,
  ActionButton
} from '../styles/components/SubscriptionDetailsStyles';

interface SubscriptionDetailsProps {
  title: string;
  price: number;
  priceUnit?: string;
  addOnText?: string;
  noteText?: string;
  benefits: string[];
  buttonText: string;
  onButtonClick: () => void;
  disabled?: boolean;
}

const SubscriptionDetails: React.FC<SubscriptionDetailsProps> = ({
  title,
  price,
  priceUnit = '/seat/mo',
  addOnText,
  noteText = '',
  benefits,
  buttonText,
  onButtonClick,
  disabled = false
}) => {
  return (
    <SubscriptionCard>
      <PlanTitle isCustom={price === -1}>{title}</PlanTitle>
      {price !== -1 && (
        <PriceContainer>
          <Price>${price}</Price>
          <PriceUnit>{priceUnit}</PriceUnit>
        </PriceContainer>
      )}
      
      {addOnText && (
        <AddOnText>{addOnText}</AddOnText>
      )}
      
      <BenefitsList>
        {benefits.map((benefit, index) => (
          <BenefitItem key={index}>
            <img 
              src={checkIcon} 
              alt="✓" 
              style={{ width: '16px', height: '16px', 
                marginRight: '8px', objectFit: 'contain'
              }} 
            />
            {benefit}
          </BenefitItem>
        ))}
      </BenefitsList>

      {noteText && (
        <AddOnText><i>{noteText}</i></AddOnText>
      )}
      
      <ActionButton 
        onClick={onButtonClick}
        disabled={disabled}
      >
        {buttonText}
      </ActionButton>
    </SubscriptionCard>
  );
};

export default SubscriptionDetails; 