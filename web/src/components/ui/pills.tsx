import type { LanguageCode, CEFRLevel } from '@/hooks/useContentAPI';
import { LANGUAGES } from '@/lib/lang';

interface LanguagePillProps {
  languageCode: LanguageCode;
  className?: string;
}

interface CEFRPillProps {
  cefrLevel: CEFRLevel;
  className?: string;
}

export function LanguagePill({ languageCode, className = '' }: LanguagePillProps) {
  const language = LANGUAGES.find(lang => lang.value === languageCode);
  const displayName = language?.label || languageCode;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ${className}`}>
      {displayName}
    </span>
  );
}

export function CEFRPill({ cefrLevel, className = '' }: CEFRPillProps) {
  const getColorClasses = (level: CEFRLevel) => {
    switch (level) {
      case 'A1':
        return 'bg-green-100 text-green-800';
      case 'A2':
        return 'bg-green-200 text-green-900';
      case 'B1':
        return 'bg-yellow-100 text-yellow-800';
      case 'B2':
        return 'bg-yellow-200 text-yellow-900';
      case 'C1':
        return 'bg-red-100 text-red-800';
      case 'C2':
        return 'bg-red-200 text-red-900';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getColorClasses(cefrLevel)} ${className}`}>
      {cefrLevel}
    </span>
  );
} 