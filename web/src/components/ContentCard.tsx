import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { LanguagePill, CEFRPill } from "./ui/pills";
import { type LanguageCode, type CEFRLevel } from "@/hooks/useContentAPI";
import { formatDate } from "@/lib/utils";
import { Bookmark } from "lucide-react";

interface ContentCardProps {
  title: string;
  preview: string;
  language: LanguageCode;
  topic: string;
  cefrLevel: CEFRLevel;
  dateCreated: string;
  onSave: () => void;
}

export function ContentCard({
  title,
  preview,
  language,
  topic,
  cefrLevel,
  dateCreated,
  onSave
}: ContentCardProps) {

  return (
    <Card 
      className="w-92 h-64 flex flex-col shadow-none"
    >
      <CardContent className="pl-5 pr-5 flex flex-col h-full">
        <div className="mb-2">
          <h3 className="font-bold text-md text-foreground line-clamp-2">
            {title}
          </h3>
        </div>
        
        <div className="flex-1">
          <p className="text-muted-foreground text-sm line-clamp-4">
            {preview}
          </p>
        </div>
        
        <div className="flex justify-between items-start gap-2 mb-3">
          <div className="flex flex-wrap gap-2">
            <CEFRPill cefrLevel={cefrLevel} />
            <LanguagePill languageCode={language} />
            <Badge variant="outline" className="text-xs">
              {topic}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSave}
            className="h-6 w-6 p-0 shrink-0"
          >
            <Bookmark className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          {formatDate(dateCreated)}
        </p>
      </CardContent>
    </Card>
  );
} 