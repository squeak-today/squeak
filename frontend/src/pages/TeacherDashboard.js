import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';
import { useNotification } from '../context/NotificationContext';
import BasicPage from '../components/BasicPage';
import TeacherStoryBrowser from '../components/TeacherStoryBrowser';
import {
  Section,
  ToggleButton,
  ButtonContainer,
  DateHeader,
  ClassroomInfoContainer,
  ClassroomInfoText
} from '../styles/TeacherDashboardPageStyles';

const formatDate = () => {
	const date = new Date();
	const month = date.toLocaleDateString('en-US', { month: 'long' });
	const day = date.getDate();
	const year = date.getFullYear();

	const getOrdinal = (n) => {
		if (n > 3 && n < 21) return 'th';
		switch (n % 10) {
			case 1: return 'st';
			case 2: return 'nd';
			case 3: return 'rd';
			default: return 'th';
		}
	};

	return `${month} ${day}${getOrdinal(day)}, ${year}`;
};

function TeacherDashboard() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [classroomInfo, setClassroomInfo] = useState(null);
  const [stories, setStories] = useState([]);
  const [showClassroomInfo, setShowClassroomInfo] = useState(true);
  const apiBase = process.env.REACT_APP_API_BASE;

  useEffect(() => {
    async function verifyTeacherAndFetch() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/teacher/become');
        return;
      }
      const jwt = session.access_token;
      try {
        // Verify teacher status.
        const res = await fetch(`${apiBase}teacher`, {
          headers: { 'Authorization': `Bearer ${jwt}` },
        });
        const data = await res.json();
        if (!data.exists) {
          showNotification("This account is not authorized as a teacher. Please become a teacher.", "error");
          navigate('/teacher/become');
          return;
        }
        // Fetch classroom info.
        const classroomRes = await fetch(`${apiBase}teacher/classroom`, {
          headers: { 'Authorization': `Bearer ${jwt}` },
        });
        if (!classroomRes.ok) throw new Error('Failed to fetch classroom info');
        const classroomData = await classroomRes.json();
        setClassroomInfo(classroomData);
        // Fetch initial content (default filters)
        fetchContent(jwt, 'any', 'any', 'any', 1, 6, 'accepted');
      } catch (error) {
        console.error("Error:", error);
        showNotification("Error verifying teacher or fetching data.", "error");
      } finally {
        setLoading(false);
      }
    }

    verifyTeacherAndFetch();
  }, [apiBase, navigate]);

  const handleParamsSelect = (language, cefr, subject, page, pagesize, whitelist) => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      const jwt = session.access_token;
      fetchContent(jwt, language, cefr, subject, page, pagesize, whitelist);
    });
  };

  const fetchContent = async (jwt, language, cefr, subject, page, pagesize, whitelist) => {
    try {
      const queryParams = new URLSearchParams({ 
        language, 
        cefr, 
        subject, 
        page, 
        pagesize,
        whitelist,
        content_type: 'All'
      }).toString();

      const res = await fetch(`${apiBase}teacher/classroom/content?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${jwt}` },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch content');
      }

      const contentData = await res.json();
      setStories(contentData); // API already returns items with content_type field
    } catch (error) {
      console.error("Error fetching content:", error);
      showNotification("Error fetching content.", "error");
    }
  };

  const handleViewContent = (story) => {
    navigate(`/read/${story.content_type.toLowerCase()}/${story.id}`, {
        state: {
            backTo: '/teacher',
            backText: 'Back to Teacher Dashboard'
        }
    });
  };

  const handleLogout = async () => {
    try {
        await supabase.auth.signOut();
        navigate('/');
    } catch (error) {
        console.error('Error signing out:', error);
        showNotification('Error signing out. Please try again.');
    }
};

  const handleAcceptStory = async (story) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      showNotification("You are not logged in.", "error");
      return;
    }
    const jwt = session.access_token;
    try {
      const res = await fetch(`${apiBase}teacher/classroom/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify({ 
          content_type: story.content_type, 
          content_id: parseInt(story.id, 10)
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to accept content');
      }
      showNotification("Story accepted successfully", "success");
      setStories(prev => prev.filter(s => s.id !== story.id));
    } catch (error) {
      console.error("Error accepting story:", error);
      showNotification(error.message, "error");
    }
  };

  const handleRejectStory = async (story) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      showNotification("You are not logged in.", "error");
      return;
    }
    const jwt = session.access_token;
    console.log({ 
      content_type: story.content_type, 
      content_id: parseInt(story.id, 10)
    });
    try {
      const res = await fetch(`${apiBase}teacher/classroom/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify({ 
          content_type: story.content_type, 
          content_id: parseInt(story.id, 10)
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to reject content');
      }
      showNotification("Story rejected successfully", "success");
      setStories(prev => prev.filter(s => s.id !== story.id));
    } catch (error) {
      console.error("Error rejecting story:", error);
      showNotification(error.message, "error");
    }
  };

  if (loading)
    return (
      <BasicPage>
        <p>Loading Dashboard...</p>
      </BasicPage>
    );

  return (
    <BasicPage showLogout onLogout={handleLogout}>
      <Section>
        <Section>
          <ButtonContainer>
            <ToggleButton onClick={() => setShowClassroomInfo(prev => !prev)}>
              {showClassroomInfo ? 'Hide Classroom Info' : 'Show Classroom Info'}
            </ToggleButton>
          </ButtonContainer>
          {showClassroomInfo && classroomInfo && (
            <ClassroomInfoContainer>
              <ClassroomInfoText>
                <strong>Classroom ID:</strong> {classroomInfo.classroom_id}
              </ClassroomInfoText>
              <ClassroomInfoText>
                <strong>Students Count:</strong> {classroomInfo.students_count}
              </ClassroomInfoText>
            </ClassroomInfoContainer>
          )}
        </Section>

        <DateHeader>Manage Classroom Content</DateHeader>
        <TeacherStoryBrowser 
          stories={stories}
          onParamsSelect={handleParamsSelect}
          onStoryBlockClick={handleViewContent}
          onAccept={handleAcceptStory}
          onReject={handleRejectStory}
          defaultLanguage="any"
        />
      </Section>
    </BasicPage>
  );
}

export default TeacherDashboard;
