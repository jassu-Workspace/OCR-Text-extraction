import React, { useState, useRef, useEffect } from 'react';
import { ExtractionResult } from '../types';
import html2canvas from "html2canvas";

interface ResultsPanelProps {
  result: ExtractionResult | null;
}

type DownloadFormat = 'txt' | 'pdf' | 'docx' | 'png' | 'jpeg';

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ result }) => {
  const [format, setFormat] = useState<DownloadFormat>('txt');
  const [isGenerating, setIsGenerating] = useState(false);
  const [editableText, setEditableText] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result) {
      // Combine text on mount
      const text = result.pages.map(p => `--- Page ${p.page} ---\n${p.text}`).join('\n\n');
      setEditableText(text);
    }
  }, [result]);

  if (!result) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(editableText);
    alert('Copied to clipboard!');
  };

  const downloadTxt = () => {
    const blob = new Blob([editableText], { type: 'text/plain' });
    saveBlob(blob, 'extracted_text.txt');
  };

  const downloadFromBackend = async (format: 'pdf' | 'docx') => {
    const response = await fetch(`/api/download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: editableText, format }) // Send the edited text
    });

    if (!response.ok) throw new Error('Generation failed on server');

    const blob = await response.blob();
    const extension = format;
    saveBlob(blob, `extracted_text.${extension}`);
  };

  const downloadImage = async (type: 'png' | 'jpeg') => {
    if (!contentRef.current) return;
    
    // We render the *editable* text into a hidden div for snapshotting
    // to ensure the image matches what the user sees/edited.
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '-9999px';
    container.style.left = '-9999px';
    container.style.width = '800px'; // Fixed width for nice image
    container.style.background = '#ffffff'; 
    container.style.color = '#000000';
    container.className = 'p-10 bg-white font-mono text-sm whitespace-pre-wrap';
    container.innerText = editableText;

    document.body.appendChild(container);

    try {
        const canvas = await html2canvas(container, {
            scale: 2,
            backgroundColor: '#ffffff',
            useCORS: true
        });
        
        const link = document.createElement('a');
        link.download = `extracted_text.${type}`;
        link.href = canvas.toDataURL(`image/${type}`);
        link.click();
    } catch (err) {
        console.error("Image generation failed", err);
        throw err;
    } finally {
        if (document.body.contains(container)) {
            document.body.removeChild(container);
        }
    }
  };

  const saveBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const element = document.createElement("a");
    element.href = url;
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAction = async () => {
    setIsGenerating(true);
    try {
        if (format === 'txt') {
            downloadTxt();
        } else if (format === 'pdf' || format === 'docx') {
            await downloadFromBackend(format);
        } else if (format === 'png' || format === 'jpeg') {
            await downloadImage(format);
        }
    } catch (e) {
        console.error(e);
        alert("Failed to generate file. Please try again.");
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <div className="mt-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
      <div className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Extracted Content</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Preview and edit your text before downloading.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={handleCopy}
            className="flex items-center px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy
          </button>
          
          <div className="h-6 w-px bg-slate-300 dark:bg-slate-600 mx-1 hidden md:block"></div>

          <div className="flex rounded-lg shadow-sm">
             <select 
               value={format} 
               onChange={(e) => setFormat(e.target.value as DownloadFormat)}
               className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-l-lg hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
             >
                <option value="txt">.txt (Text)</option>
                <option value="docx">.docx (Word)</option>
                <option value="pdf">.pdf (Document)</option>
                <option value="png">.png (Image)</option>
                <option value="jpeg">.jpeg (Image)</option>
             </select>
             <button
                onClick={handleDownloadAction}
                disabled={isGenerating}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-slate-800 dark:bg-slate-900 border border-slate-800 dark:border-slate-900 rounded-r-lg hover:bg-slate-700 dark:hover:bg-slate-950 transition-colors disabled:opacity-50"
             >
               {isGenerating ? (
                   <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
               ) : (
                   <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                   </svg>
               )}
               Download
             </button>
          </div>
        </div>
      </div>
      
      <div 
        ref={contentRef}
        className="relative"
      >
        <textarea
          value={editableText}
          onChange={(e) => setEditableText(e.target.value)}
          className="w-full h-[400px] p-6 bg-white dark:bg-slate-800 font-mono text-sm text-slate-700 dark:text-slate-300 leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-100 dark:focus:ring-slate-700"
          spellCheck={false}
        />
        <div className="absolute bottom-4 right-6 text-xs text-slate-400 pointer-events-none">
           Editable Preview
        </div>
      </div>
    </div>
  );
};