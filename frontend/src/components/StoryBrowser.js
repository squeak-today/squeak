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
	border: 1px solid #e0e0e0;
	border-radius: 5px;
	font-family: 'Noto Serif', serif;
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

	const handlePageChange = (newPage) => {
		setCurrentPage(newPage);
		onParamsSelect(filterLanguage, filterLevel, filterTopic, newPage, storiesPerPage);
	};

	return (
		<div>
			<DateHeader>Today is {formatDate()}...</DateHeader>
			<FilterContainer>
				<div style={{ flex: 1 }}>
					<FilterLabel>Language</FilterLabel>
					<FilterSelect 
						value={filterLanguage} 
						onChange={(e) => { 
							setFilterLanguage(e.target.value); 
							setCurrentPage(1); // Reset to first page on filter change
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
		</div>
	);
};

export default StoryBrowser; 