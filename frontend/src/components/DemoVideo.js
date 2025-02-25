import React from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';

const VideoContainer = styled.video`
  width: 100%;
  height: auto;
  border-radius: 12px;
  box-shadow: ${theme.elevation.base};
`;

const DemoVideo = ({ src }) => {
  return (
    <VideoContainer autoPlay loop muted playsInline>
      <source src={src} type="video/mp4" />
      Your browser does not support the video tag.
    </VideoContainer>
  );
};

export default DemoVideo; 