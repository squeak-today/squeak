import styled from 'styled-components';

export const BrowserBox = styled.div`
  width: 100%;
  height: 100%;
  margin: 2em auto 0 auto;
  padding: 20px;
  box-sizing: border-box;
  overflow: hidden;

  @media (max-width: 768px) {
    margin: 40px auto 0 auto;
    padding: 1em;
  }
`;

export const LearnPageLayout = styled.div`
  display: flex;
  gap: 1em;
  width: 100%;
  height: 100%;
  padding: 0 1em;
  box-sizing: border-box;
  justify-content: center;
  
  @media (max-width: 768px) {
    flex-direction: column-reverse;
    padding: 0;
  }
`;

export const StoryBrowserContainer = styled.div`
  flex: 1;
  min-width: 0;
  max-width: 800px;
`;

export const ProfileDashboardContainer = styled.div`
  width: 300px;
  min-width: 300px;
  max-width: 80%;
  background: white;
  border-radius: 15px;
  padding: 2em;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  height: fit-content;
  font-family: 'Lora', serif;
  
  @media (max-width: 768px) {
    width: 100%;
    min-width: unset;
    margin: 0 0 1em 0;
    padding: 1.5em;
    align-self: center;
  }
`;

export const DateHeader = styled.h1`
	font-family: 'Lora', serif;
	text-align: center;
	margin-bottom: 1em;
	font-size: 2em;
	font-weight: 600;
`;