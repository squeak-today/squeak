import styled from 'styled-components';

export const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 1.5em;
`;

export const Header = styled.h1`
  font-family: 'Lora', serif;
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 1.5em;
  color: #000;
`;

export const FilterContainer = styled.div`
  display: flex;
  gap: 1em;
  margin-bottom: 1.25em;
  padding: 0 1.5em;
  max-width: 800px;
  margin: 0 auto 1.25em;
  
  @media (max-width: 800px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1em;
  }
`;

export const FilterLabel = styled.label`
  display: block;
  margin-bottom: 0.3em;
  font-family: 'Lora', serif;
`;

export const FilterSelect = styled.select`
  padding: 0.5em;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  font-family: 'Lora', serif;
  width: 100%;
  background: white;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5em;
  margin-top: 1em;
`;

export const PageButton = styled.button`
  padding: 0.5em 1em;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  font-family: 'Lora', serif;
  &:disabled {
    background: #eee;
    cursor: not-allowed;
  }
`;

export const DisclaimerText = styled.p`
  color: #999;
  font-size: 0.75rem;
  text-align: center;
  margin-top: 2rem;
  font-family: 'Lora', serif;
  font-style: italic;
`;

export const NoContentMessage = styled.div`
  text-align: center;
  padding: 2em;
  color: #666;
  font-family: 'Lora', serif;
  font-style: italic;
`; 