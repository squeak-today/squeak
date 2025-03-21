import React from 'react';
import styled from 'styled-components';
import { theme } from 'shared';

const SelectContainer = styled.div`
    width: auto;
    border: 1px solid #ccc;
    border-radius: 15px;
    overflow-y: auto;
    box-sizing: border-box;
    
    @media (max-width: ${theme.breakpoints.mobile}) {
        width: 100%;
        max-height: 200px;
    }
`;

const Option = styled.div`
    padding: 8px 12px;
    cursor: pointer;
    font-family: 'Lora', serif;
    background: ${props => props.$selected ? '#E6F3FF' : 'white'};
    &:hover {
        background: ${props => props.$selected ? '#D1E8FF' : '#f5f5f5'};
    }
    
    @media (max-width: ${theme.breakpoints.mobile}) {
        padding: 12px 16px; /* Larger touch target on mobile */
    }
`;

const MultiSelect = ({ options, selected, onToggle, fullWidth = false }) => {
    return (
        <SelectContainer $fullWidth={fullWidth}>
            {options.map(option => (
                <Option
                    key={option}
                    $selected={selected.includes(option)}
                    onClick={() => onToggle(option)}
                >
                    {option}
                </Option>
            ))}
        </SelectContainer>
    );
};

export default MultiSelect; 