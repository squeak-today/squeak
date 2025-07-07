import { useState } from 'react';
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
import { useContentAPI } from '@/hooks/useContentAPI';
import { type Database } from '@/hooks/useWorkspacesAPI';

interface CreationButtonProps {
  database: Database;
}

export function CreationButton({ database }: CreationButtonProps) {
  const { createContent } = useContentAPI();
  const [formData, setFormData] = useState({ name: '', link: '' });
  const [dialogOpen, setDialogOpen] = useState(false);

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

  let buttonText: string | null = null;
  switch (database.type) {
    case "content":
      buttonText = "+ Create Content";
      break;
    default:
      buttonText = null;
  }

  if (!buttonText) return null;

  return (
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
  );
} 