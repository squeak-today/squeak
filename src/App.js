import './App.css';
import { generateStory } from './cohere';
import { useState } from 'react';

function App() {
	const [story, setStory] = useState(''); // State to store the story
	const [loading, setLoading] = useState(false); // State to manage loading state


	const handleGenerateStory = async () => {
		setLoading(true); // Set loading state to true when fetching story
		try {
			const apiKey = process.env.REACT_APP_COHERE_API_KEY;
			const newStory = await generateStory(apiKey, 'Soccer');
			setStory(newStory); // Store the fetched story in the state
		} catch (error) {
			console.error("Error generating story:", error);
			setStory("Failed to generate story. Please try again.");
		}
		setLoading(false); // Set loading state to false when finished
	};


	return (
    	<div className="App">
			<h1>Hello World</h1>
			<button onClick={handleGenerateStory} disabled={loading}>
				{loading ? 'Generating Story...' : 'Generate Story'}
			</button>
			{story && (
				<div>
					<h2>Generated Story</h2>
					<p>{story}</p>
				</div>
			)}
    	</div>
	);
}

export default App;
