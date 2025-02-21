import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../lib/supabase";
import {
  AuthBox,
  AuthContainer,
  AuthTitle,
  AuthText,
  AuthButton,
} from "../styles/AuthPageStyles";
import BasicPage from "../components/BasicPage";
import { useNotification } from "../context/NotificationContext";

function BecomeStudent() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [classroomID, setClassroomID] = useState("");
  // Flag to indicate we've checked the student's status
  const [statusChecked, setStatusChecked] = useState(false);
  const apiBase = process.env.REACT_APP_API_BASE;

  // Check if the student already exists (i.e. has a classroom)
  useEffect(() => {
    const checkStudentStatus = async () => {
      setLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          showNotification(
            "You must be logged in to join a classroom.",
            "error"
          );
          navigate("/login");
          return;
        }
        const jwt = session.access_token;
        const res = await fetch(`${apiBase}student`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        if (res.ok) {
          const data = await res.json();
          // If a classroom_id exists, the student has already joined a classroom.
          if (data.classroom_id) {
            navigate("/learn");
            return;
          }
        } else {
          // Handle any errors from checking status if needed.
          console.error("Error checking student status");
        }
      } catch (error) {
        console.error("Error checking student status:", error);
        showNotification("Error checking student status.", "error");
      } finally {
        setStatusChecked(true);
        setLoading(false);
      }
    };

    checkStudentStatus();
  }, [apiBase, navigate, showNotification]);

  // Handler to join a classroom
  const handleJoinClassroom = async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        showNotification(
          "You must be logged in to join a classroom.",
          "error"
        );
        navigate("/login");
        return;
      }
      const jwt = session.access_token;
      const res = await fetch(`${apiBase}student/classroom/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({ classroom_id: classroomID }),
      });

      const resData = await res.json();
      if (!res.ok) {
        showNotification(resData.error || "Failed to join classroom", "error");
      } else {
        showNotification("Successfully joined classroom!", "success");
        navigate("/learn");
      }
    } catch (error) {
      console.error("Error joining classroom:", error);
      showNotification("Error joining classroom.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Wait for the status check before rendering the join UI
  if (!statusChecked) {
    return (
      <BasicPage>
        <AuthBox>
          <AuthContainer>
            <AuthTitle>Loading...</AuthTitle>
          </AuthContainer>
        </AuthBox>
      </BasicPage>
    );
  }

  return (
    <BasicPage>
      <AuthBox>
        <AuthContainer>
          <AuthTitle>Join a Classroom</AuthTitle>
          <AuthText>
            It appears you haven't joined a classroom yet. Enter your Classroom
            ID below to join and start learning.
          </AuthText>
          <input
            type="text"
            placeholder="Classroom ID"
            value={classroomID}
            onChange={(e) => setClassroomID(e.target.value)}
            style={{ padding: "8px", margin: "10px 0", width: "100%" }}
          />
          <AuthButton
            onClick={handleJoinClassroom}
            disabled={loading || !classroomID}
          >
            {loading ? "Joining Classroom..." : "Join Classroom"}
          </AuthButton>
        </AuthContainer>
      </AuthBox>
    </BasicPage>
  );
}

export default BecomeStudent;
