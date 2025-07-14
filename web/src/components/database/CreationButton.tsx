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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { type LanguageCode, type CEFRLevel, useContentAPI } from '@/hooks/useContentAPI';
import { type Database } from '@/hooks/useWorkspacesAPI';
import { LANGUAGES } from '@/lib/lang';
import { CEFR_LEVELS } from '@/lib/cefr';
import { useNotification } from '@/context/NotificationContext';

interface CreationButtonProps {
  database: Database;
}

export function CreationButton({ database }: CreationButtonProps) {
  const { showNotification } = useNotification();
  const { createContent } = useContentAPI();
  const [formData, setFormData] = useState({ 
    name: '', 
    link: '', 
    language_code: '' as LanguageCode,
    cefr_level: '' as CEFRLevel
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!database) return;

    const { name, link, language_code, cefr_level } = formData;
    const trimmedName = name.trim();
    const trimmedLink = link.trim();
    
    if (!trimmedName || !trimmedLink || !language_code || !cefr_level) {
      showNotification('Please fill in all fields', 'error');
      return;
    }

    try {
      new URL(trimmedLink);
    } catch (e) {
      showNotification('Invalid URL', 'error');
      return;
    }

    try {
      await createContent(
        database.workspace_id,
        database.id,
        {
          name: trimmedName,
          link: trimmedLink,
          language_code,
          cefr_level,
        }
      );
      
      setFormData({ name: '', link: '', language_code: '' as LanguageCode, cefr_level: '' as CEFRLevel });
      setDialogOpen(false);
    } catch (error) {
      console.error('Failed to create content:', error);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <div className="mt-2">
          <Button variant="ghost" size="sm">
            + Create Content
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
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  value={formData.language_code}
                  onValueChange={(value: LanguageCode) => setFormData(prev => ({ ...prev, language_code: value }))}
                  required
                >
                  <SelectTrigger id="language" className="w-full">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((language) => (
                      <SelectItem key={language.value} value={language.value}>
                        {language.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cefr">CEFR Level</Label>
                <Select
                  value={formData.cefr_level}
                  onValueChange={(value: CEFRLevel) => setFormData(prev => ({ ...prev, cefr_level: value }))}
                  required
                >
                  <SelectTrigger id="cefr" className="w-full">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {CEFR_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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