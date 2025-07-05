import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSidebarMenu } from '@/context/SidebarMenuContext';
import { useAuth } from '@/context/AuthContext';
import { Folder, ChevronRight, LogOut, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';

export function AppSidebar() {
  const { workspacesSummary } = useSidebarMenu();
  const { logout } = useAuth();
  const [openWorkspaces, setOpenWorkspaces] = useState<Set<string>>(new Set());
  console.log(workspacesSummary);

  const handleWorkspaceClick = (workspace: any) => {
    console.log('Workspace clicked:', workspace.name);
  };

  const handleDatabaseClick = (database: any) => {
    console.log('Database clicked:', database.name);
  };

  const toggleWorkspace = (workspaceId: string) => {
    setOpenWorkspaces(prev => {
      const newSet = new Set(prev);
      if (newSet.has(workspaceId)) {
        newSet.delete(workspaceId);
      } else {
        newSet.add(workspaceId);
      }
      return newSet;
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="focus:outline-none focus:ring-0 focus:border-0"
                >
                  <div className="flex aspect-square size-8 items-center justify-center">
                    <img 
                      src="/logo500-transparent.png" 
                      alt="Squeak Logo" 
                      className="size-8 rounded"
                    />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Squeak</span>
                  </div>
                  <ChevronDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[var(--radix-dropdown-menu-trigger-width)] rounded-lg"
                side="bottom"
                align="start"
                sideOffset={4}
              >
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspaces</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workspacesSummary?.workspaces?.map((workspace) => {
                const isOpen = openWorkspaces.has(workspace.id || '');
                return (
                  <Collapsible 
                    key={workspace.id} 
                    asChild 
                    open={isOpen}
                    onOpenChange={() => toggleWorkspace(workspace.id || '')}
                  >
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        tooltip={workspace.name}
                        onClick={() => handleWorkspaceClick(workspace)}
                        className="group/workspace"
                      >
                        <div className="relative w-4 h-4">
                          <Folder className="w-4 h-4 group-hover/workspace:opacity-0 transition-opacity duration-200" />
                          <CollapsibleTrigger asChild>
                            <button className="absolute inset-0 wi-4 h-4 flex items-center justify-center opacity-0 group-hover/workspace:opacity-100 transition-opacity duration-200">
                              <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
                            </button>
                          </CollapsibleTrigger>
                        </div>
                        <span>{workspace.name}</span>
                      </SidebarMenuButton>
                      <CollapsibleContent className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-left-1 data-[state=open]:slide-in-from-left-1 duration-200">
                        <SidebarMenuSub>
                          {workspacesSummary.databases
                            ?.filter((database) => database.workspace_id === workspace.id)
                            .map((database) => (
                              <SidebarMenuSubItem key={database.id}>
                                <SidebarMenuSubButton 
                                  asChild
                                  onClick={() => handleDatabaseClick(database)}
                                >
                                  <span>{database.name}</span>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
} 