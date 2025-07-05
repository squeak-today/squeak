import React from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { SidebarMenuProvider } from '@/context/SidebarMenuContext';
import { AppSidebar } from './AppSidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarMenuProvider>
      <SidebarProvider>
        <AppSidebar />
        <main>
          <SidebarTrigger />
          {children}
        </main>
      </SidebarProvider>
    </SidebarMenuProvider>
  );
} 