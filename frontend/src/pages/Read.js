import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import BasicPage from '../components/BasicPage';
import StoryReader from '../components/StoryReader';
import { useNotification } from '../context/NotificationContext';
import { ReadPageLayout, ReaderPanel, SidePanel } from '../styles/ReadPageStyles';

function Read() {
    const { type, id } = useParams();
    const [content, setContent] = useState("");
    const [sourceLanguage, setSourceLanguage] = useState('en');
    const { showNotification } = useNotification();

    useEffect(() => {
        const fetchContent = async () => {
            try {
                // Dummy data for now - will be replaced with actual endpoint
                const dummyContent = `# Sample ${type} #${id}\nThis is a sample piece of content that would normally come from the backend. Le chat est sur la table. La souris est sous la chaise. Je mange une pomme. Il fait beau aujourd'hui.`;

                // Simulate API call delay
                await new Promise(resolve => setTimeout(resolve, 500));
                
                setContent(dummyContent);
                setSourceLanguage('fr'); // Hardcoded for now
            } catch (error) {
                console.error('Error fetching content:', error);
                showNotification('Failed to load content. Please try again later.', 'error');
            }
        };

        fetchContent();
    }, [type, id, showNotification]);

    const handleWordClick = async (e, word, sourceLang) => {
        // Placeholder for word click handler
        console.log(`Clicked word: ${word} in ${sourceLang}`);
    };

    return (
        <BasicPage>
            <ReadPageLayout>
                <ReaderPanel>
                    <StoryReader 
                        data={content} 
                        handleWordClick={handleWordClick}
                        sourceLanguage={sourceLanguage}
                    />
                </ReaderPanel>
                <SidePanel>
                    {/* Future content will go here */}
                </SidePanel>
            </ReadPageLayout>
        </BasicPage>
    );
}

export default Read; 