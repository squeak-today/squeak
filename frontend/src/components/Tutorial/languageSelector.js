// LanguageSelector.js
import * as React from "react";
import spanishFlag from "../../assets/vectors/spanishFlag.svg";
import frenchFlag from "../../assets/vectors/frenchFlag.svg";

function LanguageSelector({ language = "Spanish", selected, onSelectChange }) {
  // Determine flag and display name
  const isFrench = language.toLowerCase() === "french";
  const flagSrc = isFrench ? frenchFlag : spanishFlag;
  const displayName = isFrench ? "French" : "Spanish";

  const handleClick = () => {
    // Notify the parent that this language was clicked.
    if (onSelectChange) {
      onSelectChange(displayName);
    }
  };

  return (
    <div className="language-selector" onClick={handleClick}>
      <div className={`language-option ${selected ? "selected" : ""}`}>
        <img
          loading="lazy"
          src={flagSrc}
          className="language-flag"
          alt={`${displayName} flag`}
        />
        <span className="language-name">{displayName}</span>
      </div>

      <style jsx>{`
        .language-selector {
          display: flex;
          max-width: 205px;
          flex-direction: column;
          color: rgba(0, 0, 0, 1);
          white-space: nowrap;
          text-align: center;
          font-family: 'Lora', serif;
          font-weight: 400;
          font-size: 24px;
        }
        .language-option {
          border-radius: 20px;
          background-color: rgba(233, 232, 230, 1);
          display: flex;
          gap: 17px;
          padding: 10px 12px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .language-option.selected {
          background-color: #fad48f;
        }
        .language-flag {
          aspect-ratio: 1.4;
          object-fit: contain;
          object-position: center;
          width: 63px;
        }
        .language-name {
          flex-grow: 1;
          width: 88px;
          margin: auto 0;
        }
      `}</style>
    </div>
  );
}

export default LanguageSelector;
