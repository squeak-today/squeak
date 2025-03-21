import React from 'react';
import styled from 'styled-components';
import { theme } from 'shared';

const VideoContainer = styled.video`
  width: ${(props) => props.width || "100%"};
  height: auto;
  border-radius: 12px;
  box-shadow: ${theme.elevation.base};
`;

const DemoVideo = ({ src, width }) => {
  return (
    <VideoContainer key={src}width={width} autoPlay loop muted playsInline>
      <source src={src} type="video/mp4" />
      Your browser does not support the video tag.
    </VideoContainer>
  );
};

export default DemoVideo; 