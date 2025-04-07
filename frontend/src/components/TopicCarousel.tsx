import React, { useEffect, useRef, useState } from 'react';

interface TopicCarouselProps {
  topics: string[];
  className?: string;
}

export const TopicCarousel: React.FC<TopicCarouselProps> = ({ topics, className }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [animationDuration, setAnimationDuration] = useState(20); // in seconds

  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const contentWidth = scrollContainerRef.current.scrollWidth / 2;
    setAnimationDuration(Math.max(15, contentWidth / 40));
  }, [topics]);
  
  const uniqueTopics = topics.filter((value, index, self) => 
    self.indexOf(value) === index
  );
  const duplicatedTopics = [...uniqueTopics, ...uniqueTopics];

  return (
    <div className={`w-full overflow-hidden relative ${className || ''}`}>
      <div 
        ref={scrollContainerRef}
        className="whitespace-nowrap inline-block"
        style={{
          animationDuration: `${animationDuration}s`,
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
          animationName: 'marquee',
          animationPlayState: 'running',
        }}
      >
        {duplicatedTopics.map((topic, index) => (
          <span 
            key={`${topic}-${index}`} 
            className="inline-block px-3 py-1 mx-2 rounded-full bg-background text-primary text-base font-secondary"
          >
            {topic}
          </span>
        ))}
      </div>

      <style>
        {`
          @keyframes marquee {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
        `}
      </style>
    </div>
  );
};

export default TopicCarousel; 