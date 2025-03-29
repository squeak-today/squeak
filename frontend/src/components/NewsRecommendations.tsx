import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ContentBlock from './ContentBlock';
import { useNewsAPI } from '../hooks/useNewsAPI';
import { useStudentAPI } from '../hooks/useStudentAPI';
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
    const [isStudent, setIsStudent] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);
    const hasFetchedRef = useRef<boolean>(false);
    
    const navigate = useNavigate();
    const { queryNews } = useNewsAPI();
    const { getStudentStatus } = useStudentAPI();
    const { showNotification } = useNotification();

    useEffect(() => {
        if (!userLanguage || !cefrLevel) {
            return;
        }
        
        if (hasFetchedRef.current) {
            return;
        }

        const fetchStudentStatus = async () => {
            try {
                const studentStatus = await getStudentStatus();
                console.log(studentStatus);
                if (studentStatus.student_id !== '') {
                    setIsStudent(true);
                }
            } catch (error) {
                console.error('Error fetching student status:', error);
            }
        };

        fetchStudentStatus();

        const fetchNewsRecommendations = async () => {
            if (isLoading === false) {
                setIsLoading(true);
            }
            
            try {
                hasFetchedRef.current = true;
                
                const selectedTopic = getTopicForToday(interested_topics);
                let response = await queryNews({
                    language: userLanguage,
                    cefr: 'any',
                    subject: 'any',
                    page: '1',
                    pagesize: '20'
                });
                const filtered_response = response.filter((item: any) => (item.topic === selectedTopic && item.cefr_level === cefrLevel));
                if (filtered_response.length === 0) {
                    response = response.slice(0, 3);
                } else {
                    response = filtered_response;
                }

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
                <NoRecommendationsMessage>{isStudent ? "Ask your teacher to approve some content you're interested in!" : 'No news recommendations available for your level!'}</NoRecommendationsMessage>
            </Container>
        );
    }

    const selectedTopic = getTopicForToday(interested_topics);
    const topicDisplay = selectedTopic !== 'any' ? `about ${selectedTopic}` : '';

    return (
        <Container>
            <Title>Today is {formatDate()}...</Title>
            <Subtitle>{
                isStudent ? (newsItems.length === 0 ? "Ask your teacher to approve some content you're interested in!" : "Here are some recommended articles from your teacher!") : `Here are some articles ${topicDisplay} for today!`
            }</Subtitle>
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