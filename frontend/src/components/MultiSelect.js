import React from 'react';
import styled from 'styled-components';

const SelectContainer = styled.div`
    width: 100%;
    border: 1px solid #ccc;
    border-radius: 15px;
    max-height: 150px;
    overflow-y: auto;
`;

const Option = styled.div`
    padding: 8px 12px;
    cursor: pointer;
    font-family: 'Lora', serif;
    background: ${props => props.$selected ? '#E6F3FF' : 'white'};
    &:hover {
        background: ${props => props.$selected ? '#D1E8FF' : '#f5f5f5'};
    }
`;

const MultiSelect = ({ options, selected, onToggle }) => {
    return (
        <SelectContainer>
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