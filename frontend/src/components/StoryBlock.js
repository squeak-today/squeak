import styled from 'styled-components';

const StoryBlockContainer = styled.div`
	background: white;
	border-radius: 15px;
	padding: 1.25em 1.25em 1em;
	margin: 1.25em 0;
	cursor: pointer;
	transition: transform 0.2s;
	font-family: 'Noto Serif', serif;
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
`;

const DateText = styled.div`
	color: #888;
	font-size: 0.875em;
	text-align: right;
	padding-right: 0.5em;
`;

const Title = styled.h2`
	margin: 1em 0 0.625em 0;
	font-size: 1.25em;
	color: #333;
	font-family: 'Noto Serif', serif;
`;

const ContentWrapper = styled.div`
	margin-right: 0;
	margin-top: 0.5em;
	padding-right: 0.5em;
`;

const Preview = styled.p`
	color: #666;
	font-size: 0.875em;
	font-family: 'Noto Serif', serif;
`;

const TagContainer = styled.div`
	display: flex;
	gap: 0.625em;
	font-family: 'Noto Serif', serif;
`;

const Tag = styled.span`
	background: ${props => props.cefr ? getCEFRColor(props.cefr) : '#E0E0E0'};
	padding: 0.4em 1em;
	border-radius: 15px;
	font-size: 0.875em;
	color: black;
	font-family: 'Noto Serif', serif;
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

const StoryBlock = ({ title, preview, tags, difficulty, date, onStoryBlockClick }) => {
	const [language = '', topic = ''] = tags;
	
	return (
		<StoryBlockContainer onClick={onStoryBlockClick}>
			<TopSection>
				<TagContainer>
					<Tag cefr={difficulty}>{difficulty}</Tag>
					<Tag>{language}</Tag>
					<Tag>{topic}</Tag>
				</TagContainer>
				<DateText>{formatDate(date)}</DateText>
			</TopSection>
			
			<Title>{title}</Title>
			<ContentWrapper>
				<Preview>{preview}</Preview>
			</ContentWrapper>
		</StoryBlockContainer>
	);
};

export default StoryBlock; 