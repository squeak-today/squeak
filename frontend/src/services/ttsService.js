import supabase from '../lib/supabase';

const apiBase = process.env.REACT_APP_API_BASE;

export const ttsService = {
  async textToSpeech(text, languageCode, voiceName) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const jwt = session?.access_token;
      
      if (!jwt) {
        throw new Error("No valid JWT token found");
      }

      const response = await fetch(`${apiBase}audio/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify({
          text,
          language_code: languageCode,
          voice_name: voiceName
        })
      });

      if (!response.ok) {
        throw new Error(`TTS API error: ${response.status}`);
      }

      const result = await response.json();
      return result.audio_content; // Base64 encoded audio content

    } catch (error) {
      console.error('TTS error:', error);
      throw error;
    }
  }
}; 