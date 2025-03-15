import React, { useState, useEffect } from 'react';
import StoryList from './StoryList';
import { AVAILABLE_TOPICS } from '../lib/topics';
import { useNewsAPI } from '../hooks/useNewsAPI';
import { useStoryAPI } from '../hooks/useStoryAPI';
import {
	FilterContainer,
	FilterLabel,
	FilterSelect,
	PaginationContainer,
	PageButton,
	DisclaimerText,
	NoContentMessage
} from '../styles/components/ContentBrowserStyles';
import { useNotification } from '../context/NotificationContext';

interface NewsItem {
  id: string;
  title: string;
  preview_text: string;
  language: string;
  topic: string;
  cefr_level: string;
  date_created: string;
}

interface StoryItem {
  id: string;
  title: string;
  preview_text?: string;
  language: string;
  topic: string;
  cefr_level: string;
  date_created: string;
}

interface ContentItem {
  id: string;
  type: 'News' | 'Story';
  title: string;
  preview: string;
  tags: string[];
  difficulty: string;
  date_created: string;
}

interface ContentBrowserProps {
  defaultLanguage: string;
}

type ContentType = 'News' | 'Story';

const ContentBrowser: React.FC<ContentBrowserProps> = ({ defaultLanguage }) => {
	const [filterLanguage, setFilterLanguage] = useState<string>(defaultLanguage);
	const [filterLevel, setFilterLevel] = useState<string>('any');
	const [filterTopic, setFilterTopic] = useState<string>('any');
	const [contentType, setContentType] = useState<ContentType>('News');
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [contentItems, setContentItems] = useState<ContentItem[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const storiesPerPage = 6;
	
	const { queryNews } = useNewsAPI();
	const { queryStories } = useStoryAPI();
	const { showNotification } = useNotification();

	useEffect(() => {
		setFilterLanguage(defaultLanguage);
	}, [defaultLanguage]);
	
	useEffect(() => {
		fetchContent(filterLanguage, filterLevel, filterTopic, currentPage, storiesPerPage, contentType);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [defaultLanguage]);

	const fetchContent = async (
		language: string,
		cefrLevel: string,
		subject: string,
		page: number,
		pagesize: number,
		contentType: ContentType
	): Promise<void> => {
		setIsLoading(true);
		const tempItems: ContentItem[] = [];
		
		try {
			if (contentType === 'News') {
				let newsData: NewsItem[] = [];
				try {
					const response = await queryNews({
						language: language,
						cefr: cefrLevel,
						subject: subject,
						page: page.toString(),
						pagesize: pagesize.toString()
					});
					newsData = Array.isArray(response) ? response : [];
				} catch (error) {
					console.error("Error fetching news:", error);
					newsData = [];
				}
				
				for (const news of newsData) {
					tempItems.push({
						id: news.id,
						type: 'News',
						title: news.title,
						preview: news.preview_text,
						tags: [news.language, news.topic],
						difficulty: news.cefr_level,
						date_created: news.date_created
					});
				}
			} else if (contentType === 'Story') {
				let storyData: StoryItem[] = [];
				try {
					const response = await queryStories({
						language: language,
						cefr: cefrLevel,
						subject: subject,
						page: page.toString(),
						pagesize: pagesize.toString()
					});
					storyData = Array.isArray(response) ? response : [];
				} catch (error) {
					console.error("Error fetching stories:", error);
					storyData = [];
				}
				
				for (const story of storyData) {
					tempItems.push({
						id: story.id,
						type: 'Story',
						title: story.title,
						preview: story.preview_text || 'Start reading this story...',
						tags: [story.language, story.topic],
						difficulty: story.cefr_level,
						date_created: story.date_created
					});
				}
			}
			
			setContentItems(tempItems);
		} catch (error) {
			console.error("Failed to fetch content:", error);
			showNotification("Couldn't get Squeak's content. Please try again or come back later!", 'error');
		} finally {
			setIsLoading(false);
		}
	};

	const handleParamsSelect = async (
		language: string, 
		level: string, 
		topic: string, 
		page: number, 
		pageSize: number, 
		type: ContentType
	): Promise<void> => {
		await fetchContent(language, level, topic, page, pageSize, type);
	};

	const handlePageChange = (newPage: number): void => {
		setCurrentPage(newPage);
		handleParamsSelect(filterLanguage, filterLevel, filterTopic, newPage, storiesPerPage, contentType);
	};

	return (
		<div>
			<FilterContainer>
				<div style={{ flex: 1 }}>
					<FilterLabel>Content Type</FilterLabel>
					<FilterSelect 
						value={contentType} 
						onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { 
							setContentType(e.target.value as ContentType); 
							setCurrentPage(1);
							handleParamsSelect(filterLanguage, filterLevel, filterTopic, 1, storiesPerPage, e.target.value as ContentType);
						}}
					>
						<option value="News">News</option>
						<option value="Story">Story</option>
					</FilterSelect>
				</div>
				
				<div style={{ flex: 1 }}>
					<FilterLabel>Language</FilterLabel>
					<FilterSelect 
						value={filterLanguage} 
						onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { 
							setFilterLanguage(e.target.value); 
							setCurrentPage(1);
							handleParamsSelect(e.target.value, filterLevel, filterTopic, 1, storiesPerPage, contentType); 
						}}
					>
						<option value="any">Any Language</option>
						<option value="Spanish">Spanish</option>
						<option value="French">French</option>
					</FilterSelect>
				</div>

				<div style={{ flex: 1 }}>
					<FilterLabel>Reading Level</FilterLabel>
					<FilterSelect 
						value={filterLevel} 
						onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { 
							setFilterLevel(e.target.value); 
							setCurrentPage(1);
							handleParamsSelect(filterLanguage, e.target.value, filterTopic, 1, storiesPerPage, contentType); 
						}}
					>
						<option value="any">Any Level</option>
						<option value="A1">A1 (Beginner)</option>
						<option value="A2">A2 (Elementary)</option>
						<option value="B1">B1 (Intermediate)</option>
						<option value="B2">B2 (Upper Intermediate)</option>
						<option value="C1">C1 (Advanced)</option>
						<option value="C2">C2 (Proficient)</option>
					</FilterSelect>
				</div>

				<div style={{ flex: 1 }}>
					<FilterLabel>Topic</FilterLabel>
					<FilterSelect 
						value={filterTopic} 
						onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { 
							setFilterTopic(e.target.value); 
							setCurrentPage(1);
							handleParamsSelect(filterLanguage, filterLevel, e.target.value, 1, storiesPerPage, contentType); 
						}}
					>
						<option value="any">Any Topic</option>
						{AVAILABLE_TOPICS.map(topic => (
							<option key={topic} value={topic}>{topic}</option>
						))}
					</FilterSelect>
				</div>
			</FilterContainer>
			
			{isLoading ? (
				<NoContentMessage>Loading content...</NoContentMessage>
			) : contentItems.length > 0 ? (
				<StoryList stories={contentItems} />
			) : (
				<NoContentMessage>No content found for these filters!</NoContentMessage>
			)}

			{contentItems.length > 0 && (
				<PaginationContainer>
					<PageButton 
						onClick={() => handlePageChange(currentPage - 1)} 
						disabled={currentPage === 1}
					>
						Previous
					</PageButton>
					<PageButton disabled>
						Page {currentPage}
					</PageButton>
					<PageButton 
						onClick={() => handlePageChange(currentPage + 1)} 
						disabled={contentItems.length < storiesPerPage}
					>
						Next
					</PageButton>
				</PaginationContainer>
			)}

			<DisclaimerText>
				Content may be AI-assisted. While we strive for accuracy, please verify important information from official sources.
			</DisclaimerText>
		</div>
	);
};

export default ContentBrowser; 