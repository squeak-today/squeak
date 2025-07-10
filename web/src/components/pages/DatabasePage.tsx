import { AppLayout } from '@/components/AppLayout'
import { useSidebarMenu } from '@/context/SidebarMenuContext'
import { useEffect, useState, useRef } from 'react';
import { type Database, type Workspace } from '@/hooks/useWorkspacesAPI';
import { useDatabasesAPI } from '@/hooks/useDatabasesAPI';
import { useContentAPI, type ContentJob } from '@/hooks/useContentAPI';
import { Skeleton } from '@/components/ui/skeleton';
import { DatabaseTable } from '@/components/database/DatabaseTable';
import { type DatabaseRow } from '@/components/database/columns';
import { CreationButton } from '@/components/database/CreationButton';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable'
import { ContentPage } from './ContentPage';

interface DatabasePageProps {
  databaseId: string;
}

export function DatabasePage({ databaseId }: DatabasePageProps) {
  const { workspacesSummary, setSelectedDatabase, setSelectedWorkspace } = useSidebarMenu();
  const { queryDatabase } = useDatabasesAPI();
  const { getIncompleteJobs } = useContentAPI();
  
  const [database, setDatabase] = useState<Database | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [databaseRows, setDatabaseRows] = useState<DatabaseRow[]>([]);
  const [incompleteJobs, setIncompleteJobs] = useState<ContentJob[]>([]);
  
  const [selectedRow, setSelectedRow] = useState<DatabaseRow | null>(null);
  const [showRightPanel, setShowRightPanel] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchIncompleteJobs = async () => {
    if (!workspace || !database || database.type !== 'content') {
      return;
    }

    try {
      const { data, error } = await getIncompleteJobs(workspace.id, database.id);

      console.log('data', data);
      
      if (error) {
        console.error('Failed to fetch incomplete jobs:', error);
      } else if (data?.jobs) {
        setIncompleteJobs(data.jobs);
      }
    } catch (error) {
      console.error('Error fetching incomplete jobs:', error);
    }
  };

  const fetchDatabaseRows = async (workspace: Workspace, database: Database) => {
    if (!workspace || !database) {
      return;
    }

    try {
      const { data: queryResult, error: queryError } = await queryDatabase(
        workspace.id, 
        database.id, 
        database.type
      );
      
      if (queryError) {
        console.error('Failed to query database:', queryError);
      } else {
        if (queryResult?.content) {
          setDatabaseRows(queryResult.content);
        }
      }
    } catch (error) {
      console.error('Error fetching database rows:', error);
    }
  };

  const refreshData = async (workspace: Workspace, database: Database) => {
    if (!workspace || !database) {
      return;
    }

    await fetchDatabaseRows(workspace, database);
    
    if (database.type === 'content') {
      await fetchIncompleteJobs();
    }
  };

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
        setWorkspace(foundWorkspace);
        setSelectedDatabase(foundDatabase);
        setSelectedWorkspace(foundWorkspace);

        await refreshData(foundWorkspace, foundDatabase);
      } catch (error) {
        console.error('Error loading database:', error);
      } finally {
        setLoading(false);
      }
    };

    setDatabaseRows([]);
    setIncompleteJobs([]);
    setSelectedDatabase(null);
    setSelectedWorkspace(null);
    setWorkspace(null);
    loadDatabaseAndWorkspace();
  }, [databaseId, workspacesSummary]);

  useEffect(() => {
    if (!database || !workspace || loading) {
      return;
    }

    intervalRef.current = setInterval(() => refreshData(workspace, database), 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [database, workspace, loading]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <ProtectedRoute>
      <AppLayout>
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel className="border-t mt-2">
            <div className="p-6 pr-0 min-w-full">
              {loading || !database ? (
                <Skeleton className="h-8 w-64 mb-6" />
              ) : (
                <h1 className="text-2xl font-bold mb-6 whitespace-nowrap">{database.name}</h1>
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
                <>
                  <DatabaseTable 
                    type={database.type} 
                    data={databaseRows}
                    onFetchIncompleteJobs={database.type === 'content' ? fetchIncompleteJobs : undefined}
                    incompleteJobs={incompleteJobs}
                    onRowClick={(row) => {
                      setShowRightPanel(true);
                      setSelectedRow(row);
                    }}
                  />
                  <CreationButton database={database} />
                </>
              ) : null}
            </div>
          </ResizablePanel>
          <ResizableHandle className="mt-2" />
          {showRightPanel && selectedRow && (
            <ResizablePanel 
              minSize={0} 
              defaultSize={50} 
              className="border-t mt-2"
            >
              <div className="p-4">
                <div className="flex justify-start mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowRightPanel(false)}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                {database?.type === 'content' ? (
                  <ContentPage 
                    workspaceId={database.workspace_id}
                    databaseId={database.id}
                    row={selectedRow}
                  />
                ) : null}
              </div>
            </ResizablePanel>
          )}
        </ResizablePanelGroup>
      </AppLayout>
    </ProtectedRoute>
  )
} 