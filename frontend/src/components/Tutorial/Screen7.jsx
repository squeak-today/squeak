import React from 'react';
import NextButton from './NextButton';
import styled from 'styled-components';

export default function Screen7({ onNext }) {
  return (
    <div style={styles.container}>
      <h style={styles.heading}>Happy Learning!</h>
      <div style={styles.textContainer}>
        <p style={styles.paragraph}>
          {"Language learning is a journey, and we’re thrilled to be a part of yours!  Our goal is to help you learn through stories you love, making every step of the way enjoyable.\n\n"}
          {"If you ever have questions, need support, or want to suggest a new feature, we’d love to hear from you. Your feedback helps us improve and create the best possible experience for all learners.\n\n"}
          {"Thank you for being part of the Squeak community—we can’t wait to see what you achieve!\n\n\n"}
          {"Cheers,\n\n "}
          <span style={{ fontStyle: "italic" }}>Connor, Jonathan, Pranav, Saai </span>
        </p>
      </div>
      <ButtonWrapper>
        <NextButton onNext={onNext} />
      </ButtonWrapper>
    </div>
  );
}

const ButtonWrapper = styled.div`
  position: absolute;
  bottom: 10vh;
  right: 10vw;

  @media (max-width: 600px) {
    position: absolute;
    bottom: 0;
    left: 50%;
    right: auto;
    transform: translateX(-50%);
    margin-bottom: 5vh;
  }
`;

const styles = {
  container: {
    position: "relative",
    width: "100%",
    minHeight: "calc(100vh - 80px - 60px)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center", // Vertically centers all text content
    alignItems: "center",
    fontFamily: "Lora, serif",
    padding: "40px",
    boxSizing: "border-box",
  },
  heading: {
    fontSize: "32px",
    margin: "0 0 10px 0",
    textAlign: "center",
  },
  textContainer: {
    width: "100%",
    maxWidth: "800px", // Limits the width
    margin: "20px auto 60px auto",
  },
  paragraph: {
    fontSize: "20px",
    textAlign: "left",
    color: "#444",
    whiteSpace: "pre-line",
  },
};


