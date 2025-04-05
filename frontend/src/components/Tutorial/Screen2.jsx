// Screen2.js
import React from 'react';
import NextButton from './NextButton'; 
import topicImage from '../../assets/Topics.png';
import understandingImage from '../../assets/Understanding.png';
import translateImage from '../../assets/Translate.png';


// -- A reusable card component --------------------------------
function Card({ title, imageSrc, description }) {
  return (
    <div className="card">
      <h2 className="card-title">{title}</h2>
      <img src={imageSrc} alt="" className="card-image" />
      <p className="card-description">{description}</p>

      <style jsx>{`
        .card {
          width: 22vw;
          background-color: #fff;
          border-radius: 30px;
          box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
          padding: 32px 20px;
          text-align: center;
          font-family: 'Lora', serif;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .card-title {
          margin: 0;
          font-size: 24px;
        }
        .card-image {
          max-width: 250px;
          margin: 20px 0;
          object-fit: contain;
          object-position: center;
        }
        .card-description {
          font-size: 14px;
          line-height: 1.4;
          margin: 0;
          color: #333;
        }
      `}</style>
    </div>
  );
}

// -- The main Screen2 layout ----------------------------------
export default function Screen2({ onNext }){
  return (
    <div style={styles.container}>
      <h style={styles.heading}>Some things to try...</h>

      <div style={styles.cardRow}>
        <Card
          title="Pick your Topic"
          imageSrc={topicImage}
          description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labor."
        />
        <Card
          title="Practice"
          imageSrc={understandingImage}
          description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labor."
        />
        <Card
          title="Click to Translate"
          imageSrc={translateImage}
          description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labor."
        />
      </div>

      <div style={styles.buttonWrapper}>
        <NextButton onNext={onNext} />
      </div>
    </div>
  );
}


const styles = {
  container: {
    position: 'relative',            // so we can absolutely-position the button if desired
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px',
    fontFamily: 'Lora, serif',
    height: 'calc(100vh - 80px - 60px)',
    boxSizing: 'border-box',
  },
  heading: {
    fontSize: '36px',
    margin: '0 0 40px 0',
    textAlign: 'center',
  },
  cardRow: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
    alignItems: 'flex-start',
    flexWrap: 'wrap', // so cards wrap if screen is too narrow
    marginBottom: '60px',
  },
  buttonWrapperStyle: {
    position: "absolute",
    bottom: "10vh",
    right: "10vw"
  },
};
