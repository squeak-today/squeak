import React from 'react';
import {
  ModalOverlay,
  ModalContent,
  ModalMessage,
  ModalButtonContainer,
  ModalButton
} from '../../styles/components/SettingsPageStyles';

interface ConfirmationModalProps {
  isOpen: boolean;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmButtonColor?: string;
  confirmButtonTextColor?: string;
  isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  message,
  onCancel,
  onConfirm,
  confirmButtonColor = '#f5f5f5',
  confirmButtonTextColor = '#000000',
  isLoading = false
}) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalMessage>{message}</ModalMessage>
        <ModalButtonContainer>
          <ModalButton 
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </ModalButton>
          <ModalButton 
            onClick={onConfirm} 
            bgColor={confirmButtonColor}
            textColor={confirmButtonTextColor}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Confirm'}
          </ModalButton>
        </ModalButtonContainer>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ConfirmationModal; 