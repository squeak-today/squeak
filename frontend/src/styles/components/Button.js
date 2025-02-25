import styled from 'styled-components';
import { theme } from '../theme';

export const Button = styled.button`
  font-family: ${theme.typography.fontFamily.primary};
  border-radius: 10px;
  background: #fad48f;
  border: none;
  color: ${theme.colors.text.primary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-decoration: none;

  &:hover {
    background: #f3c87d;
  }
`; 