import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AppLayout } from '@/components/AppLayout';
import { useSidebarMenu } from '@/context/SidebarMenuContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const navigate = useNavigate();
  const { workspacesSummary, isLoading: isLoadingWorkspaces } = useSidebarMenu();
  const { jwtToken } = useAuth();

  useEffect(() => {
    if (workspacesSummary && workspacesSummary.databases && workspacesSummary.databases.length > 0) {
      const firstDatabase = workspacesSummary.databases[0];
      navigate({ to: `/databases/${firstDatabase.id}` });
    }
  }, [workspacesSummary, navigate]);

  if (process.env.NODE_ENV === 'development') {
    console.log(jwtToken);
  }

  return (
    <ProtectedRoute>
      {isLoadingWorkspaces ? (
        <AppLayout>
          <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </AppLayout>
      ) : !workspacesSummary || !workspacesSummary.databases || workspacesSummary.databases.length === 0 ? (
        <AppLayout>
          <div className="flex items-center justify-center w-full h-full">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4">Welcome to Squeak!</h1>
              <p className="text-lg text-muted-foreground">Create a Database to get started.</p>
            </div>
          </div>
        </AppLayout>
      ) : null}
    </ProtectedRoute>
  );
}