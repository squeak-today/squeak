import styled from 'styled-components';

export const VoiceInputButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    color: #666;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    transition: all 0.2s;
    margin-left: 10px;

    &:hover {
        background: #f0f0f0;
    }
`;