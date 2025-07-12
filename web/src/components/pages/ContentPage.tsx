import { useSidebarMenu } from '@/context/SidebarMenuContext';
import { Skeleton } from '@/components/ui/skeleton';
import { ContentInterface } from '@/components/content/ContentInterface';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/components/AppLayout';

interface ContentPageProps {
  databaseId: string;
  contentId: string;
}

export function ContentPage({ databaseId, contentId }: ContentPageProps) {
  const { selectedWorkspace, selectedDatabase } = useSidebarMenu();
  
  if (!selectedWorkspace || !selectedDatabase) {
    return (
      <ProtectedRoute>
        <AppLayout databaseId={databaseId}>
          <div className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-12 w-64" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </AppLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <AppLayout databaseId={databaseId}>
        <div className="p-6">
          <ContentInterface 
            workspaceId={selectedWorkspace.id}
            databaseId={databaseId}
            contentId={contentId}
          />
        </div>
      </AppLayout>
    </ProtectedRoute>
  )
} 