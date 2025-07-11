import React, { useEffect, useState, useMemo } from 'react';
import { evaluate } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';
import type { LanguageCode } from '@/hooks/useContentAPI';
import { Skeleton } from './ui/skeleton';

interface InteractiveTextProps {
  children: React.ReactNode;
  sourceLanguage: LanguageCode;
  onWordClick: (word: string, sentence: string) => void;
}


const REGEX_MAPS: Record<LanguageCode, string> = {
  'es': '([¿¡]?[^.!?\\s][^.!?]*(?:[.!?](?![\'"""»]?\\s|$)[^.!?]*)*[.!?]?[\'"""»]?(?=\\s|$))',
  'fr': '([¿¡]?[^.!?\\s][^.!?]*(?:[.!?](?![\'"""»]?\\s|$)[^.!?]*)*[.!?]?[\'"""»]?(?=\\s|$))',
  'en': '([¿¡]?[^.!?\\s][^.!?]*(?:[.!?](?![\'"""»]?\\s|$)[^.!?]*)*[.!?]?[\'"""»]?(?=\\s|$))'
}

const InteractiveText = ({
  children,
  sourceLanguage,
  onWordClick
}: InteractiveTextProps) => {
  const getSentences = (text: string) => {
    const regex = new RegExp(REGEX_MAPS[sourceLanguage], 'g');
    const sentences = text.match(regex) || [text];
    
    const spacingAfter = text.match(/[.!?]+\s*/g) || [];
    return sentences.map((sentence, i) => ({
      text: sentence,
      spacing: spacingAfter[i] ? spacingAfter[i].match(/\s+/)?.[0] || '' : ''
    }));
  };

  const renderWords = (text: string, sentence: string) => {
    const words = text.split(/(\s+)/);
    return words.map((word, index) => {
      if (word.trim() === '') {
        return word;
      }
      
      return (
        <span
          key={index}
          onClick={() => onWordClick(word.trim(), sentence.trim())}
          className="cursor-pointer border-accent hover:border-b-4 transition-all duration-50 ease-in"
        >
          {word}
        </span>
      );
    });
  };

  const processNode = (node: React.ReactNode): React.ReactNode => {
    if (typeof node === 'string') {
      const sentences = getSentences(node);
      return sentences.map((sentenceObj, index) => (
        <React.Fragment key={index}>
          {renderWords(sentenceObj.text, sentenceObj.text)}
          {sentenceObj.spacing}
        </React.Fragment>
      ));
    }
    
    if (React.isValidElement(node)) {
      return React.cloneElement(
        node,
        node.props as any,
        React.Children.map((node.props as any).children, child => processNode(child))
      );
    }
    
    return node;
  };
  
  return <>{React.Children.map(children, child => processNode(child))}</>;
};

interface MarkdownReaderProps {
  content: string;
  sourceLanguage: LanguageCode;
  isLoading?: boolean;


  onWordClick: (word: string, sentence: string) => void;
}

const MarkdownReader: React.FC<MarkdownReaderProps> = ({ 
  content, 
  sourceLanguage, 
  isLoading = false,
  onWordClick
}) => {
  const [compiledComponent, setCompiledComponent] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    if (!content) return;

    const compileContent = async () => {
      try {
        const { default: MDXContent } = await evaluate(content, {
          ...runtime,
          useMDXComponents: () => ({
            // custom components
          })
        });
        setCompiledComponent(() => MDXContent);
      } catch (error) {
        console.error('Failed to compile content:', error);
      }
    };

    compileContent();
  }, [content]);

  const createInteractiveWrapper = useMemo(() => (props: any) => (
    <InteractiveText
      sourceLanguage={sourceLanguage}
      onWordClick={onWordClick}
      {...props}
    />
  ), [sourceLanguage, onWordClick]);

  const createComponentOverrides = () => ({
    p: (props: any) => <p className="mb-4">{createInteractiveWrapper(props)}</p>,
    li: (props: any) => <li className="mb-2">{createInteractiveWrapper(props)}</li>,
    h1: (props: any) => <h1 className="text-4xl font-bold mb-6 mt-8">{createInteractiveWrapper(props)}</h1>,
    h2: (props: any) => <h2 className="text-3xl font-bold mb-4 mt-6">{createInteractiveWrapper(props)}</h2>,
    h3: (props: any) => <h3 className="text-2xl font-bold mb-3 mt-4">{createInteractiveWrapper(props)}</h3>,
    h4: (props: any) => <h4 className="text-xl font-bold mb-2 mt-3">{createInteractiveWrapper(props)}</h4>,
    ul: (props: any) => <ul className="list-disc list-inside mb-4 space-y-1" {...props} />,
    ol: (props: any) => <ol className="list-decimal list-inside mb-4 space-y-1" {...props} />,
    div: (props: any) => <div>{createInteractiveWrapper(props)}</div>,
    span: (props: any) => <span>{createInteractiveWrapper(props)}</span>,
  });

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-7/8" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    );
  }

  return (
    <div>
      {compiledComponent && React.createElement(compiledComponent, {
        components: createComponentOverrides()
      })}
    </div>
  );
};

export default MarkdownReader; 