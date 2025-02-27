import { useState, useEffect } from 'react';
import StoryList from './StoryList';
import { AVAILABLE_TOPICS } from '../services/lib/topics';
import {
	FilterContainer,
	FilterLabel,
	FilterSelect,
	PaginationContainer,
	PageButton,
	DisclaimerText,
	NoContentMessage
} from '../styles/components/StoryBrowserStyles';

const StoryBrowser = ({ stories, onParamsSelect, onStoryBlockClick, defaultLanguage }) => {
	const [filterLanguage, setFilterLanguage] = useState(defaultLanguage);
	const [filterLevel, setFilterLevel] = useState('any');
	const [filterTopic, setFilterTopic] = useState('any');
	const [currentPage, setCurrentPage] = useState(1);
	const storiesPerPage = 6;

	useEffect(() => {
		setFilterLanguage(defaultLanguage);
	}, [defaultLanguage]);

	const handlePageChange = (newPage) => {
		setCurrentPage(newPage);
		onParamsSelect(filterLanguage, filterLevel, filterTopic, newPage, storiesPerPage);
	};

	return (
		<div>
			<FilterContainer>
				<div style={{ flex: 1 }}>
					<FilterLabel>Language</FilterLabel>
					<FilterSelect 
						value={filterLanguage} 
						onChange={(e) => { 
							setFilterLanguage(e.target.value); 
							setCurrentPage(1);
							onParamsSelect(e.target.value, filterLevel, filterTopic, 1, storiesPerPage); 
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
						onChange={(e) => { 
							setFilterLevel(e.target.value); 
							setCurrentPage(1);
							onParamsSelect(filterLanguage, e.target.value, filterTopic, 1, storiesPerPage); 
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
						onChange={(e) => { 
							setFilterTopic(e.target.value); 
							setCurrentPage(1);
							onParamsSelect(filterLanguage, filterLevel, e.target.value, 1, storiesPerPage); 
						}}
					>
						<option value="any">Any Topic</option>
						{AVAILABLE_TOPICS.map(topic => (
							<option key={topic} value={topic}>{topic}</option>
						))}
					</FilterSelect>
				</div>
			</FilterContainer>
			
			{stories.length > 0 ? (
				<StoryList stories={stories} onStoryBlockClick={onStoryBlockClick} />
			) : (
				<NoContentMessage>No stories found for these filters!</NoContentMessage>
			)}

			{stories.length > 0 && (
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
						disabled={stories.length < storiesPerPage}
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

export default StoryBrowser; 