import React, { useCallback } from 'react';

interface FileDropZoneProps {
  onFileSelect: (file: File) => void;
  disabled: boolean;
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({ onFileSelect, disabled }) => {
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        validateAndPass(files[0]);
      }
    },
    [disabled, onFileSelect]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndPass(e.target.files[0]);
    }
  };

  const validateAndPass = (file: File) => {
    const validTypes = [
      'image/jpeg',
      'image/png',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (validTypes.includes(file.type)) {
      onFileSelect(file);
    } else {
      alert('Unsupported file type. Please upload JPG, PNG, PDF, or DOCX.');
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200
        ${disabled 
          ? 'bg-gray-100 border-gray-300 dark:bg-slate-800 dark:border-slate-700 cursor-not-allowed opacity-60' 
          : 'bg-white border-blue-300 hover:border-blue-500 hover:bg-blue-50 dark:bg-slate-800 dark:border-slate-600 dark:hover:border-blue-400 dark:hover:bg-slate-700 cursor-pointer'}
      `}
    >
      <input
        type="file"
        id="fileInput"
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled}
        accept=".jpg,.jpeg,.png,.pdf,.docx"
      />
      
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <div>
          <p className="text-lg font-medium text-slate-700 dark:text-slate-200">
            Drag & drop your file here
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            or <label htmlFor="fileInput" className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium">browse files</label>
          </p>
        </div>
        <div className="text-xs text-slate-400 dark:text-slate-500">
          Supported: PDF, DOCX, JPG, PNG (Max 10MB)
        </div>
      </div>
    </div>
  );
};
