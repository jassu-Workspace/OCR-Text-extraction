export interface PageContent {
  page: number;
  text: string;
}

export interface ExtractionResult {
  pages: PageContent[];
  meta: {
    pageCount: number;
    fileType: string;
    processingTimeMs: number;
  };
}

export type ExtractionStatus = 'idle' | 'selected' | 'uploading' | 'processing' | 'success' | 'error';

export interface FileState {
  file: File | null;
  previewUrl: string | null;
}
