import styled from 'styled-components';
import { theme } from '../theme';

export const Container = styled.div`
    padding: ${theme.spacing.md};
    background-color: ${theme.colors.background};
    border-radius: 8px;
`;

export const Title = styled.h2`
    font-family: ${theme.typography.fontFamily.primary};
    font-size: ${theme.typography.fontSize.lg};
    color: ${theme.colors.text.primary};
    margin-bottom: ${theme.spacing.md};
`;

export const DeckList = styled.ul`
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};
`;

export const DeckItem = styled.li`
    background-color: #fff;
    padding: ${theme.spacing.md};
    border: 1px solid ${theme.colors.border};
    border-radius: 4px;
    cursor: pointer;
    transition: box-shadow 0.2s;

    &:hover {
        box-shadow: ${theme.elevation.hover};
    }

    h3 {
        font-family: ${theme.typography.fontFamily.secondary};
        font-size: ${theme.typography.fontSize.md};
        color: ${theme.colors.text.secondary};
        margin: 0 0 ${theme.spacing.sm};
    }

    p {
        font-family: ${theme.typography.fontFamily.secondary};
        font-size: ${theme.typography.fontSize.base};
        color: ${theme.colors.text.secondary};
        margin: 0;
    }
`;

export const NoDecksMessage = styled.p`
    font-family: ${theme.typography.fontFamily.secondary};
    font-size: ${theme.typography.fontSize.md};
    color: ${theme.colors.text.secondary};
    text-align: center;
`;