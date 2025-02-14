import styled from 'styled-components';

export const QuickTipContainer = styled.div`
  background-color: #e7f6e7;
  border-radius: 8px;
  padding: 5px 20px;
  color: #155724;
  font-size: 0.95rem;
  line-height: 1.0;
  display: flex;
`;

export const TipLabel = styled.p`
  font-weight: 700;
  margin-right: 6px;
`;

export const QuizContainer = styled.div`
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 14px 20px;
  margin: 10px 0;
`;

export const QuizQuestion = styled.p`
  font-weight: 700;
  margin: 0 0 10px 0;
`;

export const QuizInput = styled.input`
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #ced4da;
  width: auto;
  max-width: 50%;
  transition: all 0.2s ease-in-out;
  
  ${props => props.isCorrect && `
    background-color: #d4edda;
    border-color: #c3e6cb;
  `}
`;
