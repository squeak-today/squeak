import { createFileRoute } from '@tanstack/react-router'
import { AppLayout } from '@/components/AppLayout'
import { useSidebarMenu } from '@/context/SidebarMenuContext'
import { useEffect, useState } from 'react';
import { type Database, type Workspace } from '@/hooks/useWorkspacesAPI';
import { useDatabasesAPI } from '@/hooks/useDatabasesAPI';

export const Route = createFileRoute('/$databaseId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { databaseId } = Route.useParams();
  const { workspacesSummary, setSelectedDatabase, setSelectedWorkspace } = useSidebarMenu();
  const { queryDatabase } = useDatabasesAPI();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDatabaseAndWorkspace = async () => {
      if (!workspacesSummary) {
        return;
      }

      try {
        setLoading(true);

        const foundDatabase = workspacesSummary?.databases.find((db: Database) => db.id === databaseId);
        if (!foundDatabase) {
          console.error('Database not found:', databaseId);
          return;
        }

        const foundWorkspace = workspacesSummary?.workspaces.find((ws: Workspace) => ws.id === foundDatabase.workspace_id);
        if (!foundWorkspace) {
          console.error('Workspace not found for database:', foundDatabase.workspace_id);
          return;
        }

        setSelectedDatabase(foundDatabase);
        setSelectedWorkspace(foundWorkspace);

        const { data: queryResult, error: queryError } = await queryDatabase(
          foundWorkspace.id, 
          databaseId, 
          foundDatabase.type
        );
        
        if (queryError) {
          console.error('Failed to query database:', queryError);
        }
      } catch (error) {
        console.error('Error loading database:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDatabaseAndWorkspace();
  }, [databaseId, workspacesSummary]);

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6">
          <p>Loading database...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Database View</h1>
        <p className="text-muted-foreground">
          Viewing database: <span className="font-mono font-medium">{databaseId}</span>
        </p>
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            Database content will be displayed here. Check the console for the query results.
          </p>
        </div>
      </div>
    </AppLayout>
  )
}
