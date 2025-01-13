import styled from 'styled-components';

const StoryBlockContainer = styled.div`
	background: white;
	border-radius: 15px;
	padding: 1.25em;
	margin: 1.25em 0;
	cursor: pointer;
	transition: transform 0.2s;
	font-family: 'Noto Serif', serif;
	position: relative;

	&:hover {
		transform: translateY(-2px);
	}
`;

const getTypeColor = (type) => {
	switch (type.toLowerCase()) {
	case 'news':
		return '#D4B5FF'; // brighter pastel purple
	case 'story':
		return '#99CCFF'; // brighter pastel blue
	default:
		return '#4A90E2';
	}
};

const StoryType = styled.div`
	display: inline-block;
	padding: 0.3em 1em;
	background: ${props => getTypeColor(props.type)};
	color: black;
	border-radius: 15px;
	font-size: 0.875em;
	font-family: 'Noto Serif', serif;
	position: absolute;
	top: -0.75em;
	left: 1.25em;
`;

const Title = styled.h2`
	margin: 0 0 0.625em 0;
	font-size: 1.25em;
	color: #333;
	font-family: 'Noto Serif', serif;
`;

const ContentWrapper = styled.div`
	margin-right: 6em;
	margin-top: 0.5em;
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
	background: #E0E0E0;
	padding: 0.25em 0.75em;
	border-radius: 15px;
	font-size: 0.75em;
	color: #666;
	font-family: 'Noto Serif', serif;
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

const CEFRLevel = styled.div`
	position: absolute;
	top: 50%;
	transform: translateY(-50%);
	right: 1.25em;
	background: ${props => getCEFRColor(props.level)};
	color: black;
	padding: 0.625em 1.25em;
	border-radius: 20px;
	font-weight: bold;
	font-size: 1em;
	font-family: 'Noto Serif', serif;
`;

const StoryBlock = ({ type, title, preview, tags, difficulty }) => {
	return (
		<StoryBlockContainer>
			<StoryType type={type}>{type}</StoryType>
			<Title>{title}</Title>
			<ContentWrapper>
				<Preview>{preview}</Preview>
				<TagContainer>
					{tags.map((tag, index) => (
						<Tag key={index}>{tag}</Tag>
					))}
				</TagContainer>
			</ContentWrapper>
			<CEFRLevel level={difficulty}>{difficulty}</CEFRLevel>
		</StoryBlockContainer>
	);
};

export default StoryBlock; 