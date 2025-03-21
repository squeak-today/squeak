import React from 'react';
import {
  AuthContainer,
  AuthBox,
  Title,
  Button,
  ButtonContainer
} from '../styles/AuthPageStyles';

function Auth() {
  return (
    <AuthContainer>
      <AuthBox>
        <Title>Squeak Dashboard</Title>
        <ButtonContainer>
          <Button>I have an account</Button>
          <Button>I'm a new teacher</Button>
          <Button>I'm a new admin</Button>
        </ButtonContainer>
      </AuthBox>
    </AuthContainer>
  );
}

export default Auth; 