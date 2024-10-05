import logo from './logo.svg';
import './App.css';
import { generateStory } from './cohere';

console.log(await generateStory(process.env.REACT_APP_COHERE_API_KEY, 'Soccer'));

function App() {
  console.log("Component is rendering...");
  return (
    <div className="App">
      <h1>
        hello world
      </h1>
    </div>
  );
}

export default App;
