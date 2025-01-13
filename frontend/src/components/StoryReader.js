import React, { useState } from 'react';
import styled from 'styled-components';

import rightArrow from '../assets/vectors/rightArrow.svg';
import leftArrow from '../assets/vectors/leftArrow.svg';

const StoryBox = styled.div`
	padding: 20px;
	margin: 20px 0;
	border-radius: 15px; // Rounded corners
	background-color: white;
`;

const ButtonBox = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 30px;
`;

const StoryText = styled.div`
	text-align: left;
	line-height: 1.5;
	white-space: normal; // Ensure text wraps at word boundaries
	word-break: keep-all; // Prevent breaking words in the middle
	overflow-wrap: normal; // Prevent breaking words unnecessarily
	display: flex; // Use flex display to keep all words in a line and wrap naturally
	flex-wrap: wrap; // Enable wrapping within the flex container
`;

const Word = styled.span`
	display: inline;
	margin-right: 5px;
	cursor: pointer;
	&:hover {
	text-decoration: underline;
	}
`;

const SectionButton = styled.button`
    background-color: #2C2C2C;
    color: #FFFFFF;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-family: 'Noto Serif', serif;
    font-size: 1.25em;
    display: flex;
    align-items: center;
`;

const LeftArrow = styled.img`
    margin-right: 8px;
`;
const RightArrow = styled.img`
    margin-left: 8px;
`;

const PageButton = ({isNext, onClick}) => {
    const label = isNext ? 'Next' : 'Previous';
    const icon = isNext ? rightArrow : leftArrow;
    return (
        <SectionButton onClick={onClick}>
            {!isNext && <LeftArrow src={icon} alt="Left Arrow"/>}
            {label}
            {isNext && <RightArrow src={icon} alt="Right Arrow"/>}
        </SectionButton>
    )
};

const StoryReader = ({data, handleWordClick}) => {
    const [sectionIndex, setSectionIndex] = useState(0);
    // https://stackoverflow.com/questions/6259515/how-can-i-split-a-string-into-segments-of-n-characters
    const textSections = data.match(/.{1,500}/g);

    const handleNext = () => {
        if (sectionIndex + 1 < textSections.length) { setSectionIndex(sectionIndex + 1); }
    }

    const handlePrevious = () => {
        if (sectionIndex > 0) { setSectionIndex(sectionIndex - 1); }
    };

    return (
        <StoryBox>
            <StoryText>
                {textSections[sectionIndex].split(' ').map((word, index) => (
                    <Word key={index} onClick={(e) => handleWordClick(e, word)}>
                        {word}
                    </Word>
                ))}
            </StoryText>
            <ButtonBox>
                <PageButton isNext={false} onClick={handlePrevious}/>
                <PageButton isNext={true} onClick={handleNext}/> 
            </ButtonBox>
            
        </StoryBox>
    )
};

export default StoryReader;
