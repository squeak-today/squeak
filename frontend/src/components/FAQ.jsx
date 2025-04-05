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

const faqs = [
	{
    question: "Is Squeak available for multiple languages?",
    answer: "Currently, Squeak supports French and Spanish. We're working hard to add more languages soon!"
  },
  {
    question: "Is Squeak free?",
    answer: "Yes! Squeak is 100% free for teachers and students."
  },
  {
    question: "How do you source your news articles?",
    answer: "We combine hundreds of different news sources and create articles based on the info. Squeak will NEVER write any information that is not from an online, trusted source."
  }
];

const FAQ = () => {
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