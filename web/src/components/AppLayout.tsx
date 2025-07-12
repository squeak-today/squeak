import React, { useEffect, useState } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import { AppSidebar } from './AppSidebar';
import { useSidebarMenu } from '@/context/SidebarMenuContext';
import { useLocation } from '@tanstack/react-router';
import { type Database, type Workspace } from '@/hooks/useWorkspacesAPI';

interface AppLayoutProps {
  children: React.ReactNode;
  rightPanel?: React.ReactNode;
  locationLabel?: string;
  showRightPanel?: boolean;
  rightPanelDefaultSize?: number;
  rightPanelMinSize?: number;
  rightPanelMaxSize?: number;
  databaseId?: string;
  workspaceId?: string;
}

export function AppLayout({ 
  children, 
  rightPanel,
  locationLabel, 
  showRightPanel = false,
  rightPanelDefaultSize = 50,
  rightPanelMinSize = 30,
  rightPanelMaxSize = 70,
  databaseId,
  workspaceId
}: AppLayoutProps) {
  const { selectedWorkspace, selectedDatabase, isLoading, workspacesSummary, setSelectedDatabase, setSelectedWorkspace } = useSidebarMenu();
  const location = useLocation();
  
  const [localDatabase, setLocalDatabase] = useState<Database | null>(null);
  const [localWorkspace, setLocalWorkspace] = useState<Workspace | null>(null);
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!workspacesSummary || (!databaseId && !workspaceId)) {
        return;
      }

      try {
        setLocalLoading(true);

        let foundDatabase: Database | null = null;
        let foundWorkspace: Workspace | null = null;

        if (databaseId) {
          foundDatabase = workspacesSummary.databases.find((db: Database) => db.id === databaseId) || null;
          if (!foundDatabase) {
            console.error('Database not found:', databaseId);
            return;
          }
          foundWorkspace = workspacesSummary.workspaces.find((ws: Workspace) => ws.id === foundDatabase!.workspace_id) || null;
          if (!foundWorkspace) {
            console.error('Workspace not found for database:', foundDatabase.workspace_id);
            return;
          }
        } else if (workspaceId) {
          foundWorkspace = workspacesSummary.workspaces.find((ws: Workspace) => ws.id === workspaceId) || null;
          if (!foundWorkspace) {
            console.error('Workspace not found:', workspaceId);
            return;
          }
        }

        setLocalDatabase(foundDatabase);
        setLocalWorkspace(foundWorkspace);
        
        if (foundDatabase) setSelectedDatabase(foundDatabase);
        if (foundWorkspace) setSelectedWorkspace(foundWorkspace);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLocalLoading(false);
      }
    };

    setLocalDatabase(null);
    setLocalWorkspace(null);
    if (databaseId || workspaceId) {
      setSelectedDatabase(null);
      setSelectedWorkspace(null);
    }
    loadData();
  }, [databaseId, workspaceId, workspacesSummary, setSelectedDatabase, setSelectedWorkspace]);

  const isNotRootPage = location.pathname !== '/';
  const effectiveLoading = isLoading || localLoading;
  const effectiveWorkspace = localWorkspace || selectedWorkspace;
  const effectiveDatabase = localDatabase || selectedDatabase;
  
  const showWorkspaceSkeleton = effectiveLoading || (isNotRootPage && !effectiveWorkspace);
  const showDatabaseSkeleton = effectiveLoading || (isNotRootPage && !effectiveDatabase && (databaseId || selectedDatabase));

  return (
    <div className="h-screen">
      <SidebarProvider>
        <AppSidebar />
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel>
            <div className="flex h-full">
              <main className="flex-1 w-full flex flex-col">
                <div className="px-4 pt-4">
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <SidebarTrigger />
                      </BreadcrumbItem>
                      
                      {showWorkspaceSkeleton ? (
                        <>
                          <BreadcrumbSeparator />
                          <BreadcrumbItem>
                            <Skeleton className="h-4 w-24" />
                          </BreadcrumbItem>
                        </>
                      ) : effectiveWorkspace ? (
                        <>
                          <BreadcrumbSeparator />
                          <BreadcrumbItem>
                            <BreadcrumbPage>{effectiveWorkspace.name}</BreadcrumbPage>
                          </BreadcrumbItem>
                        </>
                      ) : null}
                      
                      {showDatabaseSkeleton ? (
                        <>
                          <BreadcrumbSeparator />
                          <BreadcrumbItem>
                            <Skeleton className="h-4 w-32" />
                          </BreadcrumbItem>
                        </>
                      ) : effectiveDatabase ? (
                        <>
                          <BreadcrumbSeparator />
                          <BreadcrumbItem>
                            <BreadcrumbPage>{effectiveDatabase.name}</BreadcrumbPage>
                          </BreadcrumbItem>
                        </>
                      ) : null}

                      {locationLabel && (
                        <>
                          <BreadcrumbSeparator />
                          <BreadcrumbItem>
                            <BreadcrumbPage>{locationLabel}</BreadcrumbPage>
                          </BreadcrumbItem>
                        </>
                      )}
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
                {children}
              </main>
            </div>
          </ResizablePanel>

          {showRightPanel && rightPanel && <ResizableHandle />}

          {showRightPanel && rightPanel && (
            <ResizablePanel 
              defaultSize={rightPanelDefaultSize} 
              minSize={rightPanelMinSize} 
              maxSize={rightPanelMaxSize}
            >
              {rightPanel}
            </ResizablePanel>
          )}
        </ResizablePanelGroup>
      </SidebarProvider>
    </div>
  );
} 