import React from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { AppSidebar } from './AppSidebar';
import { useSidebarMenu } from '@/context/SidebarMenuContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { selectedWorkspace, selectedDatabase } = useSidebarMenu();

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
              {selectedWorkspace && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{selectedWorkspace.name}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
              {selectedDatabase && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{selectedDatabase.name}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        {children}
      </main>
    </SidebarProvider>
  );
} 