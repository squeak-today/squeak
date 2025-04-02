import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TransitionWrapper } from '../styles/PageTransition';
import {
  OrgContainer,
  OrgBox,
  Title,
  Subtitle,
  OrgButton,
  ButtonContainer,
  HintText,
  ToggleLink
} from '../styles/OrgPageStyles';
import { AuthInput } from '../styles/AuthPageStyles';
import LoadingScreen from '../components/LoadingScreen';
import { useOrganizationAPI } from '../hooks/useOrganizationAPI';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

type OrgMode = 'create' | 'join';

function Org() {
  const { org_id } = useParams<{ org_id?: string }>();
  const navigate = useNavigate();
  const { createOrganization, joinOrganization, isAuthenticated, getOrganization } = useOrganizationAPI();
  const { showNotification } = useNotification();
  const { isLoading: authLoading } = useAuth();
  const [mode, setMode] = useState<OrgMode>(org_id ? 'join' : 'create');
  const [isLoading, setIsLoading] = useState(true);
  const [organizationId, setOrganizationId] = useState(org_id || '');

  useEffect(() => {
    const checkStatus = async () => {
      if (!isAuthenticated) {
        navigate(org_id ? `/auth/${org_id}` : '/auth');
        return;
      }
      
      try {
        const { error } = await getOrganization();
        if (!error) {
          navigate('/');
          return;
        }
      } catch (error) {
        console.error('Error checking organization:', error);
      }
      
      setIsLoading(false);
    };
    
    if (!authLoading) {
      checkStatus();
    }
  }, [authLoading, isAuthenticated, navigate, getOrganization, org_id]);

  const handleCreateOrg = async () => {
    setIsLoading(true);
    try {
      const { error } = await createOrganization();
      if (error) {
        showNotification(error.error || 'Failed to create organization', 'error');
        setIsLoading(false);
        return;
      }
      showNotification('Organization created successfully!', 'success');
      navigate('/');
    } catch (error) {
      console.error('Error creating organization:', error);
      showNotification('An error occurred while creating the organization', 'error');
      setIsLoading(false);
    }
  };

  const handleJoinOrg = async () => {
    const idToUse = org_id || organizationId;
    
    if (!idToUse) {
      showNotification('Please enter an organization ID', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await joinOrganization({ organization_id: idToUse });
      if (error) {
        showNotification('Failed to join organization, double check the link or ID.', 'error');
        navigate('/org');
        setIsLoading(false);
        return;
      }
      showNotification('Successfully joined organization!', 'success');
      navigate('/');
    } catch (error) {
      console.error('Error joining organization:', error);
      showNotification('An error occurred while joining the organization', 'error');
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'create' ? 'join' : 'create');
  };

  if (isLoading || authLoading) {
    return (
      <LoadingScreen />
    );
  }

  return (
    <TransitionWrapper $isLeaving={false}>
      <OrgContainer>
        <OrgBox>
          {mode === 'join' ? (
            <>
              <Title>Join Organization</Title>
              {org_id ? (
                <Subtitle>You've been invited!</Subtitle>
              ) : (
                <ButtonContainer>
                  <AuthInput
                    type="text"
                    placeholder="Enter Organization ID"
                    value={organizationId}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOrganizationId(e.target.value)}
                    required
                  />
                </ButtonContainer>
              )}
              <ButtonContainer>
                <OrgButton onClick={handleJoinOrg} disabled={isLoading}>
                  {isLoading ? 'Joining...' : 'Join'}
                </OrgButton>
              </ButtonContainer>
              <ToggleLink onClick={toggleMode}>
                I want to create my own organization
              </ToggleLink>
            </>
          ) : (
            <>
              <Title>Create Organization</Title>
              <ButtonContainer>
                <OrgButton onClick={handleCreateOrg} disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Organization'}
                </OrgButton>
              </ButtonContainer>
              <HintText>
                Your account will become the administrator for this organization.
              </HintText>
              <ToggleLink onClick={toggleMode}>
                I want to join an organization
              </ToggleLink>
            </>
          )}
        </OrgBox>
      </OrgContainer>
    </TransitionWrapper>
  );
}

export default Org; 