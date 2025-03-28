import styled from 'styled-components';

export const ReadPageLayout = styled.div`
  display: flex;
  width: 100%;
  height: calc(100vh - 160px);
  padding: 20px;
  gap: 20px;
  box-sizing: border-box;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
    padding: 10px;
  }
`;

export const ReaderPanel = styled.div`
  flex: 2;
  font-family: 'Lora', serif;
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  padding: 30px;
  overflow-y: auto;
  max-height: calc(100vh - 120px);

  @media (max-width: 768px) {
    max-width: 100%;
    max-height: 70vh;
  }
`;

export const SidePanelContainer = styled.div`
    flex: 1;
    background: white;
    border-radius: 15px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow-y: auto;
    max-height: calc(100vh - 120px);
`;

export const TabContainer = styled.div`
    display: flex;
    margin-bottom: 20px;
    border-bottom: 1px solid #e0e0e0;
    width: 100%;
`;

export const Tab = styled.button`
    flex: 1;
    padding: 10px 20px;
    border: none;
    background: none;
    cursor: pointer;
    font-family: 'Lora', serif;
    font-size: 1.1em;
    color: ${props => props.$active ? '#000' : '#666'};
    border-bottom: 2px solid ${props => props.$active ? '#000' : 'transparent'};
    transition: all 0.2s ease;

    &:hover {
        color: #000;
    }
`;

export const ContentSection = styled.div`
    margin-bottom: 20px;
    font-family: 'Lora', serif;
`;

export const TagsContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 15px;
    font-family: 'Lora', serif;
`;

export const Tag = styled.span`
    background: ${props => props.type === 'cefr' ? props.color : '#f0f0f0'};
    padding: 6px 12px;
    border-radius: 15px;
    font-size: 0.9em;
    font-family: 'Lora', serif;
`;

export const InfoText = styled.p`
    color: #666;
    font-size: 0.9em;
    margin: 8px 0;
    font-family: 'Lora', serif;
`;

export const ButtonGroup = styled.div`
    display: flex;
    gap: 10px;
    margin-top: 20px;
`;

export const ShareButton = styled.button`
    padding: 8px 16px;
    border: 1px solid #4a90e2;
    border-radius: 8px;
    background: white;
    color: #4a90e2;
    cursor: pointer;
    font-family: 'Lora', serif;
    min-width: 80px;
    white-space: nowrap;

    &:hover {
        background: #f5f9ff;
    }
`;

export const ReportButton = styled.button`
    padding: 8px 16px;
    border: 1px solid #ff4444;
    border-radius: 8px;
    background: white;
    color: #ff4444;
    cursor: pointer;
    font-family: 'Lora', serif;
    min-width: 80px;
    white-space: nowrap;

    &:hover {
        background: #fff5f5;
    }
`;

export const UnderstandingButton = styled.button`
    width: 80%;
    padding: 12px 20px;
    background: #D4F7D4;
    border: none;
    border-radius: 25px;
    font-family: 'Lora', serif;
    font-size: 1.2em;
    cursor: pointer;
    margin: 0 auto 20px;
    display: block;
    transition: background 0.2s;

    &:hover {
        background: #C1E8C1;
    }
`;

export const ItalicInfoText = styled(InfoText)`
    font-style: italic;
`;

export const LearnContentContainer = styled.div`
    padding: 20px 0;
    font-family: 'Lora', serif;
    width: 90%;
    margin: 0 auto;
`;

export const GoalSelect = styled.select`
    width: 100%;
    padding: 10px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-family: 'Lora', serif;
    font-size: 1em;
    margin-bottom: 15px;
    background: white;
    cursor: pointer;

    &:focus {
        outline: none;
        border-color: #D4F7D4;
    }
`;

export const SetGoalButton = styled(UnderstandingButton)`
    width: auto;
    padding: 8px 16px;
    font-size: 1em;
    margin: 0;
    display: inline-block;
`;

export const Label = styled.label`
    display: block;
    margin-bottom: 8px;
    color: #666;
    font-family: 'Lora', serif;
`;

export const QuestionContainer = styled.div`
    margin: 20px 0;
`;

export const QuestionHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
`;

export const QuestionText = styled.div`
    font-family: 'Lora', serif;
    font-weight: bold;
`;

export const QuestionInput = styled.textarea`
    width: calc(100% - 16px);
    padding: 8px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-family: 'Lora', serif;
    margin-top: 8px;
    resize: ${props => props.$isVocab ? 'none' : 'vertical'};
    height: ${props => props.$isVocab ? '40px' : '80px'};
    border-color: ${props => {
        if (props.$evaluated) {
            return props.$passed ? '#90EE90' : '#FFB6C1';
        }
        return '#e0e0e0';
    }};

    &:focus {
        outline: none;
        border-color: #D4F7D4;
    }
`;

export const CEFRTag = styled(Tag)`
    font-size: 0.8em;
    padding: 4px 8px;
`;

export const CheckAnswersButton = styled(SetGoalButton)`
    margin-top: 20px;
    width: 100%;
`;

export const ExplanationText = styled.div`
    margin-top: 10px;
    padding: 12px 16px;
    border-radius: 8px;
    font-family: 'Lora', serif;
    font-size: 0.9em;
    line-height: 1.5;
    background-color: ${props => props.$passed ? '#D4F7D4' : '#FFE8E8'};
    color: ${props => props.$passed ? '#2E7D32' : '#D32F2F'};
`;

export const BackButton = styled.button`
    margin: 20px 20px 0 20px;
    padding: 8px 16px;
    background: white;
    border: 1px solid #505050;
    border-radius: 8px;
    font-family: 'Lora', serif;
    font-size: 0.9em;
    color: black;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s ease;

    &:hover {
        background: #f5f5f5;
        color: #333;
    }
`;

export const InputContainer = styled.div`
    display: flex;
    align-items: center;
    width: 100%;
`;