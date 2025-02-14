import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import supabase from '../lib/supabase';
import BasicPage from '../components/BasicPage';
import Screen1 from '../components/Tutorial/Screen1';
// import Screen2 from '../components/Tutorial/Screen2';
import Screen3 from '../components/Tutorial/Screen3';
import Screen4 from '../components/Tutorial/Screen4';
import Screen5 from '../components/Tutorial/Screen5';
import Screen6 from '../components/Tutorial/Screen6';
import Screen7 from '../components/Tutorial/Screen7';

function Welcome() {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [selectedLang, setSelectedLang] = useState('');
    const [formData, setFormData] = useState({
        username: '',
        learning_language: 'French',
        skill_level: 'A1',
        daily_questions_goal: 5,
        interested_topics: []
    });
    const [currentScreen, setCurrentScreen] = useState(1);

    const apiBase = process.env.REACT_APP_API_BASE;

    const handleLogout = async () => {
		try {
			await supabase.auth.signOut();
			navigate('/');
		} catch (error) {
			console.error('Error signing out:', error);
			showNotification('Error signing out. Please try again.');
		}
	};

    const handleTopics = (selectedTopics) => {
        const updatedFormData = { ...formData, interested_topics: selectedTopics };
        setFormData(updatedFormData);
        handleSubmit(updatedFormData);
    };

    const handleSubmit = async (dataToSubmit = formData) => {
        try {
          const response = await fetch(`${apiBase}profile-upsert`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
            },
            body: JSON.stringify(dataToSubmit)
          });
      
          const text = await response.text();
          let data;
          try {
            data = JSON.parse(text);
          } catch (err) {
            console.error("JSON parse error. Response text:", text);
            throw new Error("Invalid response from server");
          }
      
          if (data.error === "Username already taken") {
            showNotification('Username already taken. Please try another.', 'error');
            return false;
          }
      
          if (!response.ok) {
            throw new Error(data.error || 'Failed to create profile');
          }
      
          showNotification('Profile created successfully!', 'success');
          return true;
        } catch (error) {
          console.error('Error creating profile:', error);
          showNotification('Failed to create profile. Please try again.', 'error');
          return false;
        }
    };
      
    

    // const goToScreen2 = () => {
    //     setCurrentScreen(2);
    // };
    
    const goToScreen3 = () => {
        setCurrentScreen(3);
    };

    const goToScreen4 = (lang) => {
        setSelectedLang(lang);
        setFormData({ ...formData, learning_language: lang });
        setCurrentScreen(4);
    };
    

    const goToScreen5 = (levels) => {
        const updatedFormData = { ...formData, skill_level: levels[selectedLang] };
        setFormData(updatedFormData);
        setCurrentScreen(5);
      };

    const goToScreen6 = () => {
        setCurrentScreen(6);
    };

    const goToScreen7 = () => {
        setCurrentScreen(7);
    };

    return (
        <BasicPage showLogout onLogout={handleLogout}>
            {currentScreen === 1 && (
                <Screen1
                    username={formData.username}
                    onUsernameChange={(newUsername) => setFormData({ ...formData, username: newUsername })}
                    onNext={async () => {
                        const success = await handleSubmit();
                        if (success) {
                          goToScreen3();
                        }
                        // Otherwise, stay on Screen1 to let the user try a new username.
                    }}
                />
            )}

            {/* {currentScreen === 2 && <Screen2 onNext={goToScreen3}/>} */}
            {currentScreen === 3 && (
                <Screen3 onNext={(lang) => goToScreen4(lang)} />
            )}
            {currentScreen === 4 && (
                <Screen4 selectedLang={selectedLang} onNext={goToScreen5} />
            )}
            {currentScreen === 5 && (
                <Screen5
                    onNext={(selectedTopics) => {
                        handleTopics(selectedTopics);
                        goToScreen6();
                    }}
                />
            )}
            {currentScreen === 6 && <Screen6 sourceLanguage={selectedLang} onNext={goToScreen7} />}
            {currentScreen === 7 && <Screen7 onNext={() => navigate('/learn')} />}
        </BasicPage>
     );
}

export default Welcome;
