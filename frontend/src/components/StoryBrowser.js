import styled from 'styled-components';
import StoryList from './StoryList';
import { useState, useEffect } from 'react';

const FilterContainer = styled.div`
	display: flex;
	gap: 1em;
	margin-bottom: 1.25em;
	padding-left: 1.5em;
	padding-right: 1.5em;
	max-width: 800px;
	margin: 0 auto 1.25em;

	@media (max-width: 800px) {
    display: grid;
    grid-template-columns: 1fr 1fr; 
    gap: 1em;
  }
`;

const FilterLabel = styled.label`
	display: block;
	margin-bottom: 0.3em;
	font-family: 'Lora', serif;
`;

const FilterSelect = styled.select`
	padding: 0.5em;
	border: 1px solid #e0e0e0;
	border-radius: 5px;
	font-family: 'Lora', serif;
	width: 100%;
	background: white;
	cursor: pointer;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const PaginationContainer = styled.div`
	display: flex;
	justify-content: center;
	gap: 0.5em;
	margin-top: 0.5em;
`;

const PageButton = styled.button`
	padding: 0.5em 1em;
	border: 1px solid #e0e0e0;
	border-radius: 10px;
	background: white;
	cursor: pointer;
	font-family: 'Lora', serif;

	&:disabled {
		background: #eee;
		cursor: not-allowed;
	}
`;

const DisclaimerText = styled.p`
	color: #999;
	font-size: 0.75rem;
	text-align: center;
	margin-top: 2rem;
	font-family: 'Lora', serif;
	font-style: italic;
`;

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
		onParamsSelect("News", filterLanguage, filterLevel, filterTopic, newPage, storiesPerPage);
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
						<option value="Politics">Politics</option>
						<option value="Business">Business</option>
						<option value="Technology">Technology</option>
						<option value="Sports">Sports</option>
					</FilterSelect>
				</div>
			</FilterContainer>
			
			<StoryList stories={stories} onStoryBlockClick={onStoryBlockClick} />

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
					disabled={stories.length < storiesPerPage} // if we got fewer stories than the page size, we're on the last page
				>
					Next
				</PageButton>
			</PaginationContainer>

			<DisclaimerText>
				Content may be AI-assisted. While we strive for accuracy, please verify important information from official sources.
			</DisclaimerText>
		</div>
	);
};

export default StoryBrowser; 