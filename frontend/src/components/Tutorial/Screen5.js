import React, { useState } from 'react';
import NextButton from './NextButton';

const ALL_TOPICS = ["Politics", "Technology", "Business", "Sports"];

export default function Screen5({ onNext }) {
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle clicks on a topic chip
  const handleTopicClick = (topic) => {
    setSelectedTopics((prev) => {
      if (prev.includes(topic)) {
        return prev.filter((t) => t !== topic);
      }
      return [...prev, topic];
    });
    // Clear any error message once the user makes a selection
    setErrorMessage('');
  };

  const handleNextClick = () => {
    if (selectedTopics.length === 0) {
      setErrorMessage("Please select at least one topic before continuing.");
      return;
    }
    setErrorMessage('');
    onNext(selectedTopics);
  };

  return (
    <div style={styles.container}>
      <h style={styles.heading}>Help us tailor your experience</h>
      <p style={styles.subheading}>
        Select all the topics that seem interesting to you...
      </p>

      {/* On-screen error message */}
      {errorMessage && <div style={styles.error}>{errorMessage}</div>}

      <div style={styles.topicsWrapper}>
        {ALL_TOPICS.map((topic) => {
          const isSelected = selectedTopics.includes(topic);
          return (
            <div
              key={topic}
              style={{
                ...styles.topicChip,
                backgroundColor: isSelected ? "#FAD48F" : "#fff",
                border: isSelected ? "2px solid #f5c168" : "1px solid #ccc",
              }}
              onClick={() => handleTopicClick(topic)}
            >
              {topic}
            </div>
          );
        })}
      </div>

      <div className="buttonWrapper" style={styles.buttonWrapper}>
        <NextButton onNext={handleNextClick} />
      </div>

      <style jsx>{`
        @media (max-width: 600px) {
          .buttonWrapper {
            left: 50% !important;
            right: auto !important;
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    position: "relative",
    width: "100%",
    minHeight: "calc(100vh - 80px - 60px)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Lora, serif",
    padding: "40px",
    boxSizing: "border-box",
  },
  heading: {
    fontSize: "32px",
    margin: "0 0 10px 0",
    textAlign: "center",
  },
  subheading: {
    fontSize: "20px",
    margin: "20px 0 10px 0",
    textAlign: "center",
    color: "#555",
  },
  error: {
    fontSize: "20px",
    backgroundColor: "#f0f0f0",
    borderRadius: "10px",
    padding: "10px",
    marginBottom: "20px",
    textAlign: "center",
    color: "red",
  },
  topicsWrapper: {
    display: "flex",
    flexWrap: "wrap",
    gap: "30px",
    justifyContent: "center",
    width: "100%",
    maxWidth: "800px",
    marginTop: "20px",
  },
  topicChip: {
    cursor: "pointer",
    borderRadius: "40px",
    padding: "10px 30px",
    fontSize: "18px",
    transition: "all 0.2s",
  },
  buttonWrapper: {
    position: "absolute",
    bottom: "10vh",
    right: "10vw",
  },
};
