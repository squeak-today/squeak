import React from "react";
import NextButton from "./NextButton";
import styled from "styled-components";

const Container = styled.div`
  position: relative;
  width: 100%;
  height: calc(100vh - 80px - 60px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-family: "Lora, serif";
  padding: 40px;
  box-sizing: border-box;
`;

const Heading = styled.h1`
  font-size: 40px;
  font-weight: normal;
  margin-bottom: 20px;
  text-align: center;
`;

const SubHeading = styled.p`
  font-size: 18px;
  margin-bottom: 20px;
  text-align: center;
`;

const Input = styled.input`
  border: none;
  border-radius: 10px;
  padding: 10px 15px;
  background-color: #eee;
  font-size: 16px;
  font-family: inherit;
  text-align: center;
  margin-bottom: 80px;
`;

const ButtonWrapper = styled.div`
  position: absolute;
  bottom: 10vh;
  right: 10vw;

  @media (max-width: 600px) {
    position: relative;
    bottom: 0;
    left: 0;
    right: 0;
    margin-top: 20px;
    text-align: center;
  }
`;

export default function Screen1({ onNext, username, onUsernameChange }) {
  return (
    <Container>
      <Heading>Welcome to Squeak!</Heading>
      <SubHeading>First let’s pick a display name:</SubHeading>
      <Input
        type="text"
        placeholder="Display name"
        value={username}
        onChange={(e) => onUsernameChange(e.target.value)}
      />
      <ButtonWrapper>
        <NextButton onNext={onNext} />
      </ButtonWrapper>
    </Container>
  );
}
