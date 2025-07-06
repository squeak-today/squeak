import React from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Skeleton } from '@/components/ui/skeleton';
import { AppSidebar } from './AppSidebar';
import { useSidebarMenu } from '@/context/SidebarMenuContext';
import { useLocation } from '@tanstack/react-router';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { selectedWorkspace, selectedDatabase, isLoading } = useSidebarMenu();
  const location = useLocation();
  
  const isNotRootPage = location.pathname !== '/';
  const showWorkspaceSkeleton = isLoading || (isNotRootPage && !selectedWorkspace);
  const showDatabaseSkeleton = isLoading || (isNotRootPage && !selectedDatabase);

  return (
    <SidebarProvider>
      <AppSidebar />
      <main>
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
              ) : selectedWorkspace ? (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{selectedWorkspace.name}</BreadcrumbPage>
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
              ) : selectedDatabase ? (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{selectedDatabase.name}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              ) : null}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        {children}
      </main>
    </SidebarProvider>
  );
} 