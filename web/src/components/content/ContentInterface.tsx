import { type Content } from '@/hooks/useDatabasesAPI';
import { LanguagePill, CEFRPill } from '@/components/ui/pills';
import { useContentAPI } from '@/hooks/useContentAPI';
import { useEffect, useState } from 'react';
import type { StoredContent } from '@/hooks/useContentAPI';
import { MarkdownReader } from '../MarkdownReader';
import { Skeleton } from '../ui/skeleton';
import { useTranslation } from '@/context/TranslationContext';

interface ContentInterfaceProps {
  workspaceId: string;
  databaseId: string;
  contentId: string;
}

export function ContentInterface({ workspaceId, databaseId, contentId }: ContentInterfaceProps) {
  const { getContent } = useContentAPI();
  const { showTranslation } = useTranslation();
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [contentBody, setContentBody] = useState<StoredContent | null>(null);
  const [content, setContent] = useState<Content | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      console.log('Fetching content');
      setIsLoadingContent(true);
      const { data: contentData } = await getContent(workspaceId, databaseId, contentId);
      if (contentData?.presigned_url) {
        const response = await fetch(contentData.presigned_url);
        const result = await response.text();
        const parsedContent = JSON.parse(result) as StoredContent;
        setContentBody(parsedContent);
      }
      if (contentData?.content) {
        console.log('Content:', contentData.content);
        setContent(contentData.content);
      }
      setIsLoadingContent(false);
    };

    fetchContent();
  }, [workspaceId, databaseId, contentId]);

  const handleWordClick = (word: string, sentence: string) => {
    if (content?.language_code) {
      showTranslation(word, 'en', content.language_code, sentence);
    }
  };

  if (!content || !contentBody) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-64" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-5xl font-bold">{content.name}</h1>
      <div className="flex gap-2">
        <LanguagePill languageCode={content.language_code} />
        <CEFRPill cefrLevel={content.cefr_level} />
      </div>
      <MarkdownReader
        content={contentBody.markdown ?? ''}
        sourceLanguage={content.language_code}
        isLoading={isLoadingContent}
        onWordClick={handleWordClick}
      />
    </div>
  );
} 