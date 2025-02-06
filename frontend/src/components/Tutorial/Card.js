import * as React from "react";
import styles from './Card.css';

export default function Card() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Title</h2>
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/587f3dc0e32e472e9e3543cb539c36f1/21b783f57da6476841d7dc4f1476fed9258bb275b9616a452b2aa71cd6714cc4?apiKey=587f3dc0e32e472e9e3543cb539c36f1&"
          className={styles.cardImage}
          alt="Card illustration"
        />
        <p className={styles.description}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
          ad minim veniam, quis nost
        </p>
      </div>
    </div>
  );
}