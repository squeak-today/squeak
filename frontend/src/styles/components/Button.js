import styled from 'styled-components';
import { theme } from 'shared';

export const Button = styled.button`
  font-family: ${theme.typography.fontFamily.secondary};
  border-radius: 15px;
  background: #FADEA7;
  border: none;
  color: ${theme.colors.text.primary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-decoration: none;

  &:hover {
    background: #FADEA7;
  }
`; 