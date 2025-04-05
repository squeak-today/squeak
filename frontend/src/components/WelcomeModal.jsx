import React from 'react';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import { MiscButton } from './StyledComponents';

const WelcomeContainer = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
    padding: 40px;
    animation: fadeIn 0.3s ease forwards;

    @keyframes fadeIn {
        from {
            background-color: rgba(0, 0, 0, 0);
        }
        to {
            background-color: rgba(0, 0, 0, 0.5);
        }
    }
`;

const WelcomeContent = styled.div`
    position: relative;
    background-color: white;
    padding: 30px;
    border-radius: 15px;
	font-family: 'Lora', serif;
    max-width: 600px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    animation: slideIn 0.3s ease forwards;
    transform: translateY(20px);
    opacity: 0;

    @keyframes slideIn {
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
`;

const ButtonContainer = styled.div`
    display: flex;
    justify-content: center;
    margin-top: 20px;
`;

// this welcome modal would be better if we also had pictures in it, or just made it look more exciting.
const welcomeText = `
# Welcome to Squeak! 🐭

Squeak helps you learn languages through comprehensible input. Here's how it works:

1. Browse our stories and news articles.
2. Filter by difficulty level (A1-C2), topics, and language.
3. Click on any word to see its translation in English.

Happy learning!
`;

const WelcomeModal = ({ onClose }) => {
    return (
        <WelcomeContainer>
            <WelcomeContent>
                <ReactMarkdown>{welcomeText}</ReactMarkdown>
                <ButtonContainer>
                    <MiscButton as="button" onClick={onClose}>
                        Got it!
                    </MiscButton>
                </ButtonContainer>
            </WelcomeContent>
        </WelcomeContainer>
    );
};

export default WelcomeModal; 