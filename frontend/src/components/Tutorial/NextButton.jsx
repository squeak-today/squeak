// NextButton.js
export default function NextButton({ onNext }) {
  return (
    <>
      <button className="continue-button" onClick={onNext}>
        Continue <span className="arrow">&rarr;</span>
      </button>

      <style jsx>{`
        .continue-button {
          font-family: 'Lora', serif;
          font-size: 20px;
          background-color: #fad48f;
          border: none;
          border-radius: 10px;
          padding: 10px 20px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .continue-button .arrow {
          font-size: 16px;
          line-height: 1;
        }
        .continue-button:hover {
          background-color: rgb(250, 217, 155);
        }
        .continue-button:focus {
          outline: 2px solid #fad48f;
        }
      `}</style>
    </>
  );
}
