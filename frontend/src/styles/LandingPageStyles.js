import styled from 'styled-components';

export const HomeContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  max-width: 75%;
  height: 82vh;
  margin: 0 auto;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    justify-content: center;
    max-width: 90%;
    height: auto;
    padding: 20px;
  }
`;

export const TextContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  max-width: 50%;

  @media (max-width: 768px) {
    max-width: 95%;
  }
`;

export const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (max-width: 768px) {
    align-items: center;
    justify-content: center;
    width: 100%;
  }
`;

export const SubHeading = styled.p`
  font-family: 'Lora', serif;
  font-size: 1.5rem;
  color: #333333;
  text-align: left;
  margin-top: 1vh;

  @media (max-width: 768px) {
    font-size: 1rem;
    max-width: 36ch;
    text-align: center;
    margin-left: auto;
    margin-right: auto;
    width: 100%;
  }
`;

export const MainHeading = styled.h1`
  font-family: 'Lora', serif;
  font-weight: 400;
  font-size: 3.5em;
  color: #000000;
  line-height: 1.15;
  max-width: 14ch;
  text-align: left;
  white-space: normal;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 2.5em;
    max-width: 20ch;
    text-align: center;
  }

  @media (max-width: 480px) {
    font-size: 2.2em;
    max-width: 24ch;
    text-align: center;
  }
`;

export const SmallText = styled.p`
  font-family: 'Lora', serif;
  font-weight: 400;
  font-size: 1.1em;
  color: #575757;
  text-decoration: underline;
  cursor: pointer;
`;

export const LandingImage = styled.img`
  height: auto;
  max-height: 25em;
  aspect-ratio: 1 / 1;

  @media (max-width: 768px) {
    order: -1;
    width: 80%;
    margin: 0 auto;
  }
`;

export const Highlight = styled.span`
  background: linear-gradient(120deg, rgba(250, 212, 143, 0.5) 0%, rgba(250, 212, 143, 0.5) 100%);
  background-repeat: no-repeat;
  background-size: 100% 40%;
  background-position: 0 60%;
  display: inline;
  padding: 0.1em 0.3em;
  box-decoration-break: clone;
`;

export const TeacherSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 60vh;
  padding: 3rem 0;
`;

export const TeacherContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4rem;
  max-width: 75%;
  width: 100%;
  margin: 0 auto;

  @media (max-width: 768px) {
    flex-direction: column-reverse;
    text-align: center;
    gap: 2rem;
  }
`;

export const TeacherTextContent = styled(TextContent)``;

export const WizardHat = styled.img`
  width: 250px;
  max-width: 100%;
  height: auto;
`;

export const TranslateFeatureSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 60vh;
  padding: 3rem 0;
`;

export const TranslateContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4rem;
  max-width: 75%;
  width: 100%;
  margin: 0 auto;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 2rem;
  }
`;

export const TranslationCard = styled.div`
  background-color: #2e3d38;
  color: #fdfdfd;
  border-radius: 8px;
  padding: 1.5rem;
  width: 100%;
`;

export const TranslationCardHeading = styled.h3`
  font-size: 1.5rem;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const Arrow = styled.span`
  font-weight: normal;
  font-size: 1.2rem;
`;

export const TranslationDetails = styled.div`
  p {
    margin-bottom: 0.5rem;
    
    strong {
      color: #ffefc3;
    }
  }
`;

export const HeroButton = styled.button`
  width: 8em;
  aspect-ratio: 7 / 1.5;
  font-family: 'Lora', serif;
  font-size: 1.5em;
  border-radius: 10px;
  background: #fad48f;
  border: none;
  color: #000000;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-decoration: none;

  &:hover {
    background: #f3c87d;
  }

  @media (max-width: 768px) {
    font-size: 1.5em;
    aspect-ratio: 7 / 1.5;
    max-width: 40vw;
  }

  @media (max-width: 480px) {
    width: 100%;
    font-size: 1.5em;
    aspect-ratio: 7 / 1.5;
    max-height: 2.5em;
    max-width: 192px;
  }
`;

export const TeacherHeroButton = styled(HeroButton)`
  width: 12.5em;
  height: 2em;
  font-size: 1.5em;
  white-space: nowrap;

  @media (max-width: 768px) {
    width: auto;
    padding: 0 2em;
    font-size: 1.2em;
    max-width: 80vw;
  }

  @media (max-width: 480px) {
    padding: 0 1.5em;
    font-size: 1.1em;
    max-width: 90vw;
  }
`;

export const TeacherHeading = styled(MainHeading)`
  max-width: 20ch;
  font-size: 3.2em;

  @media (max-width: 768px) {
    font-size: 2.3em;
    max-width: 24ch;
  }
`;

export const TranslateHeading = styled(MainHeading)`
  font-size: 3.2em;

  @media (max-width: 768px) {
    font-size: 2.4em;
    max-width: 22ch;
  }
`; 