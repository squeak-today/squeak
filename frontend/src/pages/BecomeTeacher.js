import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';
import { AuthBox, AuthContainer, AuthTitle, AuthText, AuthButton } from '../styles/AuthPageStyles';
import { useNotification } from '../context/NotificationContext';
import BasicPage from '../components/BasicPage';

function BecomeTeacher() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const apiBase = process.env.REACT_APP_API_BASE;

  const handleBecomeTeacher = async () => {
    setLoading(true);
    try {
      // Get the current session (teacher must already be logged in)
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        showNotification("You must be logged in to become a teacher.", "error");
        navigate('/teacher/auth/login');
        return;
      }
      const jwt = session.access_token;
      // Call the classroom creation endpoint
      const res = await fetch(`${apiBase}teacher/classroom/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwt}`,
        },
        // You can adjust the initial students_count as needed
        body: JSON.stringify({ students_count: 0 }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        showNotification(errorData.error || "Failed to create classroom", "error");
      } else {
        showNotification("Classroom created successfully!", "success");
        navigate('/teacher/dashboard');
      }
    } catch (error) {
      console.error("Error creating classroom:", error);
      showNotification("Error creating classroom.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BasicPage>
      <AuthBox>
        <AuthContainer>
          <AuthTitle>Become a Teacher</AuthTitle>
          <AuthText>
            It looks like you haven't set up a teacher account yet.
          </AuthText>
          <AuthText>
            To start teaching, please create your classroom.
          </AuthText>
          <AuthButton onClick={handleBecomeTeacher} disabled={loading}>
            {loading ? 'Creating Classroom...' : 'Create Classroom'}
          </AuthButton>
        </AuthContainer>
      </AuthBox>
    </BasicPage>
  );
}

export default BecomeTeacher;
