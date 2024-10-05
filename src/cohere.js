/**
 * cohere.js
 * 
 * Description: Helper for Cohere functions
 */

export async function generateStory(apiKey, topic, language = 'French', CEFR = 'B2', useful_words = []) {
    try {
      const response = await fetch('https://api.cohere.com/v1/chat', {
        method: 'POST',
        headers: {
          'Authorization': `bearer ${apiKey}`, // Use lowercase `bearer`
          'Content-Type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify({
          chat_history: [
            {
              role: 'SYSTEM',
              message: `You are Squeak, an LLM designed to write short stories or news stories. 
              The nature of the story is dependent on CEFR, LANGUAGE, TOPIC, and USEFUL WORDS.
              You must write your story in the LANGUAGE on TOPIC using at least one of the USEFUL WORDS translated without sacrificing story quality.
              The difficulty of the story MUST be understandable to the CEFR provided.
              You should provide the story without preamble or other comment.`
            }
          ],
          message: `LANGUAGE: ${language}\nCEFR: ${CEFR}\nTOPIC: ${topic || 'a general topic'}\nUSEFUL WORDS: ${useful_words.join(', ')}`,
          connectors: [] // Optional: include any connectors if needed, e.g., {"id": "web-search"}
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response from Cohere API:", errorData);
        throw new Error(`Request failed with status ${response.status}: ${JSON.stringify(errorData)}`);
      }
  
      const data = await response.json();
      return data.text;
    } catch (error) {
      console.error("Error generating story:", error);
      return null;
    }
  }
  