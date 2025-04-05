import React, { useState } from 'react';
import NextButton from './NextButton';
import spanishFlag from '../../assets/vectors/spanishFlag.svg';
import frenchFlag from '../../assets/vectors/frenchFlag.svg';

const skillLevels = [
  { code: 'A1', label: 'Beginner',     color: '#BDF6C6', desc: "I'm just starting to learn" },
  { code: 'A2', label: 'Elementary',   color: '#BDF6C6', desc: "I understand some words" },
  { code: 'B1', label: 'Intermediate', color: '#FDF8B2', desc: "I understand most words" },
  { code: 'B2', label: 'Competent',    color: '#FDF8B2', desc: "I am comfortable and fluent" },
  { code: 'C1', label: 'Advanced',     color: '#FFE6A5', desc: "I'm something of an expert" },
  { code: 'C2', label: 'Proficient',   color: '#FFC6C6', desc: "I'm an expert and confident" },
];

export default function Screen4({ selectedLang, onNext }) {
  const [level, setLevel] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Fallback if no language is selected.
  if (!selectedLang) {
    return (
      <div style={styles.container}>
        <h style={styles.heading}>No language selected!</h>
        <div style={styles.buttonWrapper}>
          <NextButton onNext={() => onNext && onNext({})} />
        </div>
      </div>
    );
  }

  const flagSrc =
    selectedLang.toLowerCase() === 'french' ? frenchFlag : spanishFlag;

  const handleSelectLevel = (levelCode) => {
    setLevel(levelCode);
    // Clear any error message when the user makes a selection.
    setErrorMessage('');
  };

  const handleNextClick = () => {
    if (!level) {
      setErrorMessage("Please select a skill level before continuing.");
      return;
    }
    onNext({ [selectedLang]: level });
  };

  return (
    <div style={styles.container}>
      <h style={styles.heading}>
        Where would you rank your {selectedLang} skill level?
      </h>

      {/* Render the error message if there is one */}
      {errorMessage && <div style={styles.error}>{errorMessage}</div>}

      <div style={styles.langBlock}>
        <div style={styles.langHeader}>
          <img
            src={flagSrc}
            alt={`${selectedLang} flag`}
            style={styles.langFlag}
          />
          <span style={styles.langLabel}>{selectedLang}</span>
        </div>
      </div>

      <div style={styles.levelsGrid} className="levelsGrid">
        {skillLevels.map((levelItem) => {
          const isSelected = level === levelItem.code;
          return (
            <div
              key={levelItem.code}
              onClick={() => handleSelectLevel(levelItem.code)}
              className="levelCard"
              style={{
                ...styles.levelCard,
                boxShadow: isSelected
                  ? '0 0 0 2px #fad48f inset'
                  : '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <div
                style={{ ...styles.levelBadge, backgroundColor: levelItem.color }}
              >
                {levelItem.code} : {levelItem.label}
              </div>
              <div style={styles.levelDesc}>{levelItem.desc}</div>
            </div>
          );
        })}
      </div>

      <div style={styles.buttonWrapper} className="buttonWrapper">
        <NextButton onNext={handleNextClick} />
      </div>

      <style jsx>{`
        /* Desktop: show items in a row */
        .levelCard {
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
        }
        /* Mobile: stack items in a column */
        @media (max-width: 600px) {
          .levelCard {
            flex-direction: column;
            justify-content: center;
          }
          .buttonWrapper {
            left: 50% !important;
            right: auto !important;
            transform: translateX(-50%) !important;
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    width: '100%',
    minHeight: 'calc(100vh - 80px - 60px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontFamily: 'Lora, serif',
    padding: '40px',
    boxSizing: 'border-box',
  },
  heading: {
    fontSize: '32px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  error: {
    color: 'red',
    fontSize: '20px',
    backgroundColor: 'rgba(233,232,230,1)',
    borderRadius: '10px',
    padding: '10px 20px 10px 20px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  langBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  langHeader: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(233,232,230,1)',
    borderRadius: '20px',
    padding: '10px 12px',
    gap: '17px',
    marginBottom: '20px',
  },
  langFlag: {
    width: '63px',
    objectFit: 'contain',
    objectPosition: 'center',
  },
  langLabel: {
    flexGrow: 1,
    width: '88px',
    margin: 'auto 0',
    fontSize: '24px',
  },
  levelsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '15vh',
  },
  levelCard: {
    cursor: 'pointer',
    backgroundColor: '#fff',
    borderRadius: '20px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    transition: 'box-shadow 0.2s',
  },
  levelBadge: {
    color: '#333',
    borderRadius: '10px',
    padding: '8px 12px',
    fontSize: '18px',
    textAlign: 'center',
  },
  levelDesc: {
    color: '#333',
    fontSize: '18px',
    textAlign: 'center',
  },
  buttonWrapper: {
    position: 'absolute',
    bottom: '10vh',
    right: '10vw',
  },
};
