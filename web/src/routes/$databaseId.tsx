import { createFileRoute } from '@tanstack/react-router'
import { AppLayout } from '@/components/AppLayout'
import { useSidebarMenu } from '@/context/SidebarMenuContext'
import { useEffect, useState } from 'react';
import { type Database, type Workspace } from '@/hooks/useWorkspacesAPI';
import { useDatabasesAPI } from '@/hooks/useDatabasesAPI';
import { useContentAPI } from '@/hooks/useContentAPI';
import { Skeleton } from '@/components/ui/skeleton';
import { DatabaseTable } from '@/components/database/DatabaseTable';
import { type DatabaseRow } from '@/components/database/columns';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ProtectedRoute } from '@/components/ProtectedRoute';

export const Route = createFileRoute('/$databaseId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { databaseId } = Route.useParams();
  const { workspacesSummary, setSelectedDatabase, setSelectedWorkspace } = useSidebarMenu();
  const { queryDatabase } = useDatabasesAPI();
  const { createContent } = useContentAPI();
  
  const [database, setDatabase] = useState<Database | null>(null);
  const [loading, setLoading] = useState(true);
  const [databaseRows, setDatabaseRows] = useState<DatabaseRow[]>([]);
  const [formData, setFormData] = useState({ name: '', link: '' });
  const [dialogOpen, setDialogOpen] = useState(false);

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
        setSelectedDatabase(foundDatabase);
        setSelectedWorkspace(foundWorkspace);

        const { data: queryResult, error: queryError } = await queryDatabase(
          foundWorkspace.id, 
          databaseId, 
          foundDatabase.type
        );
        
        if (queryError) {
          console.error('Failed to query database:', queryError);
        } else {
          if (queryResult?.content) {
            setDatabaseRows(queryResult.content);
          }
        }
      } catch (error) {
        console.error('Error loading database:', error);
      } finally {
        setLoading(false);
      }
    };

    setDatabaseRows([]);
    setSelectedDatabase(null);
    setSelectedWorkspace(null);
    loadDatabaseAndWorkspace();
  }, [databaseId, workspacesSummary]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!database) return;

    const name = formData.name.trim();
    const link = formData.link.trim();
    if (!name || !link) {
      return;
    }

    try {
      new URL(link);
    } catch (e) {
      console.error('Invalid URL:', link);
      return;
    }

    try {
      await createContent(
        database.workspace_id,
        database.id,
        {
          name,
          link,
        }
      );
      
      setFormData({ name: '', link: '' });
      setDialogOpen(false);
    } catch (error) {
      console.error('Failed to create content:', error);
    }
  };

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="p-6">
          {loading || !database ? (
            <Skeleton className="h-8 w-64 mb-6" />
          ) : (
            <h1 className="text-2xl font-bold mb-6">{database.name}</h1>
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
              <DatabaseTable type={database.type} data={databaseRows} />
              {(() => {
                let buttonText: string | null = null;
                switch (database.type) {
                  case "content":
                    buttonText = "+ Create Content";
                    break;
                  default:
                    buttonText = null;
                }
                return buttonText ? (
                  // WHEN ADDING NEW CONTENT TYPES,
                  // THIS PROBABLY WORKS BETTER AS ITS OWN COMPONENT
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <div className="mt-2">
                        <Button variant="ghost" size="sm">
                          {buttonText}
                        </Button>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <form onSubmit={handleSubmit}>
                        <DialogHeader>
                          <DialogTitle>Create Content</DialogTitle>
                          <DialogDescription>
                            Add new content to study!
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                              id="name"
                              value={formData.name}
                              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Enter content name"
                              required
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="link">Link</Label>
                            <Input
                              id="link"
                              value={formData.link}
                              onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                              placeholder="Enter content link"
                              required
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button type="button" variant="secondary">
                              Cancel
                            </Button>
                          </DialogClose>
                          <Button type="submit">Create Content</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                ) : null;
              })()}
            </>
          ) : null}
        </div>
      </AppLayout>
    </ProtectedRoute>
  )
}
