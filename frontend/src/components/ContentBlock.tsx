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
import checkIcon from '../assets/icons/check.png';

interface ContentBlockProps {
    title: string;
    preview: string;
    tags: string[];
    difficulty: string;
    date: string;
    audiobookTier: string;
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
    audiobookTier,
    onContentBlockClick 
}) => {
    const [language = '', topic = ''] = tags;

    function getTag(tier: string) {
        tier = tier.toLowerCase();
        const text = String(tier).charAt(0).toUpperCase() + String(tier).slice(1);
        return (
            <span className="bg-purple-200 px-4 py-1.5 sm:rounded-full rounded-[12px] text-sm text-gray-800 flex items-center">
                {text}{" Audiobook Available"}
                <img src={checkIcon} alt="checkmark" className="ml-1 h-4 w-4 opacity-50" />
            </span>
        )
    }
    
    return (
        <ContentBlockContainer onClick={onContentBlockClick}>
            <TopSection>
                <TagContainer>
                    <Tag cefr={difficulty}>{difficulty}</Tag>
                    <Tag>{language}</Tag>
                    <Tag>{topic}</Tag>
                    {audiobookTier && getTag(audiobookTier)}
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