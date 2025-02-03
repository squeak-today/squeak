import styled from 'styled-components';

export const ReadPageLayout = styled.div`
  display: flex;
  width: 100%;
  height: calc(100vh - 80px); // Account for header height
  padding: 20px;
  gap: 20px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
    padding: 10px;
  }
`;

export const ReaderPanel = styled.div`
  flex: 1;
  max-width: 60%;
  font-family: 'Lora', serif;
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  padding: 30px;
  overflow-y: auto;

  @media (max-width: 768px) {
    max-width: 100%;
    max-height: 70vh;
  }
`;

export const SidePanel = styled.div`
  flex: 1;
  max-width: 40%;
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  padding: 20px;
  overflow-y: auto;

  @media (max-width: 768px) {
    max-width: 100%;
    margin-top: 20px;
  }
`;
