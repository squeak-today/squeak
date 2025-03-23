import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ContentBlock from './ContentBlock';
import { useNewsAPI } from '../hooks/useNewsAPI';
import { useNotification } from '../context/NotificationContext';
import { 
    Container, 
    Title, 
    Subtitle,
    RecommendationsList, 
    Timeline, 
    RecommendationItem,
    NoRecommendationsMessage 
} from '../styles/components/NewsRecommendationsStyles';

interface NewsRecommendationsProps {
    userLanguage: string;
    cefrLevel: string;
    interested_topics?: string[];
}

interface NewsItem {
    id: string;
    title: string;
    preview_text: string;
    language: string;
    topic: string;
    cefr_level: string;
    date_created: string;
}

const formatDate = () => {
    const date = new Date();
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const day = date.getDate();
    const year = date.getFullYear();

    const getOrdinal = (n: number) => {
        if (n > 3 && n < 21) return 'th';
        switch (n % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    };

    return `${month} ${day}${getOrdinal(day)}, ${year}`;
};

const getTopicForToday = (interested_topics: string[] = []): string => {
    if (!interested_topics || interested_topics.length === 0) {
        return 'any';
    }
    const sortedTopics = [...interested_topics].sort();
    const dayOfMonth = new Date().getDate();
    const topicIndex = (dayOfMonth - 1) % sortedTopics.length;
    return sortedTopics[topicIndex];
};

const NewsRecommendations: React.FC<NewsRecommendationsProps> = ({ userLanguage, cefrLevel, interested_topics = [] }) => {
    const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);
    const hasFetchedRef = useRef<boolean>(false);
    
    const navigate = useNavigate();
    const { queryNews } = useNewsAPI();
    const { showNotification } = useNotification();

    useEffect(() => {
        if (!userLanguage || !cefrLevel) {
            return;
        }
        
        if (hasFetchedRef.current) {
            return;
        }

        const fetchNewsRecommendations = async () => {
            if (isLoading === false) {
                setIsLoading(true);
            }
            
            try {
                hasFetchedRef.current = true;
                
                const selectedTopic = getTopicForToday(interested_topics);
                const response = await queryNews({
                    language: userLanguage,
                    cefr: cefrLevel,
                    subject: selectedTopic,
                    page: '1',
                    pagesize: '3'
                });
                
                if (Array.isArray(response)) {
                    setNewsItems(response);
                    setError(false);
                } else {
                    setNewsItems([]);
                    setError(true);
                }
            } catch (error) {
                console.error('Error fetching news recommendations:', error);
                showNotification('Failed to load news recommendations', 'error');
                setNewsItems([]);
                setError(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNewsRecommendations();
        
        return () => {
            hasFetchedRef.current = false;
        };
        
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userLanguage, cefrLevel, interested_topics]);

    const handleClick = (newsItem: NewsItem) => {
        navigate(`/read/News/${newsItem.id}`);
    };

    if (isLoading) {
        return (
            <Container>
                <Title>Today is {formatDate()}...</Title>
                <Subtitle>Here are your recommended articles for today!</Subtitle>
                <NoRecommendationsMessage>Loading recommendations...</NoRecommendationsMessage>
            </Container>
        );
    }

    if (error || newsItems.length === 0) {
        return (
            <Container>
                <Title>Today is {formatDate()}...</Title>
                <NoRecommendationsMessage>No news recommendations available!</NoRecommendationsMessage>
            </Container>
        );
    }

    const selectedTopic = getTopicForToday(interested_topics);
    const topicDisplay = selectedTopic !== 'any' ? `about ${selectedTopic}` : '';

    return (
        <Container>
            <Title>Today is {formatDate()}...</Title>
            <Subtitle>Here are your recommended articles {topicDisplay} for today!</Subtitle>
            <RecommendationsList>
                <Timeline />
                {newsItems.map((newsItem) => (
                    <RecommendationItem key={newsItem.id}>
                        <ContentBlock
                            title={newsItem.title}
                            preview={newsItem.preview_text}
                            tags={[newsItem.language, newsItem.topic]}
                            difficulty={newsItem.cefr_level}
                            date={newsItem.date_created}
                            onContentBlockClick={() => handleClick(newsItem)}
                        />
                    </RecommendationItem>
                ))}
            </RecommendationsList>
        </Container>
    );
};

export default NewsRecommendations; 