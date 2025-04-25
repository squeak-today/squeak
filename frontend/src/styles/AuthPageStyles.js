// AuthStyles.js

import styled from 'styled-components';
import { FcGoogle } from 'react-icons/fc';
import { FaApple } from 'react-icons/fa';

// Wrapper for the entire auth box
export const AuthBox = styled.div`
  width: 100%;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
`;


export const AuthText = styled.p`
  text-align: center;
  font-family: 'Lora', serif;
  margin: 0.5rem 0;
`;

// A centered container with a white background and slight shadow
export const AuthContainer = styled.div`
  width: 100%;
  max-width: 400px;
  background: #fff;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border-radius: 10px;
  padding: 2rem;
  box-sizing: border-box;
`;

// A large heading for "Welcome back!"
export const AuthTitle = styled.h2`
  font-family: 'Lora', serif;
  text-align: center;
  font-size: 1.8rem;
  margin-bottom: 1rem;
`;

// The two big social-login buttons (Apple, Google)
export const SocialButton = styled.button`
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 0.75rem;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Lora', serif;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background-color: #f8f8f8;
  }

  svg {
    margin-right: 8px;
    font-size: 1.2rem;
  }
`;

// A horizontal separator with text in the middle
export const Separator = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1.5rem 0;

  &::before,
  &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid #ccc;
  }
  &::before {
    margin-right: 0.75rem;
  }
  &::after {
    margin-left: 0.75rem;
  }
`;

export const SeparatorText = styled.span`
  color: #999;
  font-size: 0.9rem;
`;

// The email/password form
export const AuthForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: stretch; /* ensures inputs fill the container’s width */
  width: 100%;
  /* text-align: center; if you want text content centered */
`;

// Inputs
export const AuthInput = styled.input`
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 0.75rem;
  background-color: #fff;
  font-family: 'Lora', serif;
  font-size: 1rem;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #aaa;
  }
`;


// The main submit button
export const AuthButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-family: 'Lora', serif;
  font-size: 1rem;
  transition: background 0.2s ease;
  margin-top: 0.5rem;

  &:hover {
    background-color: #f8f8f8;
  }

  &:disabled {
    background: #eee;
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

// A smaller link-style button for “Forgot password?” or “Sign up”
export const AuthLink = styled.button`
  background: none;
  border: none;
  color: #666;
  text-decoration: underline;
  cursor: pointer;
  font-family: 'Lora', serif;
  font-size: 0.9rem;
  padding: 0;

  &:hover {
    color: #333;
  }
`;

// You can use these icons in your SocialButton:
export const GoogleIcon = styled(FcGoogle)``;
export const AppleIcon = styled(FaApple)``;
