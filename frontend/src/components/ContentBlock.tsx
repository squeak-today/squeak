import React from 'react';
import {
    ContentBlockContainer,
    TopSection,
    DateText,
    Title,
    ContentWrapper,
    Preview,
    TagContainer,
    Tag
} from '../styles/components/ContentBlockStyles';

interface ContentBlockProps {
    title: string;
    preview: string;
    tags: string[];
    difficulty: string;
    date: string;
    onContentBlockClick: () => void;
}

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
};

const ContentBlock: React.FC<ContentBlockProps> = ({ 
    title, 
    preview, 
    tags, 
    difficulty, 
    date, 
    onContentBlockClick 
}) => {
    const [language = '', topic = ''] = tags;
    
    return (
        <ContentBlockContainer onClick={onContentBlockClick}>
            <TopSection>
                <TagContainer>
                    <Tag cefr={difficulty}>{difficulty}</Tag>
                    <Tag>{language}</Tag>
                    <Tag>{topic}</Tag>
                </TagContainer>
                <DateText>{formatDate(date)}</DateText>
            </TopSection>
            
            <Title>{title}</Title>
            <ContentWrapper>
                <Preview>{preview}</Preview>
            </ContentWrapper>
        </ContentBlockContainer>
    );
};

export default ContentBlock; 