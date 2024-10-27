


const MAP_LANG_CODES = {
    "French": 'fr',
    "Spanish": 'es'
}

export async function generateDefinition(apiKey, word, language) {
    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
    const requestBody = {
        q: word, // Word to be translated
        target: 'en', // Target language code (e.g., 'fr' for French, 'es' for Spanish),
        source: MAP_LANG_CODES[language],
        format: 'text',
    };
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
			const errorData = await response.json();
			console.error("Error response from API:", errorData);
			throw new Error(`Request failed with status ${response.status}: ${JSON.stringify(errorData)}`);
      	}

        const data = await response.json();
    	return data.data.translations[0].translatedText;
    } catch (error) {
        console.error("Error generating definition:", error);
    	return null;
    }
}