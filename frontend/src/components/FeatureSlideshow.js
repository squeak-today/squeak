import React, { useState, useEffect } from 'react';
import {
  Container,
  ContentArea,
  MenuList,
  MenuItem,
  MenuTitle,
  MenuDescription,
  InlineContentArea
} from '../styles/components/FeatureSlideshowStyles';

const features = [
  {
    id: 1,
    title: "Tailored to skill level",
    description: "All content on Squeak is sorted into 6 difficulty levels for content with just the right amount of challenge.",
    content: "More details..."
  },
  {
    id: 2,
    title: "Real World Language",
    description: "Daily news articles sourced from real sources, and stories that teacher common situations, slang, and patterns.",
    content: "More details..."
  },
  {
    id: 3,
    title: "Made For Teachers",
    description: "A full platform for teachers to track their students' progress, and approve or reject content to their needs.",
    content: "More details..."
  },
  {
    id: 4,
    title: "Practical and Effective Exercises",
    description: "Students practice writing and speaking skills by answering vocabulary and understanding questions about content.",
    content: "More details..."
  },
  {
    id: 5,
    title: "Interactive Storybooks",
    description: "Stories are filled with interactive elements to learn vocabulary and grammar along the way.",
    content: "More details..."
  }
];

const CYCLE_INTERVAL = 3000; // 3 seconds

const FeatureSlideshow = () => {
  const [activeFeature, setActiveFeature] = useState(features[0]);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return; // stop cycling if user clicked a feature

    const interval = setInterval(() => {
      setActiveFeature(current => {
        const currentIndex = features.findIndex(f => f.id === current.id);
        const nextIndex = (currentIndex + 1) % features.length;
        return features[nextIndex];
      });
    }, CYCLE_INTERVAL);

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <Container>
      <MenuList>
        {features.map(feature => (
          <MenuItem 
            key={feature.id}
            $isActive={activeFeature.id === feature.id}
            onClick={() => {
              setActiveFeature(feature);
              setIsPaused(true);
            }}
          >
            <MenuTitle>{feature.title}</MenuTitle>
            <MenuDescription $isActive={activeFeature.id === feature.id}>
              {feature.description}
            </MenuDescription>
            <InlineContentArea $isActive={activeFeature.id === feature.id}>
              {activeFeature.content}
            </InlineContentArea>
          </MenuItem>
        ))}
      </MenuList>
      
      <ContentArea>
        {activeFeature.content}
      </ContentArea>
    </Container>
  );
};

export default FeatureSlideshow;