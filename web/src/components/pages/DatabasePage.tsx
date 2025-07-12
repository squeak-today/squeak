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
import { ChevronRight, Expand } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { ContentInterface } from '@/components/content/ContentInterface';
import { AppLayout } from '@/components/AppLayout';

interface DatabasePageProps {
  databaseId: string;
}

export function DatabasePage({ databaseId }: DatabasePageProps) {
  const { selectedWorkspace, selectedDatabase } = useSidebarMenu();
  const { queryDatabase } = useDatabasesAPI();
  const { getIncompleteJobs } = useContentAPI();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [databaseRows, setDatabaseRows] = useState<DatabaseRow[]>([]);
  const [incompleteJobs, setIncompleteJobs] = useState<ContentJob[]>([]);
  
  const [selectedRow, setSelectedRow] = useState<DatabaseRow | null>(null);
  const [showRightPanel, setShowRightPanel] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchIncompleteJobs = async () => {
    if (!selectedWorkspace || !selectedDatabase || selectedDatabase.type !== 'content') {
      return;
    }

    try {
      const { data, error } = await getIncompleteJobs(selectedWorkspace.id, selectedDatabase.id);

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
    const loadData = async () => {
      if (!selectedWorkspace || !selectedDatabase) {
        return;
      }

      try {
        setLoading(true);
        await refreshData(selectedWorkspace, selectedDatabase);
      } catch (error) {
        console.error('Error loading database:', error);
      } finally {
        setLoading(false);
      }
    };

    setDatabaseRows([]);
    setIncompleteJobs([]);
    loadData();
  }, [selectedWorkspace, selectedDatabase]);

  useEffect(() => {
    if (!selectedDatabase || !selectedWorkspace || loading) {
      return;
    }

    intervalRef.current = setInterval(() => refreshData(selectedWorkspace, selectedDatabase), 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [selectedDatabase, selectedWorkspace, loading]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const rightPanel = showRightPanel && selectedRow && selectedDatabase ? (
    <div className="border-l bg-background h-full flex flex-col min-h-[100vh] max-h-[100vh]">
      <div className="p-4 flex flex-col h-full">
        <div className="flex justify-start mb-4 flex-shrink-0 gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowRightPanel(false)}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ 
              to: '/databases/$databaseId/content/$contentId', 
              params: { 
                databaseId: selectedDatabase.id, 
                contentId: selectedRow.id 
              } 
            })}
            className="h-8 w-8 p-0"
          >
            <Expand className="h-4 w-4" />
          </Button>
        </div>
        {selectedDatabase.type === 'content' ? (
          <div className="flex-1 overflow-y-auto">
            <ContentInterface 
              workspaceId={selectedDatabase.workspace_id}
              databaseId={selectedDatabase.id}
              contentId={selectedRow.id}
            />
          </div>
        ) : null}
      </div>
    </div>
  ) : null;

  return (
    <ProtectedRoute>
      <AppLayout
        databaseId={databaseId}
        showRightPanel={showRightPanel}
        rightPanel={rightPanel}
        rightPanelDefaultSize={50}
        rightPanelMinSize={30}
        rightPanelMaxSize={70}
      >
        <div className="p-6 pr-0 flex-1">
          {loading || !selectedDatabase ? (
            <Skeleton className="h-8 w-64 mb-6" />
          ) : (
            <h1 className="text-2xl font-bold mb-6 whitespace-nowrap">{selectedDatabase.name}</h1>
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
          ) : selectedDatabase ? (
            <>
              <DatabaseTable 
                type={selectedDatabase.type} 
                data={databaseRows}
                onFetchIncompleteJobs={selectedDatabase.type === 'content' ? fetchIncompleteJobs : undefined}
                incompleteJobs={incompleteJobs}
                onRowClick={(row) => {
                  setShowRightPanel(true);
                  setSelectedRow(row);
                }}
              />
              <CreationButton database={selectedDatabase} />
            </>
          ) : null}
        </div>
      </AppLayout>
    </ProtectedRoute>
  )
} 