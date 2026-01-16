import React from 'react';
import { ExtractionStatus } from '../types';

interface ExtractionStatusProps {
  status: ExtractionStatus;
  fileName?: string;
}

export const StatusIndicator: React.FC<ExtractionStatusProps> = ({ status, fileName }) => {
  if (status === 'idle') return null;

  return (
    <div className="w-full mt-6 bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm animate-fade-in transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate max-w-[70%]">
          {fileName}
        </span>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {status === 'success' ? 'Completed' : status === 'error' ? 'Failed' : 'Processing'}
        </span>
      </div>

      <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        {status === 'uploading' && (
          <div className="h-full bg-blue-500 w-1/3 animate-[shimmer_1.5s_infinite_linear] rounded-full" />
        )}
        {status === 'processing' && (
          <div className="h-full bg-indigo-500 w-2/3 animate-[shimmer_2s_infinite_linear] rounded-full" />
        )}
        {status === 'success' && (
          <div className="h-full bg-green-500 w-full transition-all duration-500 ease-out" />
        )}
        {status === 'error' && (
          <div className="h-full bg-red-500 w-full" />
        )}
      </div>

      <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-2">
        {status === 'processing' && (
          <>
            <svg className="animate-spin h-3 w-3 text-indigo-500 dark:text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Analyzing document structure and running OCR...</span>
          </>
        )}
        {status === 'uploading' && <span>Uploading to secure local server...</span>}
        {status === 'success' && <span className="text-green-600 dark:text-green-400">Text extraction successful.</span>}
      </div>
    </div>
  );
};
