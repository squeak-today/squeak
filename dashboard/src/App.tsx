import './App.css';
import { theme } from 'shared'

function App() {
  console.log(theme.colors.text.primary);
  return (
    <div>
      <h1 style={{ fontFamily: theme.typography.fontFamily.primary }}>Squeak Dashboard</h1>
      <p style={{ fontFamily: theme.typography.fontFamily.secondary }}>
        Welcome to the Squeak Dashboard. We're working to migrate existing teacher and admin features to this platform soon, so stay tuned!
      </p>
    </div>
  );
}

export default App;
