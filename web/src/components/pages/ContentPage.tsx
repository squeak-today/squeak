import { type Content } from '@/hooks/useDatabasesAPI';
import { LanguagePill, CEFRPill } from '@/components/ui/pills';
import { useContentAPI } from '@/hooks/useContentAPI';
import { useEffect } from 'react';

interface ContentPageProps {
  workspaceId: string;
  databaseId: string;
  row: Content;
}

export function ContentPage({ workspaceId, databaseId, row }: ContentPageProps) {
  const { getContentBody } = useContentAPI();

  useEffect(() => {
    const fetchContent = async () => {
      const { data: content } = await getContentBody(workspaceId, databaseId, row.id);
      console.log(content);
      if (content?.presigned_url) {
        const response = await fetch(content.presigned_url);
        const result = await response.text();
        console.log(result);
      }
    };

    fetchContent();
  }, [workspaceId, databaseId, row.id]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{row.name}</h1>
      <div className="flex gap-2">
        <LanguagePill languageCode={row.language_code} />
        <CEFRPill cefrLevel={row.cefr_level} />
      </div>
    </div>
  );
} 