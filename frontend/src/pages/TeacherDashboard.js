

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';
import { useNotification } from '../context/NotificationContext';
import BasicPage from '../components/BasicPage';
import styled from 'styled-components';
import { BrowserBox, LearnPageLayout, DateHeader } from '../styles/LearnPageStyles';

const Section = styled.section`
  margin-bottom: 2.5rem;
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-family: 'Lora', serif;
  font-size: 1.75rem;
  color: #333;
  margin: 0;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
`;

const ContentCard = styled.div`
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  cursor: pointer;
  transition: transform 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  position: relative;

  &:hover {
    transform: translateY(-2px);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ContentType = styled.span`
  font-family: 'Lora', serif;
  font-size: 0.875rem;
  color: #666;
  text-transform: uppercase;
`;

const ContentId = styled.span`
  font-family: 'Lora', serif;
  font-size: 0.875rem;
  color: #888;
`;

const ContentTitle = styled.h3`
  font-family: 'Lora', serif;
  font-size: 1.25rem;
  color: #333;
  margin: 0.5rem 0;
`;

const ContentDescription = styled.p`
  font-family: 'Lora', serif;
  font-size: 1rem;
  color: #666;
  line-height: 1.4;
  margin: 0.5rem 0;
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
`;

const Button = styled.button`
  font-family: 'Lora', serif;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background-color: ${props => props.variant === 'primary' ? '#3c8dbb' : '#f0f0f0'};
  color: ${props => props.variant === 'primary' ? 'white' : '#333'};

  &:hover {
    background-color: ${props => props.variant === 'primary' ? '#2a6a8a' : '#e0e0e0'};
  }
`;

const CheckboxContainer = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 2;
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 1.2rem;
  height: 1.2rem;
  cursor: pointer;
`;

const ClassroomInfo = styled.div`
  background: #f8f9fa;
  border-radius: 10px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  font-family: 'Lora', serif;

  p {
    margin: 0.5rem 0;
    color: #444;
  }
`;

const PaginationContainer = styled.div`
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  gap: 0.5rem;
`;

function TeacherDashboard() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [classroomInfo, setClassroomInfo] = useState(null);
  const [showClassroomInfo, setShowClassroomInfo] = useState(false);
  const [pendingContent, setPendingContent] = useState([]);
  const [rejectedContent, setRejectedContent] = useState([]);
  const [selectedPending, setSelectedPending] = useState(new Set());
  const [selectedRejected, setSelectedRejected] = useState(new Set());
  const [authorized, setAuthorized] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const apiBase = process.env.REACT_APP_API_BASE;

  // Verify teacher status and fetch data.
  useEffect(() => {
    async function verifyTeacher() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/teacher/become');
        return;
      }
      const jwt = session.access_token;
      try {
        // Verify teacher status using your /teacher endpoint.
        const response = await fetch(`${apiBase}teacher`, {
          headers: { 'Authorization': `Bearer ${jwt}` },
        });
        const data = await response.json();
        if (data.exists) {
          setAuthorized(true);
        } else {
          showNotification("This account is not authorized as a teacher. Please become a teacher.", "error");
          navigate('/teacher/become');
          return;
        }
        fetchData(jwt);
      } catch (error) {
        console.error("Error verifying teacher:", error);
        showNotification("Error verifying teacher status.", "error");
        navigate('/teacher/become');
      } finally {
        setLoading(false);
      }
    }

    async function fetchData(jwt) {
      setLoading(true);
      try {
        // Fetch classroom info.
        const classroomRes = await fetch(`${apiBase}teacher/classroom`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        if (!classroomRes.ok) throw new Error('Failed to fetch classroom info');
        const classroomData = await classroomRes.json();
        setClassroomInfo(classroomData);

        // Fetch available content from stories and news endpoints.
        const [storyRes, newsRes] = await Promise.all([
          fetch(`${apiBase}story/query`, { headers: { Authorization: `Bearer ${jwt}` } }),
          fetch(`${apiBase}news/query`, { headers: { Authorization: `Bearer ${jwt}` } }),
        ]);
        const stories = storyRes.ok ? await storyRes.json() : [];
        const news = newsRes.ok ? await newsRes.json() : [];
        // Merge and tag content; ensure id is numeric.
        const mergedContent = [
          ...stories.map(item => ({ ...item, content_type: 'Story', id: Number(item.id) })),
          ...news.map(item => ({ ...item, content_type: 'News', id: Number(item.id) })),
        ];
        // Assume that all available content is accepted initially.
        setPendingContent(mergedContent);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        showNotification('Error fetching dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    }

    verifyTeacher();
  }, [apiBase, navigate, showNotification]);

  // Compute displayed content using client-side pagination.
  const totalPages = Math.ceil(pendingContent.length / pageSize);
  const displayedPendingContent = pendingContent.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Sync all pending content into accepted_content table.
  const handleSyncAccepted = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      showNotification("You are not logged in.", "error");
      return;
    }
    const jwt = session.access_token;
    for (let item of pendingContent) {
      try {
        const res = await fetch(`${apiBase}teacher/classroom/accept`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwt}`,
          },
          body: JSON.stringify({ content_type: item.content_type, content_id: item.id }),
        });
        if (!res.ok) {
          // Ignore errors if the record already exists.
          console.warn(`Sync accept failed for item ${item.id}`);
        }
      } catch (error) {
        console.error(error);
      }
    }
    showNotification("All available content synced as accepted.", "success");
  };

  // Handle checkbox toggles for pending items.
  const togglePendingSelection = (id) => {
    setSelectedPending(prev => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  // Handle checkbox toggles for rejected items.
  const toggleRejectedSelection = (id) => {
    setSelectedRejected(prev => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  // Bulk action: Reject selected pending content.
  const handleBulkReject = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      showNotification('You are not logged in.', 'error');
      return;
    }
    const jwt = session.access_token;
    const itemsToReject = pendingContent.filter(item => selectedPending.has(item.id));
    for (let item of itemsToReject) {
      try {
        const res = await fetch(`${apiBase}teacher/classroom/reject`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwt}`,
          },
          body: JSON.stringify({ content_type: item.content_type, content_id: item.id }),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to reject content');
        }
        // On success, move item from pending to rejected list.
        setRejectedContent(prev => [...prev, item]);
        setPendingContent(prev => prev.filter(i => i.id !== item.id));
      } catch (error) {
        showNotification(error.message, 'error');
      }
    }
    setSelectedPending(new Set());
  };

  // Bulk action: Accept selected rejected content.
  const handleBulkAccept = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      showNotification('You are not logged in.', 'error');
      return;
    }
    const jwt = session.access_token;
    const itemsToAccept = rejectedContent.filter(item => selectedRejected.has(item.id));
    for (let item of itemsToAccept) {
      try {
        const res = await fetch(`${apiBase}teacher/classroom/accept`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwt}`,
          },
          body: JSON.stringify({ content_type: item.content_type, content_id: item.id }),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to accept content');
        }
        // On success, move item from rejected back to pending list.
        setPendingContent(prev => [...prev, item]);
        setRejectedContent(prev => prev.filter(i => i.id !== item.id));
      } catch (error) {
        showNotification(error.message, 'error');
      }
    }
    setSelectedRejected(new Set());
  };

  // Single action for viewing a content item.
  const handleViewContent = (item) => {
    navigate(`/teacher/content/${item.content_type.toLowerCase()}/${item.id}`);
  };

  if (loading)
    return (
      <BasicPage>
        <p>Loading Dashboard...</p>
      </BasicPage>
    );

  return (
    <BasicPage>
      <BrowserBox>
        <LearnPageLayout>
          <div style={{ gridColumn: '1 / -1' }}>
            <Section>
              <SectionHeader>
                <SectionTitle>Classroom Management</SectionTitle>
                <Button 
                  onClick={() => setShowClassroomInfo(prev => !prev)}
                  variant="primary"
                >
                  {showClassroomInfo ? 'Hide Info' : 'Show Info'}
                </Button>
              </SectionHeader>
              
              {showClassroomInfo && classroomInfo && (
                <ClassroomInfo>
                  <p><strong>Classroom ID:</strong> {classroomInfo.classroom_id}</p>
                  <p><strong>Students:</strong> {classroomInfo.students_count}</p>
                </ClassroomInfo>
              )}

              <ActionBar>
                <Button 
                  onClick={handleSyncAccepted}
                  variant="primary"
                >
                  Sync All Content
                </Button>
              </ActionBar>
            </Section>

            <Section>
              <SectionHeader>
                <SectionTitle>Pending Content</SectionTitle>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {selectedPending.size > 0 && (
                    <Button onClick={handleBulkReject}>Reject Selected</Button>
                  )}
                </div>
              </SectionHeader>

              {displayedPendingContent.length > 0 ? (
                <ContentGrid>
                  {displayedPendingContent.map(item => (
                    <ContentCard key={`${item.content_type}-${item.id}`}>
                      <CheckboxContainer>
                        <Checkbox
                          checked={selectedPending.has(item.id)}
                          onChange={() => togglePendingSelection(item.id)}
                        />
                      </CheckboxContainer>
                      
                      <CardHeader>
                        <ContentType>{item.content_type}</ContentType>
                        <ContentId>#{item.id}</ContentId>
                      </CardHeader>
                      
                      {item.title && <ContentTitle>{item.title}</ContentTitle>}
                      {item.description && (
                        <ContentDescription>{item.description}</ContentDescription>
                      )}
                      
                      <ActionBar>
                        <Button 
                          onClick={() => handleViewContent(item)}
                          variant="primary"
                        >
                          Review
                        </Button>
                      </ActionBar>
                    </ContentCard>
                  ))}
                </ContentGrid>
              ) : (
                <p>No pending content found.</p>
              )}

              {totalPages > 1 && (
                <PaginationContainer>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    style={{ backgroundColor: currentPage === page ? '#2a6a8a' : undefined }}
                    >
                    {page}
                    </Button>
                ))}
                </PaginationContainer>
              )}
            </Section>

            <Section>
              <SectionHeader>
                <SectionTitle>Rejected Content</SectionTitle>
                {selectedRejected.size > 0 && (
                  <Button onClick={handleBulkAccept}>Accept Selected</Button>
                )}
              </SectionHeader>

              {rejectedContent.length > 0 ? (
                <ContentGrid>
                  {rejectedContent.map(item => (
                    <ContentCard key={`${item.content_type}-${item.id}`}>
                      <CheckboxContainer>
                        <Checkbox
                          checked={selectedRejected.has(item.id)}
                          onChange={() => toggleRejectedSelection(item.id)}
                        />
                      </CheckboxContainer>
                      
                      {/* Same card structure as pending content */}
                      
                    </ContentCard>
                  ))}
                </ContentGrid>
              ) : (
                <p>No rejected content found.</p>
              )}
            </Section>
          </div>
        </LearnPageLayout>
      </BrowserBox>
    </BasicPage>
  );
}

export default TeacherDashboard;
