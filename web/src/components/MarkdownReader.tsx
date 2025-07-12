import React, { useEffect, useState, useMemo } from 'react';
import { evaluate } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';
import { TRANSLATABLE_ATTRIBUTE } from '@/lib/utils';

type LanguageCode = 'es' | 'fr' | 'en';

interface InteractiveTextProps {
  children: React.ReactNode;
  sourceLanguage: LanguageCode;
  onWordClick: (word: string, sentence: string) => void;
  currentSentence?: string;
}

const INLINE_ELEMENTS = ['strong', 'em', 'b', 'i', 'code', 'span'];

const REGEX_MAPS: Record<LanguageCode, string> = {
  'es': '([¿¡]?[^.!?\\s][^.!?]*(?:[.!?](?![\'"""»]?\\s|$)[^.!?]*)*[.!?]?[\'"""»]?(?=\\s|$))',
  'fr': '([¿¡]?[^.!?\\s][^.!?]*(?:[.!?](?![\'"""»]?\\s|$)[^.!?]*)*[.!?]?[\'"""»]?(?=\\s|$))',
  'en': '([¿¡]?[^.!?\\s][^.!?]*(?:[.!?](?![\'"""»]?\\s|$)[^.!?]*)*[.!?]?[\'"""»]?(?=\\s|$))'
}

const extractFullText = (node: React.ReactNode): string => {
  if (typeof node === 'string') return node;
  if (!node) return '';
  
  if (React.isValidElement(node)) {
    const children = (node.props as any)?.children;
    return extractFullText(children);
  }
  
  if (Array.isArray(node)) {
    return node.map(extractFullText).join('');
  }
  
  return '';
};

const InteractiveText = ({
  children,
  sourceLanguage,
  onWordClick,
  currentSentence
}: InteractiveTextProps) => {
  const fullText = useMemo(() => extractFullText(children), [children]);
  
  const sentences = useMemo(() => {
    const regex = new RegExp(REGEX_MAPS[sourceLanguage], 'g');
    return fullText.match(regex) || [fullText];
  }, [fullText, sourceLanguage]);
  
  const findSentenceForText = (text: string): string => {
    if (currentSentence) return currentSentence;
    
    const cleanText = text.trim();
    for (const sentence of sentences) {
      if (sentence.includes(cleanText)) {
        return sentence.trim();
      }
    }
    return sentences[0]?.trim() || text;
  };

  const processNode = (node: React.ReactNode): React.ReactNode => {
    if (typeof node === 'string') {
      // split on whitespace and punctuation, but preserve accented characters
      const parts = node.split(/(\s+|[^\w\u00C0-\u017F\u0100-\u024F]+)/);
      
      return parts.map((part, index) => {
        if (/^\s*$/.test(part)) {
          return part;
        }
        
        // check for word characters including accented characters
        if (/[\w\u00C0-\u017F\u0100-\u024F]/.test(part)) {
          const sentence = findSentenceForText(part);
          return (
            <span
              key={index}
              onClick={() => onWordClick(part.trim(), sentence)}
              className="cursor-pointer border-accent hover:border-b-4 transition-all duration-50 ease-in inline-block"
              style={{ display: 'inline' }}
              {...{[TRANSLATABLE_ATTRIBUTE]: "true"}}
            >
              {part}
            </span>
          );
        }
        
        // otherwise (punctuation, etc), return as is
        return part;
      });
    }
    
    if (React.isValidElement(node)) {
      const nodeType = typeof node.type === 'string' ? node.type : '';
      const isInlineElement = INLINE_ELEMENTS.includes(nodeType);
      
      if (isInlineElement) {
        const childrenArray = React.Children.toArray((node.props as any)?.children || []);
        const processedChildren = childrenArray.map((child, idx) => (
          <React.Fragment key={idx}>{processNode(child)}</React.Fragment>
        ));
        
        return React.cloneElement(node, {}, processedChildren);
      }
      
      // for other elements, just process children normally
      return React.cloneElement(
        node,
        {},
        React.Children.map((node.props as any)?.children, processNode)
      );
    }
    
    if (Array.isArray(node)) {
      return node.map((item, idx) => (
        <React.Fragment key={idx}>{processNode(item)}</React.Fragment>
      ));
    }
    
    return node;
  };
  
  return <>{React.Children.map(children, processNode)}</>;
};

interface MarkdownReaderProps {
  content: string;
  sourceLanguage: LanguageCode;
  isLoading?: boolean;
  onWordClick: (word: string, sentence: string) => void;
}

export const MarkdownReader = ({ 
  content, 
  sourceLanguage, 
  isLoading = false,
  onWordClick
}: MarkdownReaderProps) => {
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

  const createComponentOverrides = useMemo(() => {
    const createWrapper = (Component: string, className?: string) => {
      return (props: any) => {
        const fullText = extractFullText(props.children);
        const regex = new RegExp(REGEX_MAPS[sourceLanguage], 'g');
        const sentences = fullText.match(regex) || [fullText];
        const currentSentence = sentences[0]?.trim() || fullText;
        
        return React.createElement(
          Component,
          { className },
          <InteractiveText 
            sourceLanguage={sourceLanguage} 
            onWordClick={onWordClick}
            currentSentence={currentSentence}
          >
            {props.children}
          </InteractiveText>
        );
      };
    };

    return {
      p: createWrapper('p', 'mb-4'),
      li: createWrapper('li', 'mb-2'),
      h1: createWrapper('h1', 'text-4xl font-bold mb-6 mt-8'),
      h2: createWrapper('h2', 'text-3xl font-bold mb-4 mt-6'),
      h3: createWrapper('h3', 'text-2xl font-bold mb-3 mt-4'),
      h4: createWrapper('h4', 'text-xl font-bold mb-2 mt-3'),
      ul: (props: any) => <ul className="list-disc list-inside mb-4 space-y-1" {...props} />,
      ol: (props: any) => <ol className="list-decimal list-inside mb-4 space-y-1" {...props} />,
      
      // inline elements that are part of sentences, so process normally
      strong: (props: any) => <strong {...props} />,
      em: (props: any) => <em {...props} />,
      code: (props: any) => <code className="bg-gray-100 px-1 py-0.5 rounded" {...props} />,
    };
  }, [sourceLanguage, onWordClick]);

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-7/8 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-4/5 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div>
      {compiledComponent && React.createElement(compiledComponent, {
        components: createComponentOverrides
      })}
    </div>
  );
};
