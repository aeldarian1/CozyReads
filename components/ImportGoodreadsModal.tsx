'use client';

import { useState, useRef } from 'react';

interface ImportResult {
  totalProcessed: number;
  imported: number;
  skipped: number;
  failed: number;
  errors: Array<{ row: number; book: string; error: string }>;
  collectionsCreated: string[];
}

export function ImportGoodreadsModal({
  isOpen,
  onClose,
  onImportComplete,
}: {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [createCollections, setCreateCollections] = useState(true);
  const [enrichFromGoogle, setEnrichFromGoogle] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string>('');
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
      setError('Please select a file');
      return;
    }

    setIsImporting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('skipDuplicates', String(skipDuplicates));
      formData.append('createCollections', String(createCollections));
      formData.append('enrichFromGoogle', String(enrichFromGoogle));

      const response = await fetch('/api/import/goodreads', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Import failed');
      }

      setImportResult(data.result);
      onImportComplete(); // Refresh books list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  const resetModal = () => {
    setSelectedFile(null);
    setImportResult(null);
    setError('');
    setSkipDuplicates(true);
    setCreateCollections(true);
    setEnrichFromGoogle(true);
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
            <span className="text-4xl">📚</span>
            Import from Goodreads
          </h2>
          <p className="text-amber-100 mt-2 text-sm">
            Import your reading library from a Goodreads CSV export
          </p>
        </div>

        <div className="p-6">
          {/* Instructions */}
          {!importResult && (
            <div className="mb-6 p-4 rounded-xl" style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
            }}>
              <h3 className="font-bold mb-2 flex items-center gap-2" style={{ color: 'var(--text-dark)' }}>
                <span>💡</span> How to export from Goodreads:
              </h3>
              <ol className="text-sm space-y-1 ml-6 list-decimal" style={{ color: 'var(--text-muted)' }}>
                <li>Go to <a href="https://www.goodreads.com/review/import" target="_blank" rel="noopener noreferrer" className="text-amber-700 hover:underline">Goodreads Import/Export</a></li>
                <li>Click "Export Library" button</li>
                <li>Wait for the CSV file to download</li>
                <li>Upload the file below</li>
              </ol>
            </div>
          )}

          {/* File Upload */}
          {!importResult && (
            <>
              <div className="mb-6">
                <label className="block font-bold mb-3" style={{ color: 'var(--text-dark)' }}>
                  Select CSV File
                </label>
                <div className="flex items-center gap-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label
                    htmlFor="csv-upload"
                    className="px-6 py-3 rounded-xl font-bold cursor-pointer transition-all hover:scale-105 inline-flex items-center gap-2"
                    style={{
                      background: 'var(--gradient-accent)',
                      color: 'var(--bg-primary)',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    <span>📁</span>
                    Choose File
                  </label>
                  {selectedFile && (
                    <div className="flex-1 px-4 py-2 rounded-lg" style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                    }}>
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-dark)' }}>
                        {selectedFile.name}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Options */}
              <div className="mb-6 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl transition-all hover:bg-opacity-50" style={{
                  background: 'var(--bg-tertiary)',
                }}>
                  <input
                    type="checkbox"
                    checked={skipDuplicates}
                    onChange={(e) => setSkipDuplicates(e.target.checked)}
                    className="w-5 h-5 rounded"
                  />
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-dark)' }}>
                      Skip duplicates
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Don't import books that are already in your library
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl transition-all hover:bg-opacity-50" style={{
                  background: 'var(--bg-tertiary)',
                }}>
                  <input
                    type="checkbox"
                    checked={createCollections}
                    onChange={(e) => setCreateCollections(e.target.checked)}
                    className="w-5 h-5 rounded"
                  />
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-dark)' }}>
                      Create collections from shelves
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Convert your Goodreads custom shelves into CozyReads collections
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl transition-all hover:bg-opacity-50" style={{
                  background: 'var(--bg-tertiary)',
                }}>
                  <input
                    type="checkbox"
                    checked={enrichFromGoogle}
                    onChange={(e) => setEnrichFromGoogle(e.target.checked)}
                    className="w-5 h-5 rounded"
                  />
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-dark)' }}>
                      Fetch covers & genres from Google Books
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Automatically fetch missing book covers, genres, and descriptions (recommended)
                    </p>
                  </div>
                </label>
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

          {/* Import Result */}
          {importResult && (
            <div className="space-y-4">
              <div className="p-6 rounded-xl" style={{
                background: 'var(--gradient-card)',
                border: '2px solid var(--border-color)',
              }}>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-dark)' }}>
                  <span>✓</span>
                  Import Complete!
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                    <p className="text-2xl font-bold" style={{ color: '#22c55e' }}>
                      {importResult.imported}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      Books Imported
                    </p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                    <p className="text-2xl font-bold" style={{ color: '#f59e0b' }}>
                      {importResult.skipped}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      Skipped (Duplicates)
                    </p>
                  </div>
                </div>

                {importResult.failed > 0 && (
                  <div className="p-3 rounded-lg mb-4" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                    <p className="text-lg font-bold text-red-700">
                      {importResult.failed} Failed
                    </p>
                    <p className="text-xs text-red-600">
                      See details below
                    </p>
                  </div>
                )}

                {importResult.collectionsCreated.length > 0 && (
                  <div className="p-3 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                    <p className="font-semibold mb-2" style={{ color: 'var(--text-dark)' }}>
                      Collections Created:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {importResult.collectionsCreated.map((name, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 rounded-full text-xs font-semibold"
                          style={{
                            background: 'var(--gradient-accent)',
                            color: 'var(--bg-primary)',
                          }}
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Error Details */}
              {importResult.errors.length > 0 && (
                <div className="p-4 rounded-xl max-h-60 overflow-y-auto" style={{
                  background: 'rgba(239, 68, 68, 0.05)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'var(--warm-brown) transparent',
                }}>
                  <h4 className="font-bold mb-3 text-red-700">Import Errors:</h4>
                  <div className="space-y-2">
                    {importResult.errors.map((err, idx) => (
                      <div key={idx} className="p-2 rounded bg-white text-xs">
                        <p className="font-semibold text-red-800">Row {err.row}: {err.book}</p>
                        <p className="text-red-600">{err.error}</p>
                      </div>
                    ))}
                  </div>
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
              {importResult ? 'Close' : 'Cancel'}
            </button>
            {!importResult && (
              <button
                onClick={handleImport}
                disabled={!selectedFile || isImporting}
                className="flex-1 px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'var(--gradient-accent)',
                  color: 'var(--bg-primary)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                }}
              >
                {isImporting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Importing...
                  </span>
                ) : (
                  'Start Import'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
