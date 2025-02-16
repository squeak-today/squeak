import supabase from '../lib/supabase';

const apiBase = process.env.REACT_APP_API_BASE;

export const translationService = {
  async translate(content, source, target = 'en') {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const jwt = session?.access_token;
      
      if (!jwt) {
        throw new Error("No valid JWT token found");
      }

      const response = await fetch(`${apiBase}translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify({
          sentence: content,
          source,
          target
        })
      });

      if (!response.ok) {
        throw new Error(`Translation API error: ${response.status}`);
      }

      const responseText = await response.text();
      
      if (!responseText.trim()) {
        throw new Error('Empty response from translation API');
      }

      const result = JSON.parse(responseText);
      return result.sentence ? result.sentence.toString() : content;

    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  }
}; 