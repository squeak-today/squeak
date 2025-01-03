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

const StoryBrowser = ({ stories }) => {
	const [filterLanguage, setFilterLanguage] = useState('Any');
	const [filterLevel, setFilterLevel] = useState('Any');
	const [filterTopic, setFilterTopic] = useState('Any');

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

	const filteredStories = stories.filter(story => {
		if (filterLanguage !== 'Any' && !story.tags.includes(filterLanguage)) return false;
		if (filterLevel !== 'Any' && story.difficulty !== filterLevel) return false;
		if (filterTopic !== 'Any' && !story.tags.includes(filterTopic)) return false;
		return true;
	});

	return (
		<div>
			<DateHeader>Today is {formatDate()}.</DateHeader>
			<FilterContainer>
				<div style={{ flex: 1 }}>
					<FilterLabel>Language</FilterLabel>
					<FilterSelect 
						value={filterLanguage} 
						onChange={(e) => setFilterLanguage(e.target.value)}
					>
						<option value="Any">Any Language</option>
						<option value="Spanish">Spanish</option>
						<option value="French">French</option>
					</FilterSelect>
				</div>

				<div style={{ flex: 1 }}>
					<FilterLabel>Reading Level</FilterLabel>
					<FilterSelect 
						value={filterLevel} 
						onChange={(e) => setFilterLevel(e.target.value)}
					>
						<option value="Any">Any Level</option>
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
						onChange={(e) => setFilterTopic(e.target.value)}
					>
						<option value="Any">Any Topic</option>
						<option value="Politics">Politics</option>
						<option value="Basketball">Basketball</option>
						<option value="Finance">Finance</option>
					</FilterSelect>
				</div>
			</FilterContainer>

			<StoryList stories={filteredStories} />
		</div>
	);
};

export default StoryBrowser; 