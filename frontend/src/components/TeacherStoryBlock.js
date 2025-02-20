import styled from 'styled-components';

const StoryBlockContainer = styled.div`
	background: white;
	border-radius: 15px;
	padding: 1.25em 1.25em 1em;
	margin: 1.25em 0;
	cursor: pointer;
	transition: transform 0.2s;
	font-family: 'Lora', serif;
	position: relative;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
	border: 1px solid #e0e0e0;

	&:hover {
		transform: translateY(-2px);
	}
`;

const TopSection = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;

	@media (max-width: 500px) {
		flex-direction: column;
		align-items: flex-start;
		gap: 0.5em;
	}
`;

const DateText = styled.div`
	color: #888;
	font-size: 0.875em;
	text-align: right;
	padding-right: 0.5em;

	@media (max-width: 500px) {
		text-align: left;
		padding-right: 0;
		margin-top: 0.5em;
	}
`;

const Title = styled.h2`
	margin: 1em 0 0.625em 0;
	font-size: 1.25em;
	color: #333;
	font-family: 'Lora', serif;
`;

const ContentWrapper = styled.div`
	margin-right: 0;
	margin-top: 0.5em;
	padding-right: 0.5em;
`;

const Preview = styled.p`
	color: #666;
	font-size: 0.875em;
	font-family: 'Lora', serif;
`;

const TagContainer = styled.div`
	display: flex;
	gap: 0.625em;
	font-family: 'Lora', serif;
	flex-wrap: wrap;
`;

const Tag = styled.span`
	background: ${props => props.cefr ? getCEFRColor(props.cefr) : '#E0E0E0'};
	padding: 0.4em 1em;
	border-radius: 15px;
	font-size: 0.875em;
	color: black;
	font-family: 'Lora', serif;
	${props => props.cefr && 'font-weight: bold;'}
`;

const getCEFRColor = (level) => {
	const firstLetter = level.charAt(0);
	switch (firstLetter) {
		case 'C':
			return '#FFB3B3'; // pastel red
		case 'B':
			return '#FFD6B3'; // pastel orange
		case 'A':
			return '#B3FFB3'; // pastel green
		default:
			return '#FFA07A'; // default color
	}
};

const formatDate = (dateString) => {
	const date = new Date(dateString);
	return date.toLocaleDateString('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	});
};

const AcceptButton = styled.button`
	position: absolute;
	bottom: 1em;
	right: 1em;
	background-color: #28a745;
	color: white;
	border: none;
	border-radius: 6px;
	padding: 0.5em 1em;
	font-family: 'Lora', serif;
	cursor: pointer;
	transition: background-color 0.2s;
	
	&:hover {
		background-color: #218838;
	}
`;

const TeacherStoryBlock = ({ story, onStoryBlockClick, onAccept }) => {
	// Ensure tags is always an array to avoid errors.
	const tagsArray = Array.isArray(story.tags) ? story.tags : (story.tags ? [story.tags] : []);
	// Assume the first two tags are language and topic (or leave them as-is)
	const [language = '', topic = ''] = tagsArray;

	const handleAcceptClick = (e) => {
		// Prevent the view action when clicking Accept.
		e.stopPropagation();
		if (onAccept) {
			onAccept(story);
		}
	};

	return (
		<StoryBlockContainer onClick={() => onStoryBlockClick(story)}>
			<TopSection>
				<TagContainer>
					<Tag cefr={story.difficulty}>{story.difficulty}</Tag>
					<Tag>{language}</Tag>
					<Tag>{topic}</Tag>
				</TagContainer>
				<DateText>{formatDate(story.date)}</DateText>
			</TopSection>
			
			<Title>{story.title}</Title>
			<ContentWrapper>
				<Preview>{story.preview}</Preview>
			</ContentWrapper>
			
			<AcceptButton onClick={handleAcceptClick}>Accept</AcceptButton>
		</StoryBlockContainer>
	);
};

export default TeacherStoryBlock;
