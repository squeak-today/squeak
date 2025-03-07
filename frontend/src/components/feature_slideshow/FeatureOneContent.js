import React from 'react';
import {
  Container,
  Subtitle,
  LevelsList,
  LevelRow,
  Level,
  LevelInfo,
  LevelName,
  Example
} from '../../styles/components/feature_slideshow/FeatureOneContentStyles';

const FeatureOneContent = () => {
  const levels = [
    { cefr: 'A1', name: 'Beginner', example: 'Bonjour, je m\'appelle Marie.' },
    { cefr: 'A2', name: 'Elementary', example: 'J\'aime beaucoup la musique française.' },
    { cefr: 'B1', name: 'Intermediate', example: 'Je voudrais réserver une table pour ce soir.' },
    { cefr: 'B2', name: 'Upper Intermediate', example: 'Il faut que nous prenions des mesures contre le changement climatique.' },
    { cefr: 'C1', name: 'Advanced', example: 'Les enjeux économiques sont au cœur du débat politique.' },
    { cefr: 'C2', name: 'Proficient', example: 'La complexité inhérente à cette problématique nécessite une analyse approfondie.' },
  ];

  return (
    <Container>
      <Subtitle>Tailored to each student's skill level</Subtitle>
      <LevelsList>
        {levels.map(({ cefr, name, example }) => (
          <LevelRow key={cefr}>
            <Level cefr={cefr}>{cefr}</Level>
            <LevelInfo>
              <LevelName>{name}</LevelName>
              <Example>{example}</Example>
            </LevelInfo>
          </LevelRow>
        ))}
      </LevelsList>
    </Container>
  );
};

export default FeatureOneContent; 