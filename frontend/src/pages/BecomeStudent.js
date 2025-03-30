import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  AuthBox,
  AuthContainer,
  AuthTitle,
  AuthText,
  AuthButton,
} from "../styles/AuthPageStyles";
import {
  ClassroomInput
} from "../styles/BecomeStudentStyles";
import BasicPage from "../components/BasicPage";
import { useNotification } from "../context/NotificationContext";

import { useStudentAPI } from "../hooks/useStudentAPI";
import { usePlatform } from "../context/PlatformContext";

function BecomeStudent() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [classroomID, setClassroomID] = useState("");
  // Flag to indicate we've checked the student's status
  const [statusChecked, setStatusChecked] = useState(false);
  const apiBase = process.env.REACT_APP_API_BASE;
  const [isInitializing, setIsInitializing] = useState(true);
  const { checkRoles } = usePlatform();
  const { jwtToken } = useAuth();
  const { getStudentStatus, joinClassroom } = useStudentAPI();

  // Check if the student already exists (i.e. has a classroom)
  useEffect(() => {
    const init = async () => {
      if (!isInitializing) return;
      setLoading(true);
      try {
        if (!jwtToken) {
          showNotification(
            "You must be logged in to join a classroom.",
            "error"
          );
          navigate("/login");
          return;
        }
        const data = await getStudentStatus();
        // If a classroom_id exists, the student has already joined a classroom.
        if (data.classroom_id) {
          navigate("/learn");
          return;
        }
      } catch (error) {
        console.error("Error checking student status:", error);
        showNotification("Error checking student status.", "error");
        navigate("/learn");
      } finally {
        setStatusChecked(true);
        console.log("Status checked");
        setLoading(false);
        setIsInitializing(false);
      }
    };

    init();
  }, [jwtToken, apiBase, navigate, getStudentStatus, showNotification]);

  // Handler to join a classroom
  const handleJoinClassroom = async () => {
    setLoading(true);
    try {
      await joinClassroom({ classroom_id: classroomID });
      showNotification("Successfully joined classroom!", "success");
      navigate("/learn");
    } catch (error) {
      console.error("Error joining classroom:", error);
      showNotification("Error joining classroom.", "error");
    } finally {
      await checkRoles();
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
            Ask your teacher for the Squeak Classroom ID. After, you can start reading any content your teacher has approved!
          </AuthText>
          <ClassroomInput
            type="text"
            placeholder="Classroom ID"
            value={classroomID}
            onChange={(e) => setClassroomID(e.target.value)}
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
