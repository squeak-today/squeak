import React, { useState } from 'react';
import { QuickTipContainer, TipLabel, QuizContainer, QuizQuestion, QuizInput } from '../styles/WidgetStyles';

export const QuickTipWidget = ({ children }) => {
    return (
        <QuickTipContainer>
            <TipLabel>
                Tip:
            </TipLabel>
            {children}
        </QuickTipContainer>
    );
};

export const QuizInputWidget = ({ question, correctAnswer }) => {
    const [input, setInput] = useState('');
    const isCorrect = input.trim().toLowerCase() === correctAnswer.toLowerCase();

    return (
        <QuizContainer>
            <QuizQuestion>{question}</QuizQuestion>
            <QuizInput
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your answer..."
                isCorrect={isCorrect}
            />
        </QuizContainer>
    );
};