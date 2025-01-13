import styled from 'styled-components';
import StoryList from './StoryList';
import { useState } from 'react';

const DateHeader = styled.h1`
	font-family: 'Noto Serif', serif;
	text-align: center;
	margin-bottom: 1em;
	font-size: 2em;
	font-weight: 600;
`;

const FilterContainer = styled.div`
	display: flex;
	gap: 1em;
	margin-bottom: 1.25em;
	max-width: 800px;
	margin: 0 auto 1.25em;
`;

const FilterLabel = styled.label`
	display: block;
	margin-bottom: 0.3em;
	font-family: 'Noto Serif', serif;
`;

const FilterSelect = styled.select`
	padding: 0.5em;
	border: 1px solid white;
	border-radius: 5px;
	font-family: 'Noto Serif', serif;
	width: 100%;
	background: white;
	cursor: pointer;
`;

const PaginationContainer = styled.div`
	display: flex;
	justify-content: center;
	gap: 0.5em;
	margin-top: 0.5em;
`;

const PageButton = styled.button`
	padding: 0.5em 1em;
	border: 1px solid white;
	border-radius: 10px;
	background: white;
	cursor: pointer;
	font-family: 'Noto Serif', serif;

	&:disabled {
		background: #eee;
		cursor: not-allowed;
	}
`;

const StoryBrowser = ({ stories, onParamsSelect, onStoryBlockClick }) => {
	const [filterLanguage, setFilterLanguage] = useState('any');
	const [filterLevel, setFilterLevel] = useState('any');
	const [filterTopic, setFilterTopic] = useState('any');
	const [currentPage, setCurrentPage] = useState(1);
	const storiesPerPage = 6;

	const formatDate = () => {
		const date = new Date();
		const month = date.toLocaleDateString('en-US', { month: 'long' });
		const day = date.getDate();
		const year = date.getFullYear();

		// Get ordinal suffix for day
		const getOrdinal = (n) => {
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

	// Then paginate the filtered stories
	const totalPages = Math.ceil(stories.length / storiesPerPage);
	const paginatedStories = stories.slice(
		(currentPage - 1) * storiesPerPage,
		currentPage * storiesPerPage
	);

	const handlePageChange = (page) => {
		setCurrentPage(page);
	};

	return (
		<div>
			<DateHeader>Today is {formatDate()}.</DateHeader>
			<FilterContainer>
				<div style={{ flex: 1 }}>
					<FilterLabel>Language</FilterLabel>
					<FilterSelect 
						value={filterLanguage} 
						onChange={(e) => { setFilterLanguage(e.target.value); onParamsSelect(e.target.value, filterLevel, filterTopic); }}
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
						onChange={(e) => { setFilterLevel(e.target.value); onParamsSelect(filterLanguage, e.target.value, filterTopic); }}
					>
						<option value="any">Any Level</option>
						<option value="A1">A1</option>
						<option value="A2">A2</option>
						<option value="B1">B1</option>
						<option value="B2">B2</option>
						<option value="C1">C1</option>
						<option value="C2">C2</option>
					</FilterSelect>
				</div>

				<div style={{ flex: 1 }}>
					<FilterLabel>Topic</FilterLabel>
					<FilterSelect 
						value={filterTopic} 
						onChange={(e) => { setFilterTopic(e.target.value); onParamsSelect(filterLanguage, filterLevel, e.target.value); }}
					>
						<option value="any">Any Topic</option>
						<option value="Politics">Politics</option>
						<option value="Basketball">Basketball</option>
						<option value="Finance">Finance</option>
					</FilterSelect>
				</div>
			</FilterContainer>
			
			<StoryList stories={paginatedStories} onStoryBlockClick={(story) => { onStoryBlockClick(story) }} />

			<PaginationContainer>
				<PageButton 
					onClick={() => handlePageChange(1)} 
					disabled={currentPage === 1}
				>
					First
				</PageButton>
				<PageButton 
					onClick={() => handlePageChange(currentPage - 1)} 
					disabled={currentPage === 1}
				>
					Previous
				</PageButton>
				{/* Show current page and total pages */}
				<PageButton disabled>
					{currentPage} of {totalPages}
				</PageButton>
				<PageButton 
					onClick={() => handlePageChange(currentPage + 1)} 
					disabled={currentPage === totalPages}
				>
					Next
				</PageButton>
				<PageButton 
					onClick={() => handlePageChange(totalPages)} 
					disabled={currentPage === totalPages}
				>
					Last
				</PageButton>
			</PaginationContainer>
		</div>
	);
};

export default StoryBrowser; 