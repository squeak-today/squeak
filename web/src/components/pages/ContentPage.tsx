import { type Content } from '@/hooks/useDatabasesAPI';
import { LanguagePill, CEFRPill } from '@/components/ui/pills';
import { useContentAPI } from '@/hooks/useContentAPI';
import { useEffect, useState } from 'react';
import type { StoredContent } from '@/hooks/useContentAPI';
import { MarkdownReader } from '../MarkdownReader';

interface ContentPageProps {
  workspaceId: string;
  databaseId: string;
  row: Content;
}

export function ContentPage({ workspaceId, databaseId, row }: ContentPageProps) {
  const { getContentBody } = useContentAPI();
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [content, setContent] = useState<StoredContent | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      console.log('Fetching content');
      setIsLoadingContent(true);
      const { data: content } = await getContentBody(workspaceId, databaseId, row.id);
      if (content?.presigned_url) {
        const response = await fetch(content.presigned_url);
        const result = await response.text();
        const parsedContent = JSON.parse(result) as StoredContent;
        setContent(parsedContent);
        setIsLoadingContent(false);
      }
    };

    fetchContent();
  }, [workspaceId, databaseId, row.id]);

  const handleWordClick = (word: string, sentence: string) => {
    console.log('Word clicked:', { word, sentence });
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{row.name}</h1>
      <div className="flex gap-2">
        <LanguagePill languageCode={row.language_code} />
        <CEFRPill cefrLevel={row.cefr_level} />
      </div>
      <MarkdownReader
        content={content?.markdown ?? ''}
        sourceLanguage={row.language_code}
        isLoading={isLoadingContent}
        onWordClick={handleWordClick}
      />
    </div>
  );
} 