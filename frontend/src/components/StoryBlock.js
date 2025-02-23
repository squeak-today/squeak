import {
	StoryBlockContainer,
	TopSection,
	DateText,
	Title,
	ContentWrapper,
	Preview,
	TagContainer,
	Tag
} from '../styles/components/StoryBlockStyles';

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