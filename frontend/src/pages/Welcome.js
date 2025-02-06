import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import supabase from '../lib/supabase';

function Welcome() {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [formData, setFormData] = useState({
        username: '',
        learning_language: 'French',
        skill_level: 'A1',
        daily_questions_goal: 5,
        interested_topics: []
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE}profile-upsert`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            
            if (data.error === "Username already taken") {
                showNotification('Username already taken. Please try another.', 'error');
                return;
            }

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create profile');
            }

            showNotification('Profile created successfully!', 'success');
            navigate('/learn');
        } catch (error) {
            console.error('Error creating profile:', error);
            showNotification('Failed to create profile. Please try again.', 'error');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Create Your Profile</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Username: </label>
                    <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                        required
                    />
                </div>
                <div>
                    <label>Language: </label>
                    <select
                        value={formData.learning_language}
                        onChange={(e) => setFormData({...formData, learning_language: e.target.value})}
                    >
                        <option value="French">French</option>
                        <option value="Spanish">Spanish</option>
                    </select>
                </div>
                <div>
                    <label>Level: </label>
                    <select
                        value={formData.skill_level}
                        onChange={(e) => setFormData({...formData, skill_level: e.target.value})}
                    >
                        <option value="A1">A1</option>
                        <option value="A2">A2</option>
                        <option value="B1">B1</option>
                        <option value="B2">B2</option>
                        <option value="C1">C1</option>
                        <option value="C2">C2</option>
                    </select>
                </div>
                <div>
                    <label>Daily Goal: </label>
                    <input
                        type="number"
                        min="0"
                        max="20"
                        value={formData.daily_questions_goal}
                        onChange={(e) => setFormData({...formData, daily_questions_goal: parseInt(e.target.value)})}
                        required
                    />
                </div>
                <button type="submit">Create Profile</button>
            </form>
        </div>
    );
}

export default Welcome; 