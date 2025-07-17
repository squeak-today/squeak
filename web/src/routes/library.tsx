import { createFileRoute } from '@tanstack/react-router'
import { LibraryPage } from '@/components/pages/LibraryPage'
import { type LanguageCode, type CEFRLevel } from '@/hooks/useContentAPI'

interface LibrarySearch {
  search?: string
  cefr_level?: CEFRLevel
  language_code?: LanguageCode
}

export const Route = createFileRoute('/library')({
  component: LibraryPage,
  validateSearch: (search: Record<string, unknown>): LibrarySearch => {
    return {
      search: search.search as string,
      cefr_level: search.cefr_level as CEFRLevel,
      language_code: search.language_code as LanguageCode,
    }
  },
})
