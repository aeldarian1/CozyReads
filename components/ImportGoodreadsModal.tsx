'use client';

import { useState, useRef } from 'react';
import { ManualBookSelectionModal } from './ManualBookSelectionModal';

interface ImportResult {
  totalProcessed: number;
  imported: number;
  skipped: number;
  failed: number;
  errors: Array<{ row: number; book: string; error: string }>;
  collectionsCreated: string[];
  needsVerification: Array<{
    bookId: string;
    title: string;
    author: string;
    isbn: string | null;
    reason: string;
  }>;
}

interface ParsedBook {
  title: string;
  author: string;
  isbn: string | null;
  rating: number;
  readingStatus: string;
  totalPages: number | null;
  review: string | null;
  genre: string | null;
  shelves: string[];
  dateAdded: string;
}

type ImportStep = 'upload' | 'preview' | 'importing' | 'complete';

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
  const [fastMode, setFastMode] = useState(false);
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload');
  const [parsedBooks, setParsedBooks] = useState<ParsedBook[]>([]);
  const [selectedBookIndices, setSelectedBookIndices] = useState<Set<number>>(new Set());
  const [progress, setProgress] = useState({ current: 0, total: 0, currentBook: '' });
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string>('');
  const [expandedErrors, setExpandedErrors] = useState<Set<number>>(new Set());
  const [selectedBookForVerification, setSelectedBookForVerification] = useState<ImportResult['needsVerification'][0] | null>(null);
  const [verifiedBooks, setVerifiedBooks] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError('');
      setImportResult(null);

      // Parse CSV to show preview
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('previewOnly', 'true');

        const response = await fetch('/api/import/goodreads', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to parse CSV');
        }

        setParsedBooks(data.books || []);
        // Select all books by default
        setSelectedBookIndices(new Set(data.books.map((_: any, idx: number) => idx)));
        setCurrentStep('preview');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to parse CSV');
      }
    }
  };

  const toggleBookSelection = (index: number) => {
    const newSelected = new Set(selectedBookIndices);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedBookIndices(newSelected);
  };

  const selectAll = () => {
    setSelectedBookIndices(new Set(parsedBooks.map((_, idx) => idx)));
  };

  const deselectAll = () => {
    setSelectedBookIndices(new Set());
  };

  const handleImport = async () => {
    if (!selectedFile || selectedBookIndices.size === 0) {
      setError('Please select at least one book to import');
      return;
    }

    setCurrentStep('importing');
    setError('');
    setProgress({ current: 0, total: selectedBookIndices.size, currentBook: '' });

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('skipDuplicates', String(skipDuplicates));
      formData.append('createCollections', String(createCollections));
      formData.append('enrichFromGoogle', String(enrichFromGoogle));
      formData.append('fastMode', String(fastMode));
      formData.append('selectedIndices', JSON.stringify(Array.from(selectedBookIndices)));

      const response = await fetch('/api/import/goodreads', {
        method: 'POST',
        body: formData,
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim()) {
              try {
                const data = JSON.parse(line);
                if (data.type === 'progress') {
                  setProgress({
                    current: data.current || 0,
                    total: data.total || 0,
                    currentBook: data.currentBook || '',
                  });
                } else if (data.type === 'complete') {
                  setImportResult(data.result);
                  setCurrentStep('complete');
                  onImportComplete();
                } else if (data.type === 'error') {
                  setError(data.error || 'Import failed');
                  setCurrentStep('preview');
                }
              } catch (e) {
                console.error('Failed to parse progress:', e);
              }
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
      setCurrentStep('preview');
    }
  };

  const handleBookSelected = async (bookId: string, selectedData: any) => {
    const volumeInfo = selectedData.volumeInfo;

    // Extract data from Google Books result
    const updateData = {
      description: volumeInfo.description || undefined,
      coverUrl: volumeInfo.imageLinks?.thumbnail?.replace('http://', 'https://') || undefined,
      genre: volumeInfo.categories?.join(', ') || undefined,
      publisher: volumeInfo.publisher || undefined,
      publishedDate: volumeInfo.publishedDate || undefined,
      totalPages: volumeInfo.pageCount || undefined,
    };

    // Remove undefined values
    const cleanData = Object.fromEntries(
      Object.entries(updateData).filter(([_, v]) => v !== undefined)
    );

    // Call the update API
    const response = await fetch(`/api/books/${bookId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanData),
    });

    if (!response.ok) {
      throw new Error('Failed to update book');
    }

    // Mark as verified
    setVerifiedBooks(prev => new Set([...prev, bookId]));
  };

  const resetModal = () => {
    setSelectedFile(null);
    setParsedBooks([]);
    setSelectedBookIndices(new Set());
    setImportResult(null);
    setError('');
    setCurrentStep('upload');
    setProgress({ current: 0, total: 0, currentBook: '' });
    setExpandedErrors(new Set());
    setSelectedBookForVerification(null);
    setVerifiedBooks(new Set());
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

  const toggleErrorExpand = (index: number) => {
    const newExpanded = new Set(expandedErrors);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedErrors(newExpanded);
  };

  // Group errors by type
  const groupedErrors = importResult?.errors.reduce((acc, error) => {
    const type = error.error.includes('ISBN') ? 'ISBN Missing' :
                 error.error.includes('Rating') ? 'Rating Missing' :
                 error.error.includes('Description') ? 'Description Missing' :
                 'Other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(error);
    return acc;
  }, {} as Record<string, typeof importResult.errors>) || {};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn" style={{
      background: 'rgba(0, 0, 0, 0.7)'
    }}>
      <div className="rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" style={{
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
            {currentStep === 'upload' && 'Import your reading library from a Goodreads CSV export'}
            {currentStep === 'preview' && `Found ${parsedBooks.length} books - select which ones to import`}
            {currentStep === 'importing' && `Importing ${progress.current} of ${progress.total} books...`}
            {currentStep === 'complete' && 'Import complete!'}
          </p>

          {/* Progress Bar */}
          {currentStep === 'importing' && (
            <div className="mt-4">
              <div className="w-full rounded-full h-3 overflow-hidden" style={{
                background: 'rgba(255, 255, 255, 0.2)'
              }}>
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${(progress.current / progress.total) * 100}%`,
                    background: 'linear-gradient(90deg, #d4a574 0%, #c9a961 100%)',
                  }}
                />
              </div>
              <p className="text-amber-100 text-xs mt-2">
                {progress.currentBook && `Processing: ${progress.currentBook}`}
              </p>
            </div>
          )}
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
                  <span>💡</span> How to export from Goodreads:
                </h3>
                <ol className="text-sm space-y-1 ml-6 list-decimal" style={{ color: 'var(--text-muted)' }}>
                  <li>Go to <a href="https://www.goodreads.com/review/import" target="_blank" rel="noopener noreferrer" className="text-amber-700 hover:underline">Goodreads Import/Export</a></li>
                  <li>Click "Export Library" button</li>
                  <li>Wait for the CSV file to download</li>
                  <li>Upload the file below</li>
                </ol>
              </div>

              {/* File Upload */}
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

                {enrichFromGoogle && (
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl transition-all hover:bg-opacity-50 ml-8" style={{
                    background: 'var(--bg-tertiary)',
                    borderLeft: '3px solid var(--warm-brown)',
                  }}>
                    <input
                      type="checkbox"
                      checked={fastMode}
                      onChange={(e) => setFastMode(e.target.checked)}
                      className="w-5 h-5 rounded"
                    />
                    <div>
                      <p className="font-semibold flex items-center gap-2" style={{ color: 'var(--text-dark)' }}>
                        <span>⚡</span>
                        Fast Mode
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        2-3x faster imports for large libraries (100+ books). Uses Google Books only.
                      </p>
                    </div>
                  </label>
                )}
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

          {/* Step 2: Preview */}
          {currentStep === 'preview' && (
            <>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>
                    {selectedBookIndices.size} of {parsedBooks.length} books selected
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={selectAll}
                    className="px-3 py-1 rounded-lg text-sm font-semibold transition-all hover:scale-105"
                    style={{
                      background: 'var(--bg-tertiary)',
                      color: 'var(--text-dark)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    Select All
                  </button>
                  <button
                    onClick={deselectAll}
                    className="px-3 py-1 rounded-lg text-sm font-semibold transition-all hover:scale-105"
                    style={{
                      background: 'var(--bg-tertiary)',
                      color: 'var(--text-dark)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto rounded-xl" style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
              }}>
                {parsedBooks.slice(0, 50).map((book, idx) => (
                  <div
                    key={idx}
                    onClick={() => toggleBookSelection(idx)}
                    className="p-3 border-b cursor-pointer transition-all hover:bg-opacity-70"
                    style={{
                      borderColor: 'var(--border-color)',
                      background: selectedBookIndices.has(idx) ? 'var(--bg-tertiary)' : 'transparent',
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedBookIndices.has(idx)}
                        onChange={() => toggleBookSelection(idx)}
                        className="mt-1 w-4 h-4 rounded"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate" style={{ color: 'var(--text-dark)' }}>
                          {book.title}
                        </p>
                        <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                          by {book.author}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {book.isbn && (
                            <span className="text-xs px-2 py-0.5 rounded" style={{
                              background: 'rgba(34, 197, 94, 0.1)',
                              color: '#15803d',
                            }}>
                              ISBN ✓
                            </span>
                          )}
                          {book.rating > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded" style={{
                              background: 'rgba(234, 179, 8, 0.1)',
                              color: '#a16207',
                            }}>
                              {book.rating} ★
                            </span>
                          )}
                          <span className="text-xs px-2 py-0.5 rounded" style={{
                            background: 'rgba(139, 111, 71, 0.1)',
                            color: 'var(--warm-brown)',
                          }}>
                            {book.readingStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {parsedBooks.length > 50 && (
                  <div className="p-3 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    +{parsedBooks.length - 50} more books (showing first 50)
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-4 p-4 rounded-xl" style={{
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

          {/* Step 3: Importing (Progress) */}
          {currentStep === 'importing' && (
            <div className="text-center py-12">
              <div className="inline-block">
                <svg className="animate-spin h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" style={{ color: 'var(--warm-brown)' }}>
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="text-xl font-bold mb-2" style={{ color: 'var(--text-dark)' }}>
                Importing your library...
              </p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {progress.current} of {progress.total} books processed
              </p>
            </div>
          )}

          {/* Step 4: Complete */}
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
                      {importResult.imported}
                    </p>
                    <p className="text-xs font-semibold" style={{ color: '#15803d' }}>
                      Imported
                    </p>
                  </div>
                  <div className="p-3 rounded-lg text-center" style={{ background: 'rgba(234, 179, 8, 0.1)' }}>
                    <p className="text-3xl font-bold mb-1" style={{ color: '#a16207' }}>
                      {importResult.skipped}
                    </p>
                    <p className="text-xs font-semibold" style={{ color: '#a16207' }}>
                      Skipped
                    </p>
                  </div>
                  <div className="p-3 rounded-lg text-center" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                    <p className="text-3xl font-bold mb-1" style={{ color: '#b91c1c' }}>
                      {importResult.failed}
                    </p>
                    <p className="text-xs font-semibold" style={{ color: '#b91c1c' }}>
                      Failed
                    </p>
                  </div>
                </div>

                {importResult.collectionsCreated.length > 0 && (
                  <div className="p-3 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                    <p className="font-semibold mb-2" style={{ color: 'var(--text-dark)' }}>
                      Collections Created ({importResult.collectionsCreated.length}):
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

              {/* Books Needing Manual Verification */}
              {importResult.needsVerification && importResult.needsVerification.length > 0 && (
                <div className="p-6 rounded-xl" style={{
                  background: 'var(--gradient-card)',
                  border: '2px solid rgba(234, 179, 8, 0.5)',
                }}>
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-dark)' }}>
                    <span>🔍</span>
                    {importResult.needsVerification.length - verifiedBooks.size} Book{importResult.needsVerification.length - verifiedBooks.size !== 1 ? 's' : ''} Need Manual Verification
                  </h3>
                  <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                    These books were imported but are missing some information. Click to search and select the correct book.
                  </p>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {importResult.needsVerification.map((book, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          verifiedBooks.has(book.bookId) ? 'opacity-50' : 'hover:border-[var(--warm-brown)] cursor-pointer'
                        }`}
                        style={{
                          background: verifiedBooks.has(book.bookId) ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-secondary)',
                          borderColor: verifiedBooks.has(book.bookId) ? '#15803d' : 'var(--border-color)',
                        }}
                        onClick={() => !verifiedBooks.has(book.bookId) && setSelectedBookForVerification(book)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="font-semibold mb-1" style={{ color: 'var(--text-dark)' }}>
                              {book.title}
                            </p>
                            <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
                              by {book.author}
                            </p>
                            <p className="text-xs" style={{ color: '#d97706' }}>
                              {book.reason}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            {verifiedBooks.has(book.bookId) ? (
                              <span className="text-2xl">✓</span>
                            ) : (
                              <button
                                onClick={() => setSelectedBookForVerification(book)}
                                className="px-3 py-1 rounded-lg text-xs font-semibold hover:scale-105 transition-transform"
                                style={{
                                  background: 'var(--warm-brown)',
                                  color: '#ffffff',
                                }}
                              >
                                Fix
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Grouped Error Details */}
              {Object.keys(groupedErrors).length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-bold" style={{ color: 'var(--text-dark)' }}>
                    Import Issues:
                  </h4>
                  {Object.entries(groupedErrors).map(([errorType, errors], groupIdx) => (
                    <div key={groupIdx} className="rounded-xl overflow-hidden" style={{
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                    }}>
                      <button
                        onClick={() => toggleErrorExpand(groupIdx)}
                        className="w-full p-4 flex items-center justify-between transition-all hover:bg-opacity-80"
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {errorType.includes('ISBN') ? '🔢' :
                             errorType.includes('Rating') ? '⭐' :
                             errorType.includes('Description') ? '📝' : '⚠️'}
                          </span>
                          <div className="text-left">
                            <p className="font-bold text-red-700">{errorType}</p>
                            <p className="text-xs text-red-600">{errors.length} books affected</p>
                          </div>
                        </div>
                        <svg
                          className={`w-5 h-5 transition-transform ${expandedErrors.has(groupIdx) ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          style={{ color: '#b91c1c' }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {expandedErrors.has(groupIdx) && (
                        <div className="p-4 space-y-2 max-h-60 overflow-y-auto" style={{
                          background: 'white',
                        }}>
                          {errors.map((err, idx) => (
                            <div key={idx} className="p-2 rounded text-xs" style={{
                              background: 'rgba(239, 68, 68, 0.05)',
                            }}>
                              <p className="font-semibold text-red-800">Row {err.row}: {err.book}</p>
                              <p className="text-red-600">{err.error}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t" style={{ borderColor: 'var(--border-color)' }}>
            {currentStep === 'preview' && (
              <button
                onClick={() => setCurrentStep('upload')}
                className="px-6 py-3 rounded-xl font-bold transition-all hover:scale-105"
                style={{
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-dark)',
                  border: '2px solid var(--border-color)',
                }}
              >
                ← Back
              </button>
            )}
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
            {currentStep === 'preview' && (
              <button
                onClick={handleImport}
                disabled={selectedBookIndices.size === 0}
                className="flex-1 px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'var(--gradient-accent)',
                  color: 'var(--bg-primary)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                }}
              >
                Import {selectedBookIndices.size} Books
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Manual Book Selection Modal */}
      {selectedBookForVerification && (
        <ManualBookSelectionModal
          isOpen={!!selectedBookForVerification}
          onClose={() => setSelectedBookForVerification(null)}
          book={selectedBookForVerification}
          onBookSelected={handleBookSelected}
        />
      )}
    </div>
  );
}
