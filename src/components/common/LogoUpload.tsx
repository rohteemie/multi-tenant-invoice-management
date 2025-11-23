import React, { useState, useRef } from 'react';
import { Button } from './Button';
import { ErrorMessage } from './ErrorMessage';

interface LogoUploadProps {
  currentLogoUrl?: string;
  onUpload: (file: File) => Promise<void>;
  onDelete?: () => Promise<void>;
  isLoading?: boolean;
}

export const LogoUpload: React.FC<LogoUploadProps> = ({
  currentLogoUrl,
  onUpload,
  onDelete,
  isLoading = false,
}) => {
  const [preview, setPreview] = useState<string | null>(currentLogoUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ALLOWED_FILE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return 'Invalid file type. Please upload PNG, JPG, or SVG files only.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File is too large. Maximum size is 2MB.';
    }
    return null;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    try {
      await onUpload(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload logo');
      setPreview(currentLogoUrl || null);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    setError(null);
    try {
      await onDelete();
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete logo');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setError(null);
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    try {
      await onUpload(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload logo');
      setPreview(currentLogoUrl || null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Organization Logo
        </label>
        
        {preview ? (
          <div className="space-y-4">
            <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
              <img
                src={preview}
                alt="Logo preview"
                className="max-h-40 mx-auto object-contain"
              />
            </div>
            {onDelete && (
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={handleDelete}
                  isLoading={isLoading}
                >
                  Delete Logo
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center ${
              isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <div className="mt-4">
              <label
                htmlFor="logo-upload"
                className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Choose file
                <input
                  ref={fileInputRef}
                  id="logo-upload"
                  name="logo-upload"
                  type="file"
                  className="sr-only"
                  accept=".png,.jpg,.jpeg,.svg"
                  onChange={handleFileChange}
                  disabled={isLoading}
                />
              </label>
              <p className="mt-2 text-xs text-gray-500">or drag and drop</p>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              PNG, JPG, or SVG up to 2MB
            </p>
          </div>
        )}
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}
    </div>
  );
};
