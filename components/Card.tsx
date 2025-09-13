import React, { useState, useRef, useCallback } from 'react';
import { LearningItem, Category } from '../types';
import { speak } from '../services/speechService';
import { checkPronunciation } from '../services/geminiService';

interface CardProps {
  item: LearningItem;
  category: Category;
}

// SVG Icons
const SoundIcon: React.FC<{className: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path>
    </svg>
);

const MicrophoneIcon: React.FC<{className: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.42 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.3 6-6.72h-1.7z"></path>
    </svg>
);

const CheckIcon: React.FC<{className: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"></path>
    </svg>
);

const CloseIcon: React.FC<{className: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"></path>
    </svg>
);

const Loader: React.FC<{className: string}> = ({className}) => (
    <div className={`animate-spin rounded-full border-t-2 border-b-2 border-white ${className}`}></div>
);


const Card: React.FC<CardProps> = ({ item, category }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState<'correct' | 'incorrect' | 'idle'>('idle');
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const handleSpeak = useCallback(() => {
        if (isRecording || isVerifying) return;
        if (category === Category.ENGLISH_ALPHABET || category === Category.ENGLISH_NUMBERS) {
            speak(item.character, 'en-US');
            if(item.word) {
                setTimeout(() => speak(item.word as string, 'en-US'), 500);
            }
        } else {
            speak(item.character, 'bn-BD');
            if(item.word) {
                setTimeout(() => speak(item.word as string, 'bn-BD'), 700);
            }
        }
    }, [item, category, isRecording, isVerifying]);

    const playErrorSound = () => {
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);

            gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.5);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            console.error("Could not play error sound", e);
        }
    };

    const handleVerificationResult = (isCorrect: boolean) => {
        setIsVerifying(false);
        const status = isCorrect ? 'correct' : 'incorrect';
        setVerificationStatus(status);
        if (!isCorrect) {
            playErrorSound();
        }
        setTimeout(() => setVerificationStatus('idle'), 2500); // Reset after 2.5 seconds
    };

    const startRecording = async () => {
        if (isRecording || isVerifying) return;
        setVerificationStatus('idle'); // Clear previous status
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            audioChunksRef.current = [];
            
            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                  audioChunksRef.current.push(event.data);
                }
            };
            
            mediaRecorderRef.current.onstop = async () => {
                stream.getTracks().forEach(track => track.stop()); // Stop microphone access
                setIsRecording(false);
                if (audioChunksRef.current.length === 0) return;

                setIsVerifying(true);
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                // We check the pronunciation of the character, or the word if it's simpler (e.g., English numbers)
                const textToCheck = (category === Category.ENGLISH_NUMBERS && item.word) ? item.word : item.character;
                const isCorrect = await checkPronunciation(audioBlob, textToCheck);
                handleVerificationResult(isCorrect);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error('Error starting recording:', err);
            alert('Could not start recording. Please ensure microphone permissions are granted and that your browser supports audio recording.');
            setIsRecording(false);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        // Also handle cases where recording might not have started but state is true
        if (isRecording) {
           setIsRecording(false);
        }
    };

    return (
        <div className="relative group bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-in-out flex flex-col items-center p-4 border-b-4 border-teal-500 dark:border-teal-400">
            {verificationStatus !== 'idle' && (
                 <div className="absolute top-2 right-2 z-10 p-1 bg-white/80 dark:bg-slate-900/80 rounded-full shadow-lg">
                    {verificationStatus === 'correct' && <CheckIcon className="w-8 h-8 text-green-500" />}
                    {verificationStatus === 'incorrect' && <CloseIcon className="w-8 h-8 text-red-500" />}
                </div>
            )}
            
            <div className="w-full aspect-square bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden mb-4">
                <img src={item.image} alt={item.word || item.character} className="w-full h-full object-cover"/>
            </div>
          
            <h3 className="text-5xl md:text-6xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                {item.character}
            </h3>
          
            {item.word && (
                <p className="text-lg font-semibold text-teal-600 dark:text-teal-300">{item.word}</p>
            )}

            {item.englishPronunciation && (
                <p className="text-sm text-slate-500 dark:text-slate-400">{item.englishPronunciation}</p>
            )}
      
            <div className="flex items-center justify-center gap-4 mt-4">
                <button 
                    onClick={handleSpeak} 
                    className="bg-teal-500 text-white rounded-full p-3 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 dark:focus:ring-offset-slate-800 transition-colors disabled:bg-gray-400"
                    aria-label={`Listen to ${item.character}`}
                    disabled={isRecording || isVerifying}
                >
                    <SoundIcon className="w-6 h-6" />
                </button>
                <button
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                    onMouseLeave={stopRecording}
                    onTouchStart={startRecording}
                    onTouchEnd={stopRecording}
                    disabled={isVerifying}
                    className={`text-white rounded-full p-3 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-all duration-200 ${
                        isRecording ? 'bg-red-600 ring-red-400 scale-110' : 'bg-blue-500 hover:bg-blue-600 ring-blue-400'
                    } ${
                        isVerifying ? 'bg-gray-400 cursor-not-allowed' : ''
                    }`}
                    aria-label={`Practice pronouncing ${item.character}`}
                >
                    {isVerifying ? (
                        <Loader className="w-6 h-6" />
                    ) : (
                        <MicrophoneIcon className="w-6 h-6" />
                    )}
                </button>
            </div>
        </div>
    );
};

export default Card;
