import React, { useCallback, useState } from 'react';
import { Upload, CheckCircle, X } from 'lucide-react';

interface FileUploadZoneProps {
  accept: string;
  onFileSelect: (file: File | null) => void;
  selectedFile?: File | null;
  title: string;
  description: string;
  icon: React.ReactNode;
  maxSize?: number; // w bajtach
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  accept,
  onFileSelect,
  selectedFile,
  title,
  description,
  icon,
  maxSize = 100 * 1024 * 1024 // 100MB default
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (file.size > maxSize) {
      return `Plik jest za duży. Maksymalny rozmiar: ${(maxSize / (1024 * 1024)).toFixed(0)}MB`;
    }

    // Sprawdź typ pliku
    const acceptedTypes = accept.split(',').map(type => type.trim());
    const isAccepted = acceptedTypes.some(type => {
      if (type === '*/*') return true;
      if (type.endsWith('/*')) {
        const category = type.split('/')[0];
        return file.type.startsWith(category + '/');
      }
      return file.type === type;
    });

    if (!isAccepted) {
      return `Nieobsługiwany typ pliku. Akceptowane: ${accept}`;
    }

    return null;
  }, [accept, maxSize]);

  const handleFileSelect = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    onFileSelect(file);
  }, [validateFile, onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleRemoveFile = useCallback(() => {
    onFileSelect(null);
    setError(null);
  }, [onFileSelect]);

  return (
    <div className="space-y-2">
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all
          ${isDragOver 
            ? 'border-primary bg-primary/10 scale-105' 
            : selectedFile 
              ? 'border-green-400 bg-green-900/20'
              : 'border-gray-600 hover:border-gray-500 bg-gray-900/30'
          }
          ${error ? 'border-red-400 bg-red-900/20' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {/* Upload Area */}
        {!selectedFile && (
          <>
            <input
              type="file"
              accept={accept}
              onChange={handleInputChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <div className="space-y-4">
              <div className="flex justify-center">
                {icon}
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {title}
                </h3>
                <p className="text-gray-300 text-sm">
                  {description}
                </p>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-primary">
                <Upload className="w-4 h-4" />
                <span className="text-sm">Kliknij lub przeciągnij plik</span>
              </div>
            </div>
          </>
        )}

        {/* Selected File */}
        {selectedFile && !error && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-green-400 mb-2">
                Plik wybrany!
              </h3>
              <p className="text-white font-medium">
                {selectedFile.name}
              </p>
              <p className="text-gray-400 text-sm">
                {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
              </p>
            </div>
            
            <button
              onClick={handleRemoveFile}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors"
            >
              <X className="w-4 h-4" />
              Usuń plik
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};