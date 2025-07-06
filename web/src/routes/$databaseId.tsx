import { createFileRoute } from '@tanstack/react-router'
import { AppLayout } from '@/components/AppLayout'
import { useSidebarMenu } from '@/context/SidebarMenuContext'
import { useEffect } from 'react';

export const Route = createFileRoute('/$databaseId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { databaseId } = Route.useParams();
//   const { setSelectedDatabase, setSelectedWorkspace } = useSidebarMenu();
  
//   useEffect(() => {
//     setSelectedDatabase(databaseId);
//     setSelectedWorkspace(workspaceId);
//   }, [databaseId, workspaceId]);

  return (
    <AppLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Database View</h1>
        <p className="text-muted-foreground">
          Viewing database: <span className="font-mono font-medium">{databaseId}</span>
        </p>
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            This is a placeholder for the database content. The database ID from the URL is: {databaseId}
          </p>
        </div>
      </div>
    </AppLayout>
  )
}
