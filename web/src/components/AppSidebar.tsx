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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useSidebarMenu } from '@/context/SidebarMenuContext';
import { useAuth } from '@/context/AuthContext';
import { Folder, ChevronRight, LogOut, ChevronDown, Plus, Database as DatabaseIcon, Trash, MoreHorizontal } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { type Workspace, type Database, useWorkspacesAPI, type SoftDeleteStatus, type DeletedSummary } from '@/hooks/useWorkspacesAPI';
import { useDatabasesAPI } from '@/hooks/useDatabasesAPI';
import { useNavigate } from '@tanstack/react-router';
import { TrashTable } from '@/components/database/TrashTable';
import { Skeleton } from '@/components/ui/skeleton';

export function AppSidebar() {
  const { workspacesSummary, refetchWorkspaces } = useSidebarMenu();
  const { createWorkspace, deleteWorkspace, getDeletedSummary } = useWorkspacesAPI();
  const { createDatabase } = useDatabasesAPI();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [openWorkspaces, setOpenWorkspaces] = useState<Set<string>>(new Set());
  const [isAddingWorkspace, setIsAddingWorkspace] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  const [addingDatabaseToWorkspace, setAddingDatabaseToWorkspace] = useState<string | null>(null);
  const [databaseName, setDatabaseName] = useState('');
  const [deletedSummary, setDeletedSummary] = useState<DeletedSummary | null>(null);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [isLoadingTrash, setIsLoadingTrash] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const databaseInputRef = useRef<HTMLInputElement>(null);

  const handleWorkspaceClick = (workspace: any) => {
    console.log('Workspace clicked:', workspace.name);
  };

  const handleDatabaseClick = (database: Database) => {
    console.log('Database clicked:', database.name);
    navigate({ to: '/databases/$databaseId', params: { databaseId: database.id } });
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

  const handleDeleteWorkspace = async (workspace: Workspace) => {
    try {
      const { error } = await deleteWorkspace(workspace.id, "soft_delete" as SoftDeleteStatus);
      if (error) {
        console.error('Failed to delete workspace:', error);
      } else {
        await refetchWorkspaces();
      }
    } catch (error) {
      console.error('Error deleting workspace:', error);
    }
  };

  const handleAddWorkspace = async (name: string) => {
    if (name.trim()) {
      console.log('Creating workspace:', name);
      const { error } = await createWorkspace({ name });
      if (error) {
        console.error('Error creating workspace:', error);
      }
      await refetchWorkspaces();
    }
    setIsAddingWorkspace(false);
    setWorkspaceName('');
  };

  const handleStartAddWorkspace = () => {
    setIsAddingWorkspace(true);
    setWorkspaceName('');
  };

  const handleCancelAddWorkspace = () => {
    setIsAddingWorkspace(false);
    setWorkspaceName('');
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddWorkspace(workspaceName);
    } else if (e.key === 'Escape') {
      handleCancelAddWorkspace();
    }
  };

  const handleInputBlur = () => {
    if (workspaceName.trim()) {
      handleAddWorkspace(workspaceName);
    } else {
      handleCancelAddWorkspace();
    }
  };

  useEffect(() => {
    if (isAddingWorkspace && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAddingWorkspace]);

  useEffect(() => {
    if (addingDatabaseToWorkspace && databaseInputRef.current) {
      databaseInputRef.current.focus();
    }
  }, [addingDatabaseToWorkspace]);

  const handleDatabaseAdd = async (name: string, workspace: Workspace) => {
    const { error } = await createDatabase(workspace.id, { name: name });
    if (error) {
      console.error('Error creating database:', error);
    }
    await refetchWorkspaces();
    setAddingDatabaseToWorkspace(null);
    setDatabaseName('');
  };

  const handleStartAddDatabase = (workspace: Workspace) => {
    if (!openWorkspaces.has(workspace.id)) {
      setOpenWorkspaces(prev => new Set(prev).add(workspace.id));
    }
    setAddingDatabaseToWorkspace(workspace.id);
    setDatabaseName('');
  };

  const handleCancelAddDatabase = () => {
    setAddingDatabaseToWorkspace(null);
    setDatabaseName('');
  };

  const handleDatabaseInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, workspace: Workspace) => {
    if (e.key === 'Enter') {
      handleDatabaseAdd(databaseName, workspace);
    } else if (e.key === 'Escape') {
      handleCancelAddDatabase();
    }
  };

  const handleDatabaseInputBlur = (workspace: Workspace) => {
    if (databaseName.trim()) {
      handleDatabaseAdd(databaseName, workspace);
    } else {
      handleCancelAddDatabase();
    }
  };

  const fetchDeletedSummary = async () => {
    if (isLoadingTrash) return;
    
    setIsLoadingTrash(true);
    try {
      const { data, error } = await getDeletedSummary();
      if (error) {
        console.error('Failed to fetch deleted summary:', error);
      } else if (data) {
        setDeletedSummary(data);
      }
    } catch (error) {
      console.error('Error fetching deleted summary:', error);
    } finally {
      setIsLoadingTrash(false);
    }
  };

  const handleTrashOpenChange = (open: boolean) => {
    setIsTrashOpen(open);
    if (open) {
      console.log('Fetching deleted summary');
      fetchDeletedSummary();
    }
  };

  const handleTrashRefresh = async () => {
    await fetchDeletedSummary();
    await refetchWorkspaces();
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
              {workspacesSummary?.workspaces.map((workspace: Workspace) => {
                const isOpen = openWorkspaces.has(workspace.id || '');
                return (
                  <Collapsible 
                    key={workspace.id} 
                    asChild 
                    open={isOpen}
                    onOpenChange={() => toggleWorkspace(workspace.id || '')}
                  >
                    <SidebarMenuItem>
                      <div className="group/workspace relative flex items-center">
                        <SidebarMenuButton 
                          tooltip={workspace.name}
                          onClick={() => handleWorkspaceClick(workspace)}
                          className="flex-1"
                        >
                          <div className="relative w-4 h-4">
                            <Folder className="w-4 h-4 group-hover/workspace:opacity-0 transition-opacity duration-200" />
                            <CollapsibleTrigger asChild>
                              <div className="absolute inset-0 wi-4 h-4 flex items-center justify-center opacity-0 group-hover/workspace:opacity-100 transition-opacity duration-200">
                                <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
                              </div>
                            </CollapsibleTrigger>
                          </div>
                          <span>{workspace.name}</span>
                        </SidebarMenuButton>
                        <div className="absolute right-2 opacity-0 group-hover/workspace:opacity-100 transition-opacity duration-200 flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartAddDatabase(workspace as Workspace);
                            }}
                            className="hover:bg-sidebar-accent rounded p-1"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                                className="hover:bg-sidebar-accent rounded p-1"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                variant="destructive" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteWorkspace(workspace);
                                }}
                              >
                                <Trash className="h-4 w-4" />
                                Move to Trash
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <CollapsibleContent className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-left-1 data-[state=open]:slide-in-from-left-1 duration-200">
                        <SidebarMenuSub>
                          {workspacesSummary.databases
                            .filter((database: Database) => database.workspace_id === workspace.id)
                            .map((database) => (
                              <SidebarMenuSubItem key={database.id}>
                                <SidebarMenuSubButton 
                                  onClick={() => handleDatabaseClick(database)}
                                  className="cursor-pointer"
                                >
                                  <DatabaseIcon className="w-4 h-4" />
                                  <span>{database.name}</span>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          {addingDatabaseToWorkspace === workspace.id && (
                            <SidebarMenuSubItem>
                              <div className="px-2 py-1.5 flex items-center gap-2">
                                <DatabaseIcon className="w-4 h-4" />
                                <Input
                                  ref={databaseInputRef}
                                  value={databaseName}
                                  onChange={(e) => setDatabaseName(e.target.value)}
                                  onKeyDown={(e) => handleDatabaseInputKeyDown(e, workspace)}
                                  onBlur={() => handleDatabaseInputBlur(workspace)}
                                  placeholder="Database name..."
                                  className="h-6 text-sm"
                                />
                              </div>
                            </SidebarMenuSubItem>
                          )}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
              <SidebarMenuItem>
                {isAddingWorkspace ? (
                  <div className="px-1">
                    <Input
                      ref={inputRef}
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      onKeyDown={handleInputKeyDown}
                      onBlur={handleInputBlur}
                      placeholder="Workspace name..."
                      className="h-8"
                    />
                  </div>
                ) : (
                  <SidebarMenuButton 
                    onClick={handleStartAddWorkspace}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Workspace</span>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Popover open={isTrashOpen} onOpenChange={handleTrashOpenChange}>
              <PopoverTrigger asChild>
                <SidebarMenuButton>
                  <Trash className="w-4 h-4" />
                  <span>Trash</span>
                </SidebarMenuButton>
              </PopoverTrigger>
              <PopoverContent className="w-[600px] p-4">
                {isLoadingTrash ? (
                  <div className="flex flex-col gap-4 py-8">
                    <Skeleton className="h-8" />
                    <Skeleton className="h-8" />
                    <Skeleton className="h-8" />
                  </div>
                ) : deletedSummary ? (
                  <TrashTable 
                    deletedSummary={deletedSummary} 
                    onRefresh={handleTrashRefresh}
                  />
                ) : (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    Failed to load trash
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
} 