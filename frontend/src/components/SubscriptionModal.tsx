import { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import closeIcon from '../assets/icons/close.png';
import {
  ModalBackdrop,
  ModalContainer,
  CloseButton,
  ModalContent
} from '../styles/SubscriptionModalStyles';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  width?: string;
}

const SubscriptionModal = ({ isOpen, onClose, children, width }: SubscriptionModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);
  
  if (!isOpen) return null;
  
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  const modalContent = (
    <ModalBackdrop onClick={handleBackdropClick}>
      <ModalContainer $width={width} onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose}>
          <img src={closeIcon} alt="Close" />
        </CloseButton>
        <ModalContent>
          {children}
        </ModalContent>
      </ModalContainer>
    </ModalBackdrop>
  );
  
  return createPortal(modalContent, document.body);
};

export default SubscriptionModal; 