import styled from 'styled-components';

export const Section = styled.section`
  margin-bottom: 2rem;
`;

export const ToggleButton = styled.button`
  background-color: rgba(250, 212, 143, 0.5);
  color: black;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-family: 'Lora', serif;
  cursor: pointer;
  margin-bottom: 1rem;
  
  &:hover {
    background-color: #e0a700;
  }
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`;

export const DateHeader = styled.h1`
  font-family: 'Lora', serif;
  text-align: center;
  margin-bottom: 1em;
  font-size: 2em;
  font-weight: 600;
`;

export const ClassroomInfoContainer = styled.div`
  width: 30vw;
  margin: 0 auto;
  padding: 1.5rem;
  border-radius: 15px;
  background: white;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  font-family: 'Lora', serif;

  @media (max-width: 768px) {
    width: 80vw;
  }
`;

export const ClassroomInfoText = styled.p`
  font-family: 'Lora', serif;
  font-size: 1.1em;
  color: #333;
  margin: 0.5rem 0;

  strong {
    color: #000;
    font-weight: 600;
  }
`; 