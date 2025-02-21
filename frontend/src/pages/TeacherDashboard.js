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
        // Fetch initial stories (default filters: language=any, cefr=any, subject=any, page=1, pagesize=6)
        fetchStories(jwt, 'any', 'any', 'any', 1, 6);
      } catch (error) {
        console.error("Error:", error);
        showNotification("Error verifying teacher or fetching data.", "error");
      } finally {
        setLoading(false);
      }
    }

    async function fetchStories(jwt, language, cefr, subject, page, pagesize) {
      try {
        const queryParams = new URLSearchParams({ language, cefr, subject, page, pagesize }).toString();
        const storyRes = await fetch(`${apiBase}story/query?${queryParams}`, {
          headers: { 'Authorization': `Bearer ${jwt}` },
        });
        const newsRes = await fetch(`${apiBase}news/query?${queryParams}`, {
          headers: { 'Authorization': `Bearer ${jwt}` },
        });
        const storyData = storyRes.ok ? await storyRes.json() : [];
        const newsData = newsRes.ok ? await newsRes.json() : [];
        const merged = [
          ...storyData.map(item => ({ 
            ...item, 
            content_type: 'Story', 
            id: Number(item.id),
            // Use learn.js mapping for tags
            language: item.language,
            topic: item.topic,
            cefr_level: item.cefr_level,
            preview_text: item.preview_text,
            date_created: item.date_created
          })),
          ...newsData.map(item => ({ 
            ...item, 
            content_type: 'News', 
            id: Number(item.id),
            language: item.language,
            topic: item.topic,
            cefr_level: item.cefr_level,
            preview_text: item.preview_text,
            date_created: item.date_created
          })),
        ];
        setStories(merged);
      } catch (error) {
        console.error("Error fetching stories:", error);
        showNotification("Error fetching stories.", "error");
      }
    }

    verifyTeacherAndFetch();
  }, [apiBase, navigate, showNotification]);

  const handleParamsSelect = (language, cefr, subject, page, pagesize) => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      const jwt = session.access_token;
      fetchStories(jwt, language, cefr, subject, page, pagesize);
    });
  };

  // Note: Using the same fetchStories function from above.
  const fetchStories = async (jwt, language, cefr, subject, page, pagesize) => {
    try {
      const queryParams = new URLSearchParams({ language, cefr, subject, page, pagesize }).toString();
      const storyRes = await fetch(`${apiBase}story/query?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${jwt}` },
      });
      const newsRes = await fetch(`${apiBase}news/query?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${jwt}` },
      });
      const storyData = storyRes.ok ? await storyRes.json() : [];
      const newsData = newsRes.ok ? await newsRes.json() : [];
      const merged = [
        ...storyData.map(item => ({ 
          ...item, 
          content_type: 'Story', 
          id: Number(item.id),
          language: item.language,
          topic: item.topic,
          cefr_level: item.cefr_level,
          preview_text: item.preview_text,
          date_created: item.date_created
        })),
        ...newsData.map(item => ({ 
          ...item, 
          content_type: 'News', 
          id: Number(item.id),
          language: item.language,
          topic: item.topic,
          cefr_level: item.cefr_level,
          preview_text: item.preview_text,
          date_created: item.date_created
        })),
      ];
      setStories(merged);
    } catch (error) {
      console.error("Error fetching stories:", error);
      showNotification("Error fetching stories.", "error");
    }
  };

  const handleViewContent = (story) => {
    navigate(`/teacher/read/${story.content_type.toLowerCase()}/${story.id}`);
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
        body: JSON.stringify({ content_type: story.content_type, content_id: story.id }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to accept content');
      }
      showNotification("Story accepted successfully", "success");
      // Remove accepted story from list.
      setStories(prev => prev.filter(s => s.id !== story.id));
    } catch (error) {
      console.error("Error accepting story:", error);
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

        <DateHeader>Whitelist News Articles</DateHeader>
        <TeacherStoryBrowser 
          stories={stories}
          onParamsSelect={handleParamsSelect}
          onStoryBlockClick={handleViewContent}
          onAccept={handleAcceptStory}
          defaultLanguage="any"
        />
      </Section>
    </BasicPage>
  );
}

export default TeacherDashboard;
