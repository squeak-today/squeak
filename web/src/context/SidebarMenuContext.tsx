import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useWorkspacesAPI, type WorkspacesSummary } from '@/hooks/useWorkspacesAPI';
import { useAuth } from './AuthContext';

interface SidebarMenuContextType {
  workspacesSummary: WorkspacesSummary | null;
  isLoading: boolean;
  error: string | null;
  refetchWorkspaces: () => Promise<void>;
}

const SidebarMenuContext = createContext<SidebarMenuContextType | undefined>(undefined);

export function useSidebarMenu() {
  const context = useContext(SidebarMenuContext);
  if (context === undefined) {
    throw new Error('useWorkspacesSidebar must be used within a SidebarProvider');
  }
  return context;
}

interface SidebarMenuProviderProps {
  children: ReactNode;
}

export function SidebarMenuProvider({ children }: SidebarMenuProviderProps) {
  const { jwtToken } = useAuth();
  const { getWorkspacesSummary, isAuthenticated } = useWorkspacesAPI();
  
  const [workspacesSummary, setWorkspacesSummary] = useState<WorkspacesSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkspaces = async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: apiError } = await getWorkspacesSummary();
      
      if (apiError) {
        setError(apiError.error || 'Failed to fetch workspaces');
        setWorkspacesSummary(null);
      } else {
        setWorkspacesSummary(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setWorkspacesSummary(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (jwtToken && isAuthenticated) {
      fetchWorkspaces();
    } else {
      setWorkspacesSummary(null);
      setError(null);
      setIsLoading(false);
    }
  }, [jwtToken, isAuthenticated]);

  const refetchWorkspaces = async () => {
    await fetchWorkspaces();
  };

  const value: SidebarMenuContextType = {
    workspacesSummary,
    isLoading,
    error,
    refetchWorkspaces,
  };

  return (
    <SidebarMenuContext.Provider value={value}>
      {children}
    </SidebarMenuContext.Provider>
  );
} 