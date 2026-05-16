'use client';

import { useState, useRef } from 'react';

interface ImportResult {
  success: boolean;
  totalRows: number;
  successCount: number;
  skipCount: number;
  errorCount: number;
  errors?: Array<{ row: number; error: string }>;
}

type ImportStep = 'upload' | 'importing' | 'complete';

export function ImportCSVModal({
  isOpen,
  onClose,
  onImportComplete,
}: {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string>('');
  const [expandedErrors, setExpandedErrors] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError('');
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError('Please select a CSV file');
      return;
    }

    setCurrentStep('importing');
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/import/csv', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Import failed');
      }

      setImportResult(result);
      setCurrentStep('complete');
      onImportComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
      setCurrentStep('upload');
    }
  };

  const resetModal = () => {
    setSelectedFile(null);
    setImportResult(null);
    setError('');
    setCurrentStep('upload');
    setExpandedErrors(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn" style={{
      background: 'rgba(0, 0, 0, 0.7)'
    }}>
      <div className="rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" style={{
        background: 'var(--bg-primary)',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
        border: '1px solid var(--border-color)'
      }}>
        {/* Header */}
        <div className="relative overflow-hidden p-8 rounded-t-3xl" style={{
          background: 'var(--gradient-navbar)',
        }}>
          <h2 className="text-3xl font-black text-amber-50 flex items-center gap-3" style={{
            fontFamily: 'Playfair Display, serif',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          }}>
            <span className="text-4xl">📄</span>
            Import from CSV
          </h2>
          <p className="text-amber-100 mt-2 text-sm">
            {currentStep === 'upload' && 'Import books from a CSV file'}
            {currentStep === 'importing' && 'Importing your books...'}
            {currentStep === 'complete' && 'Import complete!'}
          </p>
        </div>

        <div className="p-6">
          {/* Step 1: Upload */}
          {currentStep === 'upload' && (
            <>
              {/* Instructions */}
              <div className="mb-6 p-4 rounded-xl" style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
              }}>
                <h3 className="font-bold mb-2 flex items-center gap-2" style={{ color: 'var(--text-dark)' }}>
                  <span>💡</span> CSV Format Requirements:
                </h3>
                <ul className="text-sm space-y-1 ml-6 list-disc" style={{ color: 'var(--text-muted)' }}>
                  <li>Must have <strong>Title</strong> and <strong>Author</strong> columns (required)</li>
                  <li>Optional columns: ISBN, Genre, Status, Rating, Series, Series Number</li>
                  <li>First row should contain column headers</li>
                  <li>UTF-8 encoding recommended</li>
                </ul>
              </div>

              {/* File Upload */}
              <div className="mb-6">
                <label className="block font-bold mb-3" style={{ color: 'var(--text-dark)' }}>
                  Select CSV File
                </label>
                <div className="flex flex-col gap-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                    id="csv-upload-generic"
                  />
                  <label
                    htmlFor="csv-upload-generic"
                    className="px-6 py-3 rounded-xl font-bold cursor-pointer transition-all hover:scale-105 inline-flex items-center justify-center gap-2"
                    style={{
                      background: 'var(--gradient-accent)',
                      color: 'var(--bg-primary)',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    <span>📁</span>
                    {selectedFile ? selectedFile.name : 'Choose File'}
                  </label>
                  {selectedFile && (
                    <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>
                      File selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                    </p>
                  )}
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-6 p-4 rounded-xl" style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                }}>
                  <p className="text-red-700 font-semibold flex items-center gap-2">
                    <span>⚠️</span>
                    {error}
                  </p>
                </div>
              )}
            </>
          )}

          {/* Step 2: Importing (Progress) */}
          {currentStep === 'importing' && (
            <div className="text-center py-12">
              <div className="inline-block">
                <svg className="animate-spin h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" style={{ color: 'var(--warm-brown)' }}>
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="text-xl font-bold mb-2" style={{ color: 'var(--text-dark)' }}>
                Importing your books...
              </p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Please wait while we process your CSV file
              </p>
            </div>
          )}

          {/* Step 3: Complete */}
          {currentStep === 'complete' && importResult && (
            <div className="space-y-4">
              <div className="p-6 rounded-xl" style={{
                background: 'var(--gradient-card)',
                border: '2px solid var(--border-color)',
              }}>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-dark)' }}>
                  <span>✓</span>
                  Import Complete!
                </h3>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="p-3 rounded-lg text-center" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
                    <p className="text-3xl font-bold mb-1" style={{ color: '#15803d' }}>
                      {importResult.successCount}
                    </p>
                    <p className="text-xs font-semibold" style={{ color: '#15803d' }}>
                      Imported
                    </p>
                  </div>
                  <div className="p-3 rounded-lg text-center" style={{ background: 'rgba(234, 179, 8, 0.1)' }}>
                    <p className="text-3xl font-bold mb-1" style={{ color: '#a16207' }}>
                      {importResult.skipCount}
                    </p>
                    <p className="text-xs font-semibold" style={{ color: '#a16207' }}>
                      Skipped
                    </p>
                  </div>
                  <div className="p-3 rounded-lg text-center" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                    <p className="text-3xl font-bold mb-1" style={{ color: '#b91c1c' }}>
                      {importResult.errorCount}
                    </p>
                    <p className="text-xs font-semibold" style={{ color: '#b91c1c' }}>
                      Errors
                    </p>
                  </div>
                </div>

                <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>
                  Total rows processed: {importResult.totalRows}
                </p>
              </div>

              {/* Error Details */}
              {importResult.errors && importResult.errors.length > 0 && (
                <div className="rounded-xl overflow-hidden" style={{
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                }}>
                  <button
                    onClick={() => setExpandedErrors(!expandedErrors)}
                    className="w-full p-4 flex items-center justify-between transition-all hover:bg-opacity-80"
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">⚠️</span>
                      <div className="text-left">
                        <p className="font-bold text-red-700">Import Errors</p>
                        <p className="text-xs text-red-600">{importResult.errors.length} errors occurred</p>
                      </div>
                    </div>
                    <svg
                      className={`w-5 h-5 transition-transform ${expandedErrors ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      style={{ color: '#b91c1c' }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedErrors && (
                    <div className="p-4 space-y-2 max-h-60 overflow-y-auto" style={{
                      background: 'white',
                    }}>
                      {importResult.errors.slice(0, 10).map((err, idx) => (
                        <div key={idx} className="p-2 rounded text-xs" style={{
                          background: 'rgba(239, 68, 68, 0.05)',
                        }}>
                          <p className="font-semibold text-red-800">Row {err.row}</p>
                          <p className="text-red-600">{err.error}</p>
                        </div>
                      ))}
                      {importResult.errors.length > 10 && (
                        <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                          +{importResult.errors.length - 10} more errors
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <button
              onClick={handleClose}
              className="flex-1 px-6 py-3 rounded-xl font-bold transition-all hover:scale-105"
              style={{
                background: 'var(--bg-tertiary)',
                color: 'var(--text-dark)',
                border: '2px solid var(--border-color)',
              }}
            >
              {currentStep === 'complete' ? 'Close' : 'Cancel'}
            </button>
            {currentStep === 'upload' && (
              <button
                onClick={handleImport}
                disabled={!selectedFile}
                className="flex-1 px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'var(--gradient-accent)',
                  color: 'var(--bg-primary)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                }}
              >
                Import Books
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
