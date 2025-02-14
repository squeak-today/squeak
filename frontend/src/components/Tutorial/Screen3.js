// Screen3.js
import React, { useState } from 'react';
import NextButton from './NextButton';
import LanguageSelector from './languageSelector';

export default function Screen3({ onNext }) {
  // Use a string to store the selected language.
  const [selectedLang, setSelectedLang] = useState('');

  const handleLanguageChange = (lang) => {
    setSelectedLang(lang);
  };

  return (
    <div style={styles.container}>
      <h style={styles.heading}>Which language are you trying to learn?</h>
      <p style={styles.subheading}>
        Select the language you are trying to learn...
      </p>

      <div style={styles.languageRow}>
        <LanguageSelector
          language="Spanish"
          selected={selectedLang === "Spanish"}
          onSelectChange={handleLanguageChange}
        />
        <LanguageSelector
          language="French"
          selected={selectedLang === "French"}
          onSelectChange={handleLanguageChange}
        />
      </div>

      <div style={styles.buttonWrapper}>
        <NextButton
          disabled={!selectedLang}  // Disable if nothing is selected
          onNext={() => {
            if (selectedLang) {
              onNext(selectedLang);
            }
          }}
        />
      </div>
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
    margin: '0 0 10px 0',
    textAlign: 'center',
  },
  subheading: {
    fontSize: '20px',
    margin: '20px 0 40px 0',
    textAlign: 'center',
    color: '#555',
  },
  languageRow: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: '60px',
    width: '100%',
    maxWidth: '600px',
  },
  buttonWrapper: {
    position: 'absolute',
    bottom: '10vh',
    right: '10vw',
  },
};
