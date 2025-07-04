import React, {useEffect, useState, useRef} from 'react';
import LoadingSpinner from './LoadingSpinner';
import { useAudioAPI } from '../hooks/useAudioAPI';
import { useNotification } from '../context/NotificationContext';
import { FaPlay, FaPause, FaForward, FaBackward } from 'react-icons/fa';

interface AudiobookReaderProps {
    id: string;
    contentType: string;
    sourceLanguage: string;
    handleWordClick: (event: React.MouseEvent, word: string, language: string, sentence: string) => void;
}

interface WordTiming {
  text: string;
  startTime: number;
  endTime: number;
}

interface SentenceMap {
  text: string;
  startTime: number;
  endTime: number;
}

interface Audiobook {
  text: string;
  audio_base64: string;
  alignment: {
    characters: string[];
    character_start_times_seconds: number[];
    character_end_times_seconds: number[];
  };
  normalized_alignment: {
    characters: string[];
    character_start_times_seconds: number[];
    character_end_times_seconds: number[];
  };
  pages: number;
}

const Word: React.FC<{ 
  text: string; 
  isActive: boolean; 
  startTime: number;
  sourceLanguage: string;
  onClick: (time: number) => void;
  handleWordClick: (event: React.MouseEvent, word: string, language: string, sentence: string) => void;
  sentence: string;
}> = ({ text, isActive, startTime, sourceLanguage, onClick, handleWordClick, sentence }) => {
  return (
    <span 
      className={`inline-block transition-colors duration-100 ease-in rounded px-[1px] py-[2px] cursor-pointer ${
        isActive ? 'bg-[var(--color-selected)]' : 'hover:bg-[var(--color-selected)] hover:bg-opacity-50'
      }`}
      onClick={(e) => {
        onClick(startTime);
        handleWordClick(e, text, sourceLanguage, sentence);
      }}
    >
      {text}
    </span>
  );
};

const AudiobookReader: React.FC<AudiobookReaderProps> = ({ 
  id, 
  contentType,
  sourceLanguage,
  handleWordClick
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [audioData, setAudioData] = useState<string>('');
    const [text, setText] = useState<string>('');
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [words, setWords] = useState<WordTiming[]>([]);
    const [sentences, setSentences] = useState<SentenceMap[]>([]);
    const [activeWordIndex, setActiveWordIndex] = useState<number>(0);
    const [usageError, setUsageError] = useState<string>('');
    const audioRef = useRef<HTMLAudioElement>(null);
    const { getAudiobook } = useAudioAPI();
    const { showNotification } = useNotification();

    const [totalPages, setTotalPages] = useState<number>(1);
    const [currentPage, setCurrentPage] = useState<number>(0); 
    
    const fetchAudiobook = async(page: number) => {
      setIsPlaying(false);
      try {
        setIsLoading(true);
        let args = {
          news_id: "0",
          story_id: "0",
          page: page.toString(),
          type: "news",
        }
        if (contentType == "News") {
          args.news_id = id;
        } else if (contentType == "Story") {
          args.story_id = id;
          args.type = "story";
        }
        const { data, error } = await getAudiobook(args);
        if (error) {
          if (error.code === 'USAGE_RESTRICTED') {
            setUsageError('Your plan does not provide access to this audiobook!');
            showNotification('Your plan does not provide access to this audiobook!', 'error');
          } else if (error.code === 'USAGE_LIMIT_REACHED') {
            setUsageError('You have reached your limit of audiobooks for this month!');
            showNotification('You have reached your limit of audiobooks for this month!', 'error');
          } else if (error.error === 'No audiobook available for this news_id') {
            setUsageError('No audiobook available for this article!');
          } else if (error.error === 'No audiobook available for this story_id') {
            setUsageError('No audiobook available for this story!')
          } else {
            setUsageError('An error occurred while fetching the audiobook!');
            showNotification('An error occurred while fetching the audiobook!', 'error');
          }
          console.error('Error fetching audiobook:', error);
        } else if (data?.url) {
          const response = await fetch(data.url);
          if (!response.ok) {
            throw new Error('Failed to fetch audiobook content');
          }
          const audiobookData: Audiobook = await response.json();
          if (audiobookData.pages) {
            setTotalPages(audiobookData.pages)
          }
          setText(audiobookData.text || '');
          setAudioData(audiobookData.audio_base64 || '');
          
          if (audiobookData.alignment) {
            const { characters, character_start_times_seconds, character_end_times_seconds } = audiobookData.alignment;
            const wordTimings = extractWordTimings(
              audiobookData.text,
              characters || [],
              character_start_times_seconds || [],
              character_end_times_seconds || []
            );
            setWords(wordTimings);
            setSentences(extractSentences(wordTimings));
          }
        }
      } catch (err) {
        console.error('Error processing audiobook:', err);
        setUsageError('An error occurred while processing the audiobook!');
        showNotification('An error occurred while processing the audiobook!', 'error');
      } finally {
        setIsLoading(false);
      }
    }
    useEffect(() => {
      fetchAudiobook(0);
    }, [id])

    const extractWordTimings = (
      text: string, 
      characters: string[], 
      startTimes: number[], 
      endTimes: number[]
    ): WordTiming[] => {
      const result: WordTiming[] = [];
      const wordRegex = /\S+/g;
      let match;
      
      // create a mapping from text position to character array index
      let textIndex = 0;
      const indexMap: number[] = [];
      
      for (let i = 0; i < text.length; i++) {
        while (textIndex < characters.length && text[i] !== characters[textIndex]) {
          textIndex++;
        }
        
        if (textIndex < characters.length) {
          indexMap[i] = textIndex;
          textIndex++;
        }
      }
      
      while ((match = wordRegex.exec(text)) !== null) {
        const word = match[0];
        const startIndex = match.index;
        const endIndex = startIndex + word.length - 1;
        
        const startCharIndex = indexMap[startIndex];
        const endCharIndex = indexMap[endIndex];
        
        if (startCharIndex !== undefined && endCharIndex !== undefined &&
            startCharIndex < startTimes.length && endCharIndex < endTimes.length) {
          result.push({
            text: word,
            startTime: startTimes[startCharIndex],
            endTime: endTimes[endCharIndex]
          });
        }
      }
      
      return result;
    };

    const extractSentences = (words: WordTiming[]): SentenceMap[] => {
      const sentences: SentenceMap[] = [];
      let currentSentence: string[] = [];
      let startTime = words[0]?.startTime || 0;
      
      words.forEach((word, index) => {
        currentSentence.push(word.text);
        
        // check if word ends with sentence-ending punctuation
        if (word.text.match(/[.!?]$/) || index === words.length - 1) {
          sentences.push({
            text: currentSentence.join(' '),
            startTime: startTime,
            endTime: word.endTime
          });
          startTime = words[index + 1]?.startTime || word.endTime;
          currentSentence = [];
        }
      });
      
      return sentences;
    };

    const handlePlayPause = () => {
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause();
        } else {
          audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
      }
    };

    const handleTimeUpdate = () => {
      if (audioRef.current) {
        const currentTime = audioRef.current.currentTime;
        setCurrentTime(currentTime);
        
        // find the currently active word with a small tolerance window
        const index = words.findIndex(
          word => {
            const buffer = 0.0;
            return (currentTime + buffer >= word.startTime && currentTime - buffer <= word.endTime);
          }
        );
        
        if (index !== -1) {
          setActiveWordIndex(index);
        }
      }
    };

    useEffect(() => {
      let animationFrameId: number | null = null;
      
      const updateHighlighting = () => {
        if (audioRef.current && isPlaying) {
          const currentTime = audioRef.current.currentTime;
          
          const index = words.findIndex(
            word => {
              const buffer = 0.02;
              return (currentTime + buffer >= word.startTime && currentTime - buffer <= word.endTime);
            }
          );
          
          if (index !== -1 && index !== activeWordIndex) {
            setActiveWordIndex(index);
          }
          
          animationFrameId = requestAnimationFrame(updateHighlighting);
        }
      };
      
      if (isPlaying) {
        animationFrameId = requestAnimationFrame(updateHighlighting);
      }
      
      return () => {
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId);
        }
      };
    }, [isPlaying, words, activeWordIndex]);

    const handleLoadedMetadata = () => {
      if (audioRef.current) {
        setDuration(audioRef.current.duration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setActiveWordIndex(0);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      const time = Number(e.target.value);
      if (audioRef.current) {
        audioRef.current.currentTime = time;
        setCurrentTime(time);
        setIsPlaying(false);
      }
    };

    const handleSkipForward = () => {
      if (audioRef.current) {
        const newTime = Math.min(audioRef.current.currentTime + 0.1*duration, duration);
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
      }
    };

    const handleSkipBackward = () => {
      if (audioRef.current) {
        const newTime = Math.max(audioRef.current.currentTime - 0.1*duration, 0);
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
      }
    };

    const handleWordTimeSeek = (time: number) => {
      if (audioRef.current) {
        audioRef.current.currentTime = time;
        setCurrentTime(time);
        if (!isPlaying) {
          audioRef.current.play();
          setIsPlaying(true);
        }
      }
    };

    const formatTime = (time: number) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const getSentenceForTime = (time: number): string => {
      const sentence = sentences.find(s => time >= s.startTime && time <= s.endTime);
      return sentence?.text || '';
    };

    const renderWords = () => {
      if (words.length === 0) {
        const basicSentences = text.split(/(?<=[.!?])\s+/);
        return text.split(/(\s+)/).map((word, index) => {
          if (word.trim() === '') {
            return word;
          }
          const sentence = basicSentences.find(s => s.includes(word)) || word;
          return <Word 
            key={index} 
            text={word} 
            isActive={false}
            startTime={0}
            onClick={() => {}}
            handleWordClick={handleWordClick}
            sourceLanguage={sourceLanguage}
            sentence={sentence}
          />;
        });
      }
      
      return words.map((word, index) => {
        const sentence = getSentenceForTime(word.startTime);
        return (
          <React.Fragment key={index}>
            {index > 0 && ' '}
            <Word 
              text={word.text} 
              isActive={index === activeWordIndex}
              startTime={word.startTime}
              onClick={handleWordTimeSeek}
              handleWordClick={handleWordClick}
              sourceLanguage={sourceLanguage}
              sentence={sentence}
            />
          </React.Fragment>
        );
      });
    };

    return (
      <div className="flex flex-col h-full relative">
        {usageError ? (
          <div className="flex flex-col items-center justify-center h-full p-6">
            <p className="text-lg font-bold mb-2">Access Restricted</p>
            <p>{usageError}</p>
          </div>
        ) : (
          <>
            <p className="mt-0 mb-2 text-lg font-bold mx-auto">Transcript</p>
            <div className="flex items-center justify-center gap-4 mb-4">
              <button
                onClick={() => {
                  const newPage = currentPage - 1;
                  setCurrentPage(newPage);
                  fetchAudiobook(newPage);
                }}
                disabled={currentPage === 0}
                className={`border-none px-4 py-2 rounded-lg font-secondary text-sm
                  ${currentPage === 0 
                    ? 'bg-[var(--color-border)] cursor-not-allowed opacity-50' 
                    : 'bg-[var(--color-item-background)] hover:opacity-90 transition-opacity'
                  }`}
              >
                Prev
              </button>
              <p className="font-secondary text-base">
                Page: {currentPage + 1}/{totalPages}
              </p>
              <button
                onClick={() => {
                  const newPage = currentPage + 1;
                  setCurrentPage(newPage);
                  fetchAudiobook(newPage);
                }}
                disabled={currentPage >= totalPages - 1}
                className={`border-none px-4 py-2 rounded-lg font-secondary text-sm
                  ${currentPage >= totalPages - 1 
                    ? 'bg-[var(--color-border)] cursor-not-allowed opacity-50' 
                    : 'bg-[var(--color-item-background)] hover:opacity-90 transition-opacity'
                  }`}
              >
                Next
              </button>
            </div>
            {isLoading ? (
              <LoadingSpinner/>
            ) : (
              <div className="flex-grow overflow-y-auto px-0 py-6 font-primary bg-background rounded-[16px]">
                <div className="max-w-2xl mx-auto px-4">
                  {renderWords()}
                </div>
              </div>
            )}
            
            <div className="sticky bottom-0 left-0 right-0 bg-white shadow-[var(--shadow-base)] p-4 rounded-xl">
              <audio 
                ref={audioRef}
                src={`data:audio/mp3;base64,${audioData}`}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
              />
              
              <div className="w-full max-w-4xl mx-auto">
                <div className="flex justify-center items-center gap-2 mb-2">
                  <button
                    onClick={handleSkipBackward}
                    className="border-none w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-[var(--color-border)] hover:opacity-90 transition-opacity"
                  >
                    <FaBackward className="text-sm" />
                  </button>

                  <button
                    onClick={handlePlayPause}
                    className="border-none w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full bg-[var(--color-selected)] hover:opacity-90 transition-opacity"
                  >
                    {isPlaying ? <FaPause /> : <FaPlay className="ml-1" />}
                  </button>

                  <button
                    onClick={handleSkipForward}
                    className="border-none w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-[var(--color-border)] hover:opacity-90 transition-opacity"
                  >
                    <FaForward className="text-sm" />
                  </button>
                </div>
                
                <div className="flex items-center min-w-0">
                  <div className="w-[50px] text-base font-secondary text-right pr-2">
                    {formatTime(currentTime)}
                  </div>
                  
                  <div className="flex-grow flex items-center h-[20px] px-2">
                    <input
                      type="range"
                      min="0"
                      max={duration}
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-1 bg-[var(--color-border)] rounded-lg appearance-none cursor-pointer 
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--color-selected)]
                        [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-150
                        [&::-webkit-slider-thumb]:shadow-none"
                      style={{ margin: 0 }}
                    />
                  </div>
                  
                  <div className="w-[50px] text-base font-secondary pl-2">
                    {formatTime(duration)}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    )
}

export default AudiobookReader;
