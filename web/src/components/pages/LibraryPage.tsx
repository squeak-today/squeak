import { AppLayout } from "../AppLayout";
import { ProtectedRoute } from "../ProtectedRoute";
import { Route } from "@/routes/library";
import { ContentCard } from "../ContentCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Search } from "lucide-react";
import { useNewsAPI } from "@/hooks/useNewsAPI";
import { type LanguageCode, type CEFRLevel } from "@/hooks/useContentAPI";
import { LANGUAGES } from "@/lib/lang";
import { CEFR_LEVELS } from "@/lib/cefr";
import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

interface LibraryPageProps {}

interface NewsItem {
  id: string;
  title: string;
  preview_text: string;
  language: string;
  topic: string;
  cefr_level: string;
  date_created: string;
  audiobook_tier?: string;
}
  
export function LibraryPage({}: LibraryPageProps) {
  const navigate = useNavigate();
  const { search, cefr_level, language_code } = Route.useSearch();
  const { queryNews } = useNewsAPI();
  
  const [searchTerm, setSearchTerm] = useState(search || "");
  const [selectedLanguage, setSelectedLanguage] = useState<string>(language_code || "any");
  const [selectedCEFR, setSelectedCEFR] = useState<string>(cefr_level || "any");
  const [contentItems, setContentItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  
  const itemsPerPage = 9;

  const fetchContent = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const response = await queryNews({
        language: selectedLanguage === "any" ? "" : selectedLanguage,
        cefr: selectedCEFR === "any" ? "" : selectedCEFR,
        subject: searchTerm || "",
        page: page.toString(),
        pagesize: itemsPerPage.toString()
      });
      
      const newsData = Array.isArray(response) ? response : [];
      setContentItems(newsData);
      setHasNextPage(newsData.length === itemsPerPage);
    } catch (error) {
      console.error("Error fetching content:", error);
      setContentItems([]);
      setHasNextPage(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContent(currentPage);
  }, [selectedLanguage, selectedCEFR, searchTerm, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
    navigate({
      to: '/library',
      search: {
        search: searchTerm || undefined,
        language_code: selectedLanguage === "any" ? undefined : selectedLanguage as LanguageCode,
        cefr_level: selectedCEFR === "any" ? undefined : selectedCEFR as CEFRLevel,
      }
    });
  }, [selectedLanguage, selectedCEFR, searchTerm]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <ProtectedRoute>
      <AppLayout showBreadcrumb={false}>
        <div className="p-6 pr-6 flex-1 w-full mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Squeak Content Library</h1>
            <p className="text-lg text-muted-foreground">
              Need things to study? We've got you covered! Any content displayed here can be added to any database.
            </p>
          </div>

          <div className="mb-8">
            <div className="flex gap-4 max-w-fit">
              <div className="w-sm">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search by title, content, or topic..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">All Languages</SelectItem>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedCEFR} onValueChange={setSelectedCEFR}>
                <SelectTrigger>
                  <SelectValue placeholder="CEFR Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">All Levels</SelectItem>
                  {CEFR_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-wrap gap-6 mb-8">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="w-80 h-64">
                  <Skeleton className="w-full h-full" />
                </div>
              ))}
            </div>
          ) : contentItems.length > 0 ? (
            <div className="flex flex-wrap gap-6 mb-8">
              {contentItems.map((item) => (
                <ContentCard
                  key={item.id}
                  title={item.title}
                  preview={item.preview_text}
                  language={item.language as LanguageCode}
                  topic={item.topic}
                  cefrLevel={item.cefr_level as CEFRLevel}
                  dateCreated={item.date_created}
                  onSave={() => console.log('Save item:', item.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">
                No content found for your search criteria
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedLanguage("any");
                  setSelectedCEFR("any");
                }}
              >
                Clear filters
              </Button>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && contentItems.length > 0 && (
            <div className="flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  <PaginationItem>
                    <PaginationLink className="cursor-pointer">
                      {currentPage}
                    </PaginationLink>
                  </PaginationItem>
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => hasNextPage && handlePageChange(currentPage + 1)}
                      className={!hasNextPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </AppLayout>
    </ProtectedRoute>
  )
}