import { createFileRoute } from '@tanstack/react-router'
import { AppLayout } from '@/components/AppLayout'
import { useSidebarMenu } from '@/context/SidebarMenuContext'
import { useEffect, useState } from 'react';
import { type Database, type Workspace } from '@/hooks/useWorkspacesAPI';
import { useDatabasesAPI } from '@/hooks/useDatabasesAPI';
import { Skeleton } from '@/components/ui/skeleton';
import { DatabaseTable } from '@/components/database/DatabaseTable';
import { type DatabaseRow } from '@/components/database/columns';

export const Route = createFileRoute('/$databaseId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { databaseId } = Route.useParams();
  const { workspacesSummary, setSelectedDatabase, setSelectedWorkspace } = useSidebarMenu();
  const { queryDatabase } = useDatabasesAPI();
  
  const [database, setDatabase] = useState<Database | null>(null);
  const [loading, setLoading] = useState(true);
  const [databaseRows, setDatabaseRows] = useState<DatabaseRow[]>([]);

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
        
        setDatabase(foundDatabase);
        setSelectedDatabase(foundDatabase);
        setSelectedWorkspace(foundWorkspace);

        const { data: queryResult, error: queryError } = await queryDatabase(
          foundWorkspace.id, 
          databaseId, 
          foundDatabase.type
        );
        
        if (queryError) {
          console.error('Failed to query database:', queryError);
        } else {
          if (queryResult?.content) {
            setDatabaseRows(queryResult.content);
          }
        }
      } catch (error) {
        console.error('Error loading database:', error);
      } finally {
        setLoading(false);
      }
    };

    setDatabaseRows([]);
    setSelectedDatabase(null);
    setSelectedWorkspace(null);
    loadDatabaseAndWorkspace();
  }, [databaseId, workspacesSummary]);

  return (
    <AppLayout>
      <div className="p-6">
        {loading || !database ? (
          <Skeleton className="h-8 w-64 mb-6" />
        ) : (
          <h1 className="text-2xl font-bold mb-6">{database.name}</h1>
        )}
        
        {loading ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        ) : database ? (
          <DatabaseTable type={database.type} data={databaseRows} />
        ) : null}
      </div>
    </AppLayout>
  )
}
