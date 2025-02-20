import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../lib/supabase";
import { useNotification } from "../context/NotificationContext";
import BasicPage from "../components/BasicPage";

function TeacherDashboard() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    async function verifyTeacher() {
      // Get current session
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        // No session found, redirect to teacher login
        navigate("/teacher/become");
        return;
      }

      const jwt = session.access_token;
      try {
        // Call your /teacher endpoint to verify if the user is a teacher
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE}teacher`,
          {
            headers: { Authorization: `Bearer ${jwt}` },
          }
        );
        const data = await response.json();

        // Your endpoint returns { exists: true/false }
        if (data.exists) {
          setAuthorized(true);
        } else {
          // User is not yet a teacher; redirect them to a page to become one.
          showNotification(
            "This account is not authorized as a teacher. Please become a teacher.",
            "error"
          );
          navigate("/teacher/become");
        }
      } catch (error) {
        console.error("Error verifying teacher:", error);
        showNotification("Error verifying teacher status.", "error");
        navigate("/teacher/become");
      } finally {
        setLoading(false);
      }
    }
    verifyTeacher();
  }, [navigate, showNotification]);

  if (loading) {
    return (
      <BasicPage>
        <p>Loading...</p>
      </BasicPage>
    );
  }

  if (!authorized) {
    return null; // In case not authorized, nothing is rendered
  }

  return (
    <BasicPage>
      <h1>Hello, world!</h1>
      {/* Add more teacher dashboard content here */}
    </BasicPage>
  );
}

export default TeacherDashboard;
