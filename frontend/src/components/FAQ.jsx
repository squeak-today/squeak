import React, { useState } from 'react';
import { FiPlus, FiMinus } from 'react-icons/fi';
import {
  FAQContainer,
  FAQItem,
  QuestionButton,
  Answer,
  IconWrapper,
  ContactContainer,
  ContactLink
} from '../styles/components/FAQStyles';

const FAQ = ({ faqs }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleContactClick = () => {
    window.open('/contact-support.html', '_blank');
  };

  return (
    <>
      <FAQContainer>
        {faqs.map((faq, index) => (
          <FAQItem key={index}>
            <QuestionButton onClick={() => toggleQuestion(index)}>
              {faq.question}
              <IconWrapper>
                {openIndex === index ? <FiMinus /> : <FiPlus />}
              </IconWrapper>
            </QuestionButton>
            <Answer $isOpen={openIndex === index}>
              {faq.answer}
            </Answer>
          </FAQItem>
        ))}
      </FAQContainer>
      <ContactContainer>
        Questions? <ContactLink onClick={handleContactClick}>Contact Us</ContactLink>
      </ContactContainer>
    </>
  );
};

export default FAQ; 