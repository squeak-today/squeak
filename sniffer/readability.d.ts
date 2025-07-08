declare module 'readability' {
  export class Readability {
    constructor(doc: Document);
    parse(): {
      title: string;
      content: string;
      textContent: string;
      excerpt: string;
      length: number;
    } | null;
  }
} 