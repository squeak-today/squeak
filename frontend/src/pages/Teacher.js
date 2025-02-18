import React from "react";
import styled from "styled-components";
import wizardHat from "../assets/WizardHat.png"; // Adjust the path as needed

const MainHeading = styled.h1`
  font-family: 'Lora', serif;
  font-weight: 400;
  font-size: 3.5em;
  color: #000000;
  line-height: 1.15;
  text-align: left;
  white-space: nowrap; /* Prevent text wrapping */
  margin: 0;

  @media (max-width: 768px) {
    font-size: 2.5em;
    white-space: normal; /* Allow wrapping on mobile */
    text-align: center;
  }

  @media (max-width: 480px) {
    font-size: 2.2em;
  }
`;

const SubHeading = styled.p`
  font-family: 'Lora', serif;
  font-size: 1.5rem;
  color: #333333; /* Slightly lighter color */
  text-align: left; /* Left aligned */
  margin-top: 1vh;

  @media (max-width: 768px) {
    font-size: 1rem;
    max-width: 36ch;
    text-align: center;
    margin-left: auto; /* Center horizontally */
    margin-right: auto; /* Center horizontally */
    width: 100%;
  }
`;

const Highlight = styled.span`
  background: linear-gradient(120deg, rgba(250, 212, 143, 0.5) 0%, rgba(250, 212, 143, 0.5) 100%);
  background-repeat: no-repeat;
  background-size: 100% 40%;
  background-position: 0 60%;
  display: inline;
  padding: 0.1em 0.3em;
  box-decoration-break: clone;
`;

// Additional styled components for layout and other elements
const LandingContainer = styled.div`
  width: 100%;
  background-color: #fff;
`;

const HeroSection = styled.section`
  width: 100%;
  padding: 3rem 1rem;
  background-color: #fff; 
  display: flex;
  justify-content: center;
`;

const HeroContent = styled.div`
  max-width: 1200px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 2rem;
`;

const HeroIllustration = styled.div`
  display: flex;
  justify-content: center;
  align-items: center; // Ensure vertical alignment
`;

const WizardHat = styled.img`
  width: 250px; // Increased size
  max-width: 100%;
  height: auto; // Maintain aspect ratio
`;

const HeroText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const CTAButton = styled.a`
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: rgba(250, 212, 143, 0.5); /* Button color */
  color: #333;
  font-weight: 600;
  text-decoration: none;
  border-radius: 6px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #e0a700;
  }
`;

const TranslateFeatureSection = styled.section`
  width: 100%;
  padding: 3rem 1rem;
  display: flex;
  justify-content: center;
  background-color: #fff;
`;

// Container for the translate feature section with two columns:
// one for text and one for the translation card.
const TranslateContent = styled.div`
  max-width: 1200px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    text-align: center;
  }
`;

// Container for the heading and subheading in the translate section.
const TranslateTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
`;

const TranslationCard = styled.div`
  background-color: #2e3d38;
  color: #fdfdfd;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 2rem; /* Add some spacing from heading on mobile if needed */
  width: 100%;
`;

const TranslationCardHeading = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Arrow = styled.span`
  font-weight: normal;
  font-size: 1.2rem;
`;

const TranslationDetails = styled.div`
  p {
    margin-bottom: 0.5rem;
    
    strong {
      color: #ffefc3; /* Subtle highlight for labels */
    }
  }
`;

function Teacher() {
  return (
    <LandingContainer>
      {/* Hero Section */}
      <HeroSection>
        <HeroContent>
          <HeroIllustration>
            <WizardHat src={wizardHat} alt="Wizard Hat" />
          </HeroIllustration>
          <HeroText>
            <MainHeading>
              Squeak for <Highlight>Teachers</Highlight>
            </MainHeading>
            <SubHeading>
              Teachers, we’re here to help. Squeak is ready to support your students as they learn languages in class.
            </SubHeading>
            <CTAButton href="#">Get started as a teacher</CTAButton>
          </HeroText>
        </HeroContent>
      </HeroSection>

      {/* Translate Feature Section */}
      <TranslateFeatureSection>
        <TranslateContent>
          <TranslateTextContainer>
            <MainHeading>
              Translate with just a <Highlight>click</Highlight>
            </MainHeading>
            <SubHeading>
              No need to pull out the dictionary to learn a new word! Just click, translate, and read on.
            </SubHeading>
          </TranslateTextContainer>
          <TranslationCard>
            <TranslationCardHeading>
              Bienvenue <Arrow>→</Arrow> Welcome
            </TranslationCardHeading>
            <TranslationDetails>
              <p>
                <strong>Original:</strong> Bienvenue sur Squeak
              </p>
              <p>
                <strong>Translated:</strong> Welcome to Squeak
              </p>
            </TranslationDetails>
          </TranslationCard>
        </TranslateContent>
      </TranslateFeatureSection>
    </LandingContainer>
  );
}

export default Teacher;
