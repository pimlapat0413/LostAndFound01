'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, Trash2 } from 'lucide-react';

export interface FileItem {
  id: string;
  file?: File;
  previewUrl: string;
  name: string;
  size?: number;
}

export interface FileUploadProps {
  label?: string;
  helperText?: string;
  error?: string;
  maxSizeMB?: number;
  maxFiles?: number;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  value?: (File | string)[];
  onChange?: (files: File[]) => void;
  onRemove?: (index: number) => void;
  className?: string;
  required?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  helperText,
  error: externalError,
  maxSizeMB = 5,
  maxFiles = 5,
  accept = 'image/jpeg,image/png,image/jpg,image/webp',
  multiple = true,
  disabled = false,
  value,
  onChange,
  onRemove,
  className = '',
  required = false,
}) => {
  const [internalFiles, setInternalFiles] = useState<FileItem[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [internalError, setInternalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with value if provided as controlled prop
  useEffect(() => {
    if (value) {
      const items: FileItem[] = value.map((item, idx) => {
        if (typeof item === 'string') {
          return {
            id: `external-${idx}-${item}`,
            previewUrl: item,
            name: item.split('/').pop() || `รูปภาพที่ ${idx + 1}`,
          };
        } else {
          return {
            id: `file-${idx}-${item.name}-${item.lastModified}`,
            file: item,
            previewUrl: URL.createObjectURL(item),
            name: item.name,
            size: item.size,
          };
        }
      });
      setInternalFiles(items);

      return () => {
        items.forEach((it) => {
          if (it.file && it.previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(it.previewUrl);
          }
        });
      };
    }
  }, [value]);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const validateAndAddFiles = useCallback(
    (newFiles: File[]) => {
      setInternalError(null);

      if (disabled) return;

      const validFiles: File[] = [];
      const currentCount = internalFiles.length;

      if (currentCount + newFiles.length > maxFiles) {
        setInternalError(`สามารถอัปโหลดได้สูงสุดไม่เกิน ${maxFiles} รูป`);
        return;
      }

      for (const file of newFiles) {
        // Validate type
        const fileType = file.type;
        const isAcceptable =
          accept.includes(fileType) ||
          (fileType === '' && accept.includes(file.name.split('.').pop() || ''));

        if (!isAcceptable && accept !== '*/*') {
          setInternalError(`รองรับเฉพาะไฟล์รูปภาพ (JPG, PNG, WEBP)`);
          return;
        }

        // Validate size
        if (file.size > maxSizeBytes) {
          setInternalError(
            `ไฟล์ "${file.name}" มีขนาดเกิน ${maxSizeMB}MB (ขนาดปัจจุบัน ${(
              file.size /
              (1024 * 1024)
            ).toFixed(1)}MB)`
          );
          return;
        }

        validFiles.push(file);
      }

      if (validFiles.length > 0) {
        const newItems: FileItem[] = validFiles.map((file) => ({
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          file,
          previewUrl: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
        }));

        const updated = multiple ? [...internalFiles, ...newItems] : newItems;
        setInternalFiles(updated);

        const allRawFiles = updated
          .map((item) => item.file)
          .filter((f): f is File => f !== undefined);
        onChange?.(allRawFiles);
      }
    },
    [disabled, internalFiles, maxFiles, maxSizeMB, maxSizeBytes, accept, multiple, onChange]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      validateAndAddFiles(filesArray);
      e.dataTransfer.clearData();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      validateAndAddFiles(filesArray);
      // Reset input value so same file can be selected again if needed
      e.target.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    if (disabled) return;

    const removedItem = internalFiles[index];
    if (removedItem?.previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(removedItem.previewUrl);
    }

    const updated = internalFiles.filter((_, i) => i !== index);
    setInternalFiles(updated);

    const allRawFiles = updated
      .map((item) => item.file)
      .filter((f): f is File => f !== undefined);
    onChange?.(allRawFiles);
    onRemove?.(index);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const activeError = externalError || internalError;

  return (
    <div className={`w-full flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
          <span className="flex items-center gap-1">
            {label}
            {required && <span className="text-red-500">*</span>}
          </span>
          <span className="text-xs text-gray-400 font-normal">
            ({internalFiles.length}/{maxFiles} รูป)
          </span>
        </label>
      )}

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-3 ${
          disabled
            ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60'
            : isDragging
            ? 'border-blue-500 bg-blue-50/60 scale-[1.01]'
            : activeError
            ? 'border-red-300 bg-red-50/20 hover:border-red-400'
            : 'border-gray-300 bg-gray-50/50 hover:bg-blue-50/30 hover:border-blue-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleFileSelect}
          className="hidden"
        />

        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-200 ${
            isDragging ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'
          }`}
        >
          <Upload className="w-6 h-6" />
        </div>

        <div className="flex flex-col items-center gap-1">
          <p className="text-sm font-medium text-gray-700">
            <span className="text-blue-600 font-semibold hover:underline">คลิกเพื่อเลือกไฟล์</span> หรือลากไฟล์มาวางที่นี่
          </p>
          <p className="text-xs text-gray-500">
            รองรับไฟล์ JPG, PNG ขนาดไม่เกิน {maxSizeMB}MB (สูงสุด {maxFiles} รูป)
          </p>
        </div>
      </div>

      {/* Error or Helper message */}
      {activeError ? (
        <p className="text-xs text-red-600 flex items-center gap-1 mt-0.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{activeError}</span>
        </p>
      ) : helperText ? (
        <p className="text-xs text-gray-500 mt-0.5">{helperText}</p>
      ) : null}

      {/* Thumbnails Preview Grid */}
      {internalFiles.length > 0 && (
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {internalFiles.map((item, index) => (
            <div
              key={item.id}
              className="group relative rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow transition-shadow flex flex-col"
            >
              <div className="relative aspect-square w-full bg-gray-100 flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.previewUrl}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(index);
                    }}
                    className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-red-600 text-white rounded-full transition-colors opacity-90 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
                    title="ลบรูปภาพ"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="p-2 bg-white flex flex-col">
                <p className="text-xs font-medium text-gray-800 truncate" title={item.name}>
                  {item.name}
                </p>
                {item.size ? (
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {formatFileSize(item.size)}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

FileUpload.displayName = 'FileUpload';

export default FileUpload;
