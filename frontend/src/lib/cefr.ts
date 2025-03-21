import { theme } from 'shared';

export const getCEFRColor = (level: string): string => {
  if (!level) return '#E0E0E0';
  
  const firstLetter = level.charAt(0).toUpperCase();
  
  switch (firstLetter) {
    case 'A':
      return theme.colors.cefr.A.bg;
    case 'B':
      return theme.colors.cefr.B.bg;
    case 'C':
      return theme.colors.cefr.C.bg;
    default:
      return '#E0E0E0';
  }
};

export const getCEFRTextColor = (level: string): string => {
  if (!level) return '#333333';
  
  const firstLetter = level.charAt(0).toUpperCase();
  
  switch (firstLetter) {
    case 'A':
      return theme.colors.cefr.A.text;
    case 'B':
      return theme.colors.cefr.B.text;
    case 'C':
      return theme.colors.cefr.C.text;
    default:
      return '#333333';
  }
};

export const getCEFRDifficulty = (level: string): string => {
  if (!level) return 'Unknown';
  
  const firstLetter = level.charAt(0).toUpperCase();
  
  switch (firstLetter) {
    case 'A':
      return 'Beginner';
    case 'B':
      return 'Intermediate';
    case 'C':
      return 'Advanced';
    default:
      return 'Unknown';
  }
}; 