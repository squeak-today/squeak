import React, { useRef, useState } from 'react';
import { FaMicrophone, FaStop } from 'react-icons/fa';
import { VoiceInputButton } from '../styles/components/RecordButtonStyles';
import { InlineSpinner } from './LoadingSpinner';

interface RecordButtonProps {
    onRecordingComplete: (base64Audio: string, id: number) => Promise<void>;
    onError: (message: string, type?: string) => void;
    id: number;
    loading?: boolean;
}

const RecordButton: React.FC<RecordButtonProps> = ({ 
    onRecordingComplete, 
    onError,
    id,
    loading = false
}) => {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            const options = {
                mimeType: 'audio/webm;codecs=opus'
            };
            
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                console.log('WebM/Opus not supported, using browser default');
                mediaRecorderRef.current = new MediaRecorder(stream);
            } else {
                mediaRecorderRef.current = new MediaRecorder(stream, options);
            }
            
            audioChunksRef.current = [];
            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                }
            };
            
            mediaRecorderRef.current.onstop = async () => {
                const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
                const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
                const reader = new FileReader();
                reader.onloadend = async () => {
                    try {
                        const base64Audio = reader.result?.toString().split(',')[1]; // rm data URL prefix
                        
                        if (base64Audio) {
                            await onRecordingComplete(base64Audio, id);
                        } else {
                            onError('Failed to process audio', 'error');
                        }
                    } catch (error) {
                        console.error('Audio processing failed:', error);
                        onError('Failed to process audio. Please try again.', 'error');
                    }
                    
                    setIsRecording(false);
                };
                
                reader.readAsDataURL(audioBlob);
            };
            
            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            onError('Could not access microphone. Please check permissions.', 'error');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const toggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    return (
        <VoiceInputButton 
            onClick={toggleRecording}
            type="button"
            disabled={loading}
        >
            {loading ? <InlineSpinner size="18px" borderWidth="2px" /> : isRecording ? <FaStop /> : <FaMicrophone />}
        </VoiceInputButton>
    );
};

export default RecordButton; 