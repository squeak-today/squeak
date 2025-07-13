import { useSidebarMenu } from '@/context/SidebarMenuContext';
import { Skeleton } from '@/components/ui/skeleton';
import { ContentInterface } from '@/components/content/ContentInterface';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/components/AppLayout';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useContentAPI } from '@/hooks/useContentAPI';
import { Trash } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { type SoftDeleteStatus } from '@/hooks/useWorkspacesAPI';

interface ContentPageProps {
  databaseId: string;
  contentId: string;
}

export function ContentPage({ databaseId, contentId }: ContentPageProps) {
  const { selectedWorkspace, selectedDatabase } = useSidebarMenu();
  const { deleteContent } = useContentAPI();
  const navigate = useNavigate();

  const handleDeleteContent = async () => {
    if (!selectedWorkspace) return;
    
    try {
      const { error } = await deleteContent(selectedWorkspace.id, databaseId, contentId, "soft_delete" as SoftDeleteStatus);
      if (error) {
        console.error('Failed to delete content:', error);
      } else {
        navigate({ to: '/databases/$databaseId', params: { databaseId } });
      }
    } catch (error) {
      console.error('Error deleting content:', error);
    }
  };

  const actionMenu = (
    <DropdownMenuItem variant="destructive" onClick={handleDeleteContent}>
      <Trash className="h-4 w-4" />
      Move to Trash
    </DropdownMenuItem>
  );
  
  if (!selectedWorkspace || !selectedDatabase) {
    return (
      <ProtectedRoute>
        <AppLayout databaseId={databaseId} actionMenu={actionMenu}>
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
      <AppLayout databaseId={databaseId} actionMenu={actionMenu}>
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