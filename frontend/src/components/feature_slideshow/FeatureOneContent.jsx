import React from 'react';
import {
  Container,
  Subtitle,
  LevelsList,
  LevelRow,
  Level,
  LevelInfo,
  Example
} from '../../styles/components/feature_slideshow/FeatureOneContentStyles';

const FeatureOneContent = () => {
  const levels = [
    { cefr: 'A1', example: 'Bonjour, je m\'appelle Marie.' },
    { cefr: 'A2', example: 'J\'aime beaucoup la musique française.' },
    { cefr: 'B1', example: 'Je voudrais réserver une table pour ce soir.' },
    { cefr: 'B2', example: 'Il faut que nous prenions des mesures contre le changement climatique.' },
    { cefr: 'C1', example: 'Les enjeux économiques sont au cœur du débat politique.' },
    { cefr: 'C2', example: 'La complexité inhérente à cette problématique nécessite une analyse approfondie.' },
  ];

  return (
    <Container>
      <Subtitle>Tailored to each student's skill level</Subtitle>
      <LevelsList>
        {levels.map(({ cefr, example }) => (
          <LevelRow key={cefr}>
            <Level cefr={cefr}>{cefr}</Level>
            <LevelInfo>
              <Example>{example}</Example>
            </LevelInfo>
          </LevelRow>
        ))}
      </LevelsList>
    </Container>
  );
};

export default FeatureOneContent; 