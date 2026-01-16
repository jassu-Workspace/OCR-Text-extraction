import React, { useState, useEffect } from 'react';
import { FileDropZone } from './components/FileDropZone';
import { StatusIndicator } from './components/ExtractionStatus';
import { ResultsPanel } from './components/ResultsPanel';
import { ExtractionResult, ExtractionStatus, FileState } from './types';

// Use relative path for API. 
// Locally: Vite proxies '/api' to 'http://localhost:3001/api'
// Production: Express serves both frontend and API on the same origin.
const API_URL = '/api/extract';

export default function App() {
  const [fileState, setFileState] = useState<FileState>({ file: null, previewUrl: null });
  const [status, setStatus] = useState<ExtractionStatus>('idle');
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const handleFileSelect = (file: File) => {
    // Revoke old object url to avoid leaks
    if (fileState.previewUrl) URL.revokeObjectURL(fileState.previewUrl);
    
    setFileState({
      file,
      previewUrl: URL.createObjectURL(file)
    });
    setStatus('selected');
    setResult(null);
    setErrorMessage(null);
  };

  const handleExtraction = async () => {
    if (!fileState.file) return;

    setStatus('uploading');
    setErrorMessage(null);
    
    const formData = new FormData();
    formData.append('file', fileState.file);

    try {
      setStatus('processing');
      
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        // Safe error handling: Check if response is JSON before parsing
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to extract text');
        } else {
            // Fallback for 404s or server crashes that return HTML
            throw new Error(`Server connection failed (${response.status}). Please check if the backend is running.`);
        }
      }

      const data: ExtractionResult = await response.json();
      setResult(data);
      setStatus('success');
    } catch (error: any) {
      console.error('Extraction error:', error);
      setStatus('error');
      setErrorMessage(error.message || 'An unknown error occurred during processing.');
    }
  };

  const handleReset = () => {
    setFileState({ file: null, previewUrl: null });
    setStatus('idle');
    setResult(null);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center mb-10 relative">
           <button 
             onClick={toggleDarkMode}
             className="absolute right-0 top-0 p-2 rounded-full bg-white dark:bg-slate-700 text-slate-600 dark:text-yellow-400 shadow-sm hover:shadow-md transition-all"
             title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
           >
             {darkMode ? (
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
             ) : (
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
             )}
           </button>

          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
            Local OCR <span className="text-blue-600 dark:text-blue-400">Extractor</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto text-center font-medium">
            Unlock the power of your documents with the most secure text extraction tool on the market. 
            Effortlessly convert PDFs, Images, and Docs into editable text—fast, accurate, and completely private.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-6 md:p-8 transition-colors duration-300">
          
          {/* Upload Area */}
          {status === 'idle' || status === 'selected' ? (
             <div className="space-y-6">
                <FileDropZone 
                  onFileSelect={handleFileSelect} 
                  disabled={false}
                />
                
                {status === 'selected' && fileState.file && (
                  <div className="animate-fade-in flex flex-col sm:flex-row items-center justify-between bg-blue-50 dark:bg-slate-700 p-4 rounded-lg border border-blue-100 dark:border-slate-600">
                     <div className="flex items-center gap-3 mb-4 sm:mb-0">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{fileState.file.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {(fileState.file.size / 1024 / 1024).toFixed(2)} MB • {fileState.file.type}
                          </p>
                        </div>
                     </div>
                     <div className="flex gap-2 w-full sm:w-auto">
                       <button 
                          onClick={handleReset}
                          className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-white dark:hover:bg-slate-600 rounded-md transition-colors"
                        >
                          Change File
                       </button>
                       <button 
                          onClick={handleExtraction}
                          className="flex-1 sm:flex-none px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all active:scale-[0.98]"
                        >
                          Start Extraction
                       </button>
                     </div>
                  </div>
                )}
             </div>
          ) : null}

          {/* Status & Processing */}
          {status !== 'idle' && status !== 'selected' && (
             <div className="max-w-xl mx-auto text-center">
                {status !== 'success' && status !== 'error' && (
                  <div className="py-8">
                     <div className="mx-auto w-16 h-16 border-4 border-blue-100 dark:border-slate-600 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mb-4"></div>
                     <h3 className="text-xl font-bold text-slate-800 dark:text-white">Processing Document</h3>
                     <p className="text-slate-500 dark:text-slate-400 mt-2">
                       This involves OCR and can take a few moments for large files.
                     </p>
                  </div>
                )}
                <StatusIndicator status={status} fileName={fileState.file?.name} />
                
                {status === 'error' && (
                  <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                    <strong>Error:</strong> {errorMessage}
                    <div className="mt-3">
                       <button onClick={handleReset} className="underline hover:text-red-800 dark:hover:text-red-200">Try another file</button>
                    </div>
                  </div>
                )}
             </div>
          )}

          {/* Results */}
          {status === 'success' && result && (
            <div className="animate-fade-in-up">
              <ResultsPanel result={result} />
              <div className="mt-6 text-center">
                <button 
                  onClick={handleReset}
                  className="inline-flex items-center text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Process another file
                </button>
              </div>
            </div>
          )}

        </div>
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-lg bg-white/50 dark:bg-slate-800/50">
                <div className="text-2xl mb-2">🔒</div>
                <h3 className="font-bold text-slate-700 dark:text-slate-200">100% Secure</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Files never leave your local server environment.</p>
            </div>
            <div className="p-4 rounded-lg bg-white/50 dark:bg-slate-800/50">
                <div className="text-2xl mb-2">⚡</div>
                <h3 className="font-bold text-slate-700 dark:text-slate-200">Instant Results</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Powered by optimized, open-source OCR technology.</p>
            </div>
            <div className="p-4 rounded-lg bg-white/50 dark:bg-slate-800/50">
                <div className="text-2xl mb-2">🛡️</div>
                <h3 className="font-bold text-slate-700 dark:text-slate-200">Privacy Guaranteed</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Zero data retention. Automatic file deletion.</p>
            </div>
        </div>
      </div>
    </div>
  );
}