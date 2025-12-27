'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Upload,
  FileText,
  BookOpen,
  Sparkles,
  Check,
  X,
  AlertCircle,
  ChevronRight,
  Settings,
  Download,
  Zap,
  Library,
  GripVertical,
  Eye,
  CloudUpload,
  Search,
  Filter,
  SlidersHorizontal,
  Star,
  Calendar,
  Tag
} from 'lucide-react';

type ImportSource = 'goodreads' | 'librarything' | 'calibre' | 'storygraph' | 'csv' | 'json';
type ImportStep = 'source' | 'upload' | 'mapping' | 'preview' | 'importing' | 'complete';

interface ImportConfig {
  source: ImportSource;
  skipDuplicates: boolean;
  createCollections: boolean;
  enrichFromGoogle: boolean;
  fastMode: boolean;
}

const IMPORT_SOURCES = [
  {
    id: 'goodreads' as ImportSource,
    name: 'Goodreads',
    icon: '📚',
    description: 'Import your Goodreads library CSV export',
    color: 'linear-gradient(135deg, #c9a961 0%, #d4a574 100%)',
    textColor: '#2d1f15',
    popular: true,
  },
  {
    id: 'librarything' as ImportSource,
    name: 'LibraryThing',
    icon: '📖',
    description: 'Import from LibraryThing export',
    color: 'linear-gradient(135deg, #8b6f47 0%, #a08968 100%)',
    textColor: '#fff',
  },
  {
    id: 'calibre' as ImportSource,
    name: 'Calibre',
    icon: '💾',
    description: 'Import from Calibre library export',
    color: 'linear-gradient(135deg, #b8956a 0%, #c9a961 100%)',
    textColor: '#2d1f15',
  },
  {
    id: 'storygraph' as ImportSource,
    name: 'StoryGraph',
    icon: '📊',
    description: 'Import your StoryGraph export',
    color: 'linear-gradient(135deg, #a08968 0%, #b8956a 100%)',
    textColor: '#fff',
  },
  {
    id: 'csv' as ImportSource,
    name: 'Custom CSV',
    icon: '📄',
    description: 'Import any CSV file with column mapping',
    color: 'linear-gradient(135deg, #d4a574 0%, #e5c194 100%)',
    textColor: '#2d1f15',
  },
  {
    id: 'json' as ImportSource,
    name: 'JSON File',
    icon: '{}',
    description: 'Import from JSON export',
    color: 'linear-gradient(135deg, #c89b65 0%, #d4a574 100%)',
    textColor: '#2d1f15',
  },
];

export function AdvancedImportModal({
  isOpen,
  onClose,
  onImportComplete,
}: {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}) {
  const [currentStep, setCurrentStep] = useState<ImportStep>('source');
  const [selectedSource, setSelectedSource] = useState<ImportSource | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [config, setConfig] = useState<ImportConfig>({
    source: 'goodreads',
    skipDuplicates: true,
    createCollections: true,
    enrichFromGoogle: true,
    fastMode: false,
  });
  const [progress, setProgress] = useState({ current: 0, total: 0, currentBook: '' });
  const [importResult, setImportResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [parsedBooks, setParsedBooks] = useState<any[]>([]);
  const [selectedBookIndices, setSelectedBookIndices] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Advanced Filtering State
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterMinRating, setFilterMinRating] = useState<number>(0);
  const [filterMaxRating, setFilterMaxRating] = useState<number>(5);
  const [sortBy, setSortBy] = useState<'title' | 'author' | 'rating' | 'dateAdded'>('title');

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.csv') || file.name.endsWith('.json')) {
        setSelectedFile(file);
        setCurrentStep('preview');
      }
    }
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError('');

      // For Goodreads, parse and show preview
      if (selectedSource === 'goodreads') {
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
          setSelectedBookIndices(new Set(data.books.map((_: any, idx: number) => idx)));
          setCurrentStep('preview');
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to parse file');
        }
      } else {
        // For other sources, go straight to preview
        setCurrentStep('preview');
      }
    }
  };

  const handleImport = async () => {
    if (!selectedFile || !selectedSource) return;

    setCurrentStep('importing');
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('skipDuplicates', String(config.skipDuplicates));
      formData.append('createCollections', String(config.createCollections));
      formData.append('enrichFromGoogle', String(config.enrichFromGoogle));
      formData.append('fastMode', String(config.fastMode));

      if (selectedSource === 'goodreads' && selectedBookIndices.size > 0) {
        formData.append('selectedIndices', JSON.stringify(Array.from(selectedBookIndices)));
      }

      const apiEndpoint = selectedSource === 'goodreads' ? '/api/import/goodreads' : '/api/import/csv';
      const response = await fetch(apiEndpoint, {
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

  const handleSourceSelect = (source: ImportSource) => {
    setSelectedSource(source);
    setConfig({ ...config, source });
    setCurrentStep('upload');
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

  // Filter and sort books
  const getFilteredAndSortedBooks = () => {
    let filtered = parsedBooks.map((book, index) => ({ ...book, originalIndex: index }));

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (book) =>
          book.title?.toLowerCase().includes(query) ||
          book.author?.toLowerCase().includes(query) ||
          book.isbn?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (filterStatus.length > 0) {
      filtered = filtered.filter((book) => filterStatus.includes(book.readingStatus));
    }

    // Apply rating filter
    filtered = filtered.filter((book) => {
      const rating = book.rating || 0;
      return rating >= filterMinRating && rating <= filterMaxRating;
    });

    // Sort books
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        case 'author':
          return (a.author || '').localeCompare(b.author || '');
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'dateAdded':
          return (b.dateAdded || '').localeCompare(a.dateAdded || '');
        default:
          return 0;
      }
    });

    return filtered;
  };

  const filteredBooks = getFilteredAndSortedBooks();
  const activeFiltersCount =
    (searchQuery.trim() ? 1 : 0) +
    (filterStatus.length > 0 ? 1 : 0) +
    (filterMinRating > 0 || filterMaxRating < 5 ? 1 : 0);

  const toggleStatusFilter = (status: string) => {
    setFilterStatus(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterStatus([]);
    setFilterMinRating(0);
    setFilterMaxRating(5);
  };

  const handleClose = () => {
    setCurrentStep('source');
    setSelectedSource(null);
    setSelectedFile(null);
    setParsedBooks([]);
    setSelectedBookIndices(new Set());
    setImportResult(null);
    setError('');
    setProgress({ current: 0, total: 0, currentBook: '' });

    // Reset filters
    setShowFilters(false);
    setSearchQuery('');
    setFilterStatus([]);
    setFilterMinRating(0);
    setFilterMaxRating(5);
    setSortBy('title');

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
      style={{
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(252, 250, 248, 0.98) 100%)',
          border: '1px solid rgba(139, 111, 71, 0.2)',
        }}
      >
        {/* Decorative Background Pattern */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%238b6f47' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Header */}
        <div
          className="relative p-8 border-b"
          style={{
            background: 'linear-gradient(135deg, #5d4e37 0%, #8b6f47 50%, #a08968 100%)',
            borderColor: 'rgba(255, 255, 255, 0.2)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div
                className="p-4 rounded-2xl backdrop-blur-xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <CloudUpload className="w-8 h-8 text-amber-100" strokeWidth={2.5} />
              </div>
              <div>
                <h2
                  className="text-4xl font-black text-amber-50 mb-1"
                  style={{
                    fontFamily: 'Playfair Display, serif',
                    textShadow: '2px 4px 8px rgba(0,0,0,0.3)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Import Your Library
                </h2>
                <p className="text-amber-100 text-sm font-medium" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                  {currentStep === 'source' && 'Choose your import source'}
                  {currentStep === 'upload' && 'Upload your library file'}
                  {currentStep === 'preview' && 'Review and customize your import'}
                  {currentStep === 'importing' && 'Importing your books...'}
                  {currentStep === 'complete' && 'Import complete!'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-3 rounded-xl transition-all duration-300 hover:scale-110 hover:rotate-90"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <X className="w-6 h-6 text-amber-100" strokeWidth={2.5} />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2">
            {(['source', 'upload', 'preview', 'importing', 'complete'] as ImportStep[]).map((step, idx) => {
              const stepNames = {
                source: 'Source',
                upload: 'Upload',
                preview: 'Preview',
                importing: 'Import',
                complete: 'Done',
              };
              const currentIdx = ['source', 'upload', 'preview', 'importing', 'complete'].indexOf(currentStep);
              const isActive = idx === currentIdx;
              const isComplete = idx < currentIdx;

              return (
                <div key={step} className="flex items-center gap-2 flex-1">
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300"
                    style={{
                      background: isActive
                        ? 'rgba(255, 255, 255, 0.3)'
                        : isComplete
                        ? 'rgba(255, 255, 255, 0.15)'
                        : 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${isActive ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                    }}
                  >
                    {isComplete ? (
                      <Check className="w-4 h-4 text-green-300" strokeWidth={3} />
                    ) : (
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{
                          background: isActive ? '#fff' : 'rgba(255, 255, 255, 0.3)',
                        }}
                      />
                    )}
                    <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-amber-200'}`}>
                      {stepNames[step]}
                    </span>
                  </div>
                  {idx < 4 && (
                    <div className="flex-1 h-0.5" style={{ background: 'rgba(255, 255, 255, 0.2)' }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Step 1: Source Selection */}
          {currentStep === 'source' && (
            <div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2" style={{ color: '#2d1f15', fontFamily: 'Playfair Display, serif' }}>
                  Select Import Source
                </h3>
                <p className="text-gray-600">
                  Choose where you're importing your books from
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {IMPORT_SOURCES.map((source) => (
                  <button
                    key={source.id}
                    onClick={() => handleSourceSelect(source.id)}
                    className="group relative p-6 rounded-2xl text-left"
                    style={{
                      background: 'linear-gradient(135deg, rgba(249, 247, 243, 0.6) 0%, rgba(255, 255, 255, 0.9) 100%)',
                      border: '2px solid rgba(139, 111, 71, 0.2)',
                      transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      willChange: 'transform',
                      transform: 'translateZ(0)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px) translateZ(0)';
                      e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(139, 111, 71, 0.2), 0 10px 10px -5px rgba(139, 111, 71, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateZ(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {source.popular && (
                      <div className="absolute -top-2 -right-2 px-3 py-1 rounded-full text-xs font-bold shadow-lg" style={{
                        background: 'linear-gradient(135deg, #c9a961 0%, #d4a574 100%)',
                        color: '#2d1f15',
                      }}>
                        ⭐ Popular
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg"
                        style={{ background: source.color, color: source.textColor }}
                      >
                        {source.icon}
                      </div>
                      <ChevronRight
                        className="w-6 h-6 group-hover:translate-x-1"
                        style={{
                          color: '#8b6f47',
                          transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          willChange: 'transform',
                        }}
                        strokeWidth={2.5}
                      />
                    </div>

                    <h4 className="text-xl font-bold mb-2" style={{ color: '#2d1f15', fontFamily: 'Playfair Display, serif' }}>
                      {source.name}
                    </h4>
                    <p className="text-sm" style={{ color: '#8b6f47' }}>
                      {source.description}
                    </p>
                  </button>
                ))}
              </div>

              {/* Quick Tips */}
              <div className="mt-8 p-6 rounded-2xl" style={{
                background: 'linear-gradient(135deg, rgba(201, 169, 97, 0.05) 0%, rgba(212, 165, 116, 0.05) 100%)',
                border: '2px dashed rgba(139, 111, 71, 0.3)',
              }}>
                <div className="flex items-start gap-4">
                  <Sparkles className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: '#c9a961' }} strokeWidth={2} />
                  <div>
                    <h4 className="font-bold mb-2" style={{ color: '#2d1f15' }}>Pro Tips</h4>
                    <ul className="text-sm space-y-1" style={{ color: '#5d4e37' }}>
                      <li>• For best results, export your full library including ratings and reviews</li>
                      <li>• Large libraries (500+ books) may take 5-10 minutes to import</li>
                      <li>• We'll automatically fetch missing covers and descriptions</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: File Upload */}
          {currentStep === 'upload' && selectedSource && (
            <div>
              <div className="text-center mb-8">
                <div className="inline-block mb-4">
                  <div
                    className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl bg-gradient-to-br ${IMPORT_SOURCES.find(s => s.id === selectedSource)?.color} shadow-xl`}
                  >
                    {IMPORT_SOURCES.find(s => s.id === selectedSource)?.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: '#2d1f15', fontFamily: 'Playfair Display, serif' }}>
                  Upload {IMPORT_SOURCES.find(s => s.id === selectedSource)?.name} File
                </h3>
                <p className="text-gray-600">
                  Drag and drop your file or click to browse
                </p>
              </div>

              {/* Drag & Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="relative p-12 rounded-3xl transition-all duration-300 cursor-pointer group"
                style={{
                  background: isDragging
                    ? 'linear-gradient(135deg, rgba(201, 169, 97, 0.15) 0%, rgba(212, 165, 116, 0.15) 100%)'
                    : 'linear-gradient(135deg, rgba(249, 247, 243, 0.6) 0%, rgba(252, 250, 248, 0.9) 100%)',
                  border: isDragging
                    ? '3px dashed #c9a961'
                    : '3px dashed rgba(139, 111, 71, 0.3)',
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={selectedSource === 'json' ? '.json' : '.csv'}
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="text-center">
                  <div className="mb-6">
                    <Upload className="w-20 h-20 mx-auto text-gray-400 group-hover:text-gray-600 transition-colors" strokeWidth={1.5} />
                  </div>

                  <h4 className="text-xl font-bold mb-2" style={{ color: '#2d1f15' }}>
                    {isDragging ? 'Drop your file here' : 'Drop file here or click to browse'}
                  </h4>
                  <p className="text-sm text-gray-600 mb-6">
                    Accepts {selectedSource === 'json' ? 'JSON' : 'CSV'} files up to 50MB
                  </p>

                  {selectedFile && (
                    <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl" style={{
                      background: 'rgba(34, 197, 94, 0.1)',
                      border: '2px solid rgba(34, 197, 94, 0.3)',
                    }}>
                      <FileText className="w-5 h-5 text-green-700" strokeWidth={2} />
                      <span className="font-semibold text-green-900">{selectedFile.name}</span>
                      <Check className="w-5 h-5 text-green-700" strokeWidth={2.5} />
                    </div>
                  )}
                </div>
              </div>

              {/* Import Settings */}
              <div className="mt-8 space-y-4">
                <h4 className="font-bold text-lg mb-4" style={{ color: '#2d1f15' }}>
                  Import Settings
                </h4>

                <label className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all hover:shadow-md" style={{
                  background: 'rgba(255, 255, 255, 0.6)',
                  border: '2px solid rgba(139, 111, 71, 0.2)',
                }}>
                  <input
                    type="checkbox"
                    checked={config.skipDuplicates}
                    onChange={(e) => setConfig({ ...config, skipDuplicates: e.target.checked })}
                    className="w-5 h-5 rounded"
                  />
                  <div className="flex-1">
                    <div className="font-semibold mb-1" style={{ color: '#2d1f15' }}>
                      Skip Duplicate Books
                    </div>
                    <div className="text-sm text-gray-600">
                      Don't import books that already exist in your library
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all hover:shadow-md" style={{
                  background: 'rgba(255, 255, 255, 0.6)',
                  border: '2px solid rgba(139, 111, 71, 0.2)',
                }}>
                  <input
                    type="checkbox"
                    checked={config.createCollections}
                    onChange={(e) => setConfig({ ...config, createCollections: e.target.checked })}
                    className="w-5 h-5 rounded"
                  />
                  <div className="flex-1">
                    <div className="font-semibold mb-1" style={{ color: '#2d1f15' }}>
                      Create Collections from Shelves
                    </div>
                    <div className="text-sm text-gray-600">
                      Convert your custom shelves into CozyReads collections
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all hover:shadow-md" style={{
                  background: 'rgba(255, 255, 255, 0.6)',
                  border: '2px solid rgba(139, 111, 71, 0.2)',
                }}>
                  <input
                    type="checkbox"
                    checked={config.enrichFromGoogle}
                    onChange={(e) => setConfig({ ...config, enrichFromGoogle: e.target.checked })}
                    className="w-5 h-5 rounded"
                  />
                  <div className="flex-1">
                    <div className="font-semibold mb-1 flex items-center gap-2" style={{ color: '#2d1f15' }}>
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Auto-Enrich Book Data
                    </div>
                    <div className="text-sm text-gray-600">
                      Automatically fetch missing covers, genres, and descriptions
                    </div>
                  </div>
                </label>

                {config.enrichFromGoogle && (
                  <label className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all hover:shadow-md ml-8" style={{
                    background: 'rgba(255, 255, 255, 0.6)',
                    border: '2px solid rgba(234, 179, 8, 0.3)',
                    borderLeft: '4px solid #eab308',
                  }}>
                    <input
                      type="checkbox"
                      checked={config.fastMode}
                      onChange={(e) => setConfig({ ...config, fastMode: e.target.checked })}
                      className="w-5 h-5 rounded"
                    />
                    <div className="flex-1">
                      <div className="font-semibold mb-1 flex items-center gap-2" style={{ color: '#2d1f15' }}>
                        <Zap className="w-4 h-4 text-yellow-600" />
                        Fast Mode
                      </div>
                      <div className="text-sm text-gray-600">
                        2-3x faster imports for large libraries (100+ books)
                      </div>
                    </div>
                  </label>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setCurrentStep('source')}
                  className="flex-1 px-6 py-4 rounded-xl font-bold transition-all hover:scale-105"
                  style={{
                    background: 'rgba(255, 255, 255, 0.6)',
                    border: '2px solid rgba(139, 111, 71, 0.3)',
                    color: '#5d4e37',
                  }}
                >
                  ← Back
                </button>
                <button
                  onClick={() => setCurrentStep('preview')}
                  disabled={!selectedFile}
                  className="flex-1 px-6 py-4 rounded-xl font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                  style={{
                    background: selectedFile
                      ? 'linear-gradient(135deg, #c9a961 0%, #d4a574 100%)'
                      : '#ccc',
                    color: '#2d1f15',
                  }}
                >
                  Continue to Preview →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Preview */}
          {currentStep === 'preview' && (
            <div>
              {error && (
                <div className="mb-6 p-4 rounded-xl flex items-center gap-3" style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '2px solid rgba(239, 68, 68, 0.3)',
                }}>
                  <AlertCircle className="w-5 h-5 text-red-600" strokeWidth={2} />
                  <span className="text-red-800 font-semibold">{error}</span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2" style={{ color: '#2d1f15', fontFamily: 'Playfair Display, serif' }}>
                  Review Your Books
                </h3>
                <p className="text-gray-600">
                  {parsedBooks.length > 0
                    ? `Found ${parsedBooks.length} books${filteredBooks.length !== parsedBooks.length ? ` • Showing ${filteredBooks.length} after filters` : ''}. Select which ones to import.`
                    : 'Ready to import your books'}
                </p>
              </div>

              {parsedBooks.length > 0 && (
                <>
                  {/* Search and Filter Bar */}
                  <div className="mb-4 space-y-3">
                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#8b6f47' }} strokeWidth={2} />
                      <input
                        type="text"
                        placeholder="Search by title, author, or ISBN..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl font-medium transition-all"
                        style={{
                          background: 'rgba(255, 255, 255, 0.8)',
                          border: '2px solid rgba(139, 111, 71, 0.3)',
                          color: '#2d1f15',
                        }}
                      />
                    </div>

                    {/* Filter Toggle and Sort */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all hover:scale-105"
                        style={{
                          background: showFilters
                            ? 'linear-gradient(135deg, #c9a961 0%, #d4a574 100%)'
                            : 'rgba(255, 255, 255, 0.8)',
                          border: `2px solid ${showFilters ? '#c9a961' : 'rgba(139, 111, 71, 0.3)'}`,
                          color: showFilters ? '#2d1f15' : '#5d4e37',
                        }}
                      >
                        <SlidersHorizontal className="w-5 h-5" strokeWidth={2} />
                        <span>Filters</span>
                        {activeFiltersCount > 0 && (
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-bold"
                            style={{
                              background: showFilters ? 'rgba(45, 31, 21, 0.2)' : 'linear-gradient(135deg, #c9a961 0%, #d4a574 100%)',
                              color: showFilters ? '#2d1f15' : '#fff',
                            }}
                          >
                            {activeFiltersCount}
                          </span>
                        )}
                      </button>

                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="flex-1 px-4 py-2.5 rounded-xl font-semibold transition-all"
                        style={{
                          background: 'rgba(255, 255, 255, 0.8)',
                          border: '2px solid rgba(139, 111, 71, 0.3)',
                          color: '#5d4e37',
                        }}
                      >
                        <option value="title">Sort by Title</option>
                        <option value="author">Sort by Author</option>
                        <option value="rating">Sort by Rating</option>
                        <option value="dateAdded">Sort by Date Added</option>
                      </select>

                      {activeFiltersCount > 0 && (
                        <button
                          onClick={clearFilters}
                          className="px-4 py-2.5 rounded-xl font-semibold transition-all hover:scale-105"
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '2px solid rgba(239, 68, 68, 0.3)',
                            color: '#dc2626',
                          }}
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Advanced Filters Panel */}
                    {showFilters && (
                      <div
                        className="p-6 rounded-2xl space-y-6 animate-fadeIn"
                        style={{
                          background: 'linear-gradient(135deg, rgba(201, 169, 97, 0.05) 0%, rgba(212, 165, 116, 0.05) 100%)',
                          border: '2px solid rgba(139, 111, 71, 0.3)',
                        }}
                      >
                        {/* Reading Status Filter */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <BookOpen className="w-4 h-4" style={{ color: '#8b6f47' }} strokeWidth={2} />
                            <label className="font-bold text-sm" style={{ color: '#2d1f15' }}>
                              Reading Status
                            </label>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {['Want to Read', 'Currently Reading', 'Finished'].map((status) => (
                              <button
                                key={status}
                                onClick={() => toggleStatusFilter(status)}
                                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105"
                                style={{
                                  background: filterStatus.includes(status)
                                    ? 'linear-gradient(135deg, #c9a961 0%, #d4a574 100%)'
                                    : 'rgba(255, 255, 255, 0.8)',
                                  border: `2px solid ${filterStatus.includes(status) ? '#c9a961' : 'rgba(139, 111, 71, 0.2)'}`,
                                  color: filterStatus.includes(status) ? '#2d1f15' : '#5d4e37',
                                }}
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Rating Filter */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Star className="w-4 h-4" style={{ color: '#8b6f47' }} strokeWidth={2} />
                            <label className="font-bold text-sm" style={{ color: '#2d1f15' }}>
                              Rating Range
                            </label>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center gap-4">
                              <span className="text-sm font-medium" style={{ color: '#5d4e37' }}>
                                Min: {filterMinRating} ⭐
                              </span>
                              <input
                                type="range"
                                min="0"
                                max="5"
                                step="1"
                                value={filterMinRating}
                                onChange={(e) => setFilterMinRating(Number(e.target.value))}
                                className="flex-1"
                                style={{
                                  accentColor: '#c9a961',
                                }}
                              />
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-sm font-medium" style={{ color: '#5d4e37' }}>
                                Max: {filterMaxRating} ⭐
                              </span>
                              <input
                                type="range"
                                min="0"
                                max="5"
                                step="1"
                                value={filterMaxRating}
                                onChange={(e) => setFilterMaxRating(Number(e.target.value))}
                                className="flex-1"
                                style={{
                                  accentColor: '#c9a961',
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                </>
              )}

              {filteredBooks.length > 0 && (
                <>
                  {/* Selection Controls */}
                  <div className="flex items-center justify-between mb-4 p-4 rounded-xl" style={{
                    background: 'linear-gradient(135deg, rgba(201, 169, 97, 0.05) 0%, rgba(212, 165, 116, 0.05) 100%)',
                    border: '2px solid rgba(139, 111, 71, 0.2)',
                  }}>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" style={{ color: '#8b6f47' }} strokeWidth={2} />
                      <span className="font-bold" style={{ color: '#2d1f15' }}>
                        {selectedBookIndices.size} of {parsedBooks.length} selected
                      </span>
                      {filteredBooks.length !== parsedBooks.length && (
                        <span className="text-sm" style={{ color: '#8b6f47' }}>
                          ({filteredBooks.filter(b => selectedBookIndices.has(b.originalIndex)).length} visible)
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const newSelected = new Set(selectedBookIndices);
                          filteredBooks.forEach(book => newSelected.add(book.originalIndex));
                          setSelectedBookIndices(newSelected);
                        }}
                        className="px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105"
                        style={{
                          background: 'rgba(255, 255, 255, 0.8)',
                          border: '2px solid rgba(139, 111, 71, 0.3)',
                          color: '#5d4e37',
                        }}
                      >
                        Select {filteredBooks.length !== parsedBooks.length ? 'Visible' : 'All'}
                      </button>
                      <button
                        onClick={() => {
                          const newSelected = new Set(selectedBookIndices);
                          filteredBooks.forEach(book => newSelected.delete(book.originalIndex));
                          setSelectedBookIndices(newSelected);
                        }}
                        className="px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105"
                        style={{
                          background: 'rgba(255, 255, 255, 0.8)',
                          border: '2px solid rgba(139, 111, 71, 0.3)',
                          color: '#5d4e37',
                        }}
                      >
                        Deselect {filteredBooks.length !== parsedBooks.length ? 'Visible' : 'All'}
                      </button>
                    </div>
                  </div>

                  {/* Books List */}
                  <div className="max-h-[400px] overflow-y-auto space-y-2 mb-6">
                    {filteredBooks.map((book) => {
                      const isSelected = selectedBookIndices.has(book.originalIndex);
                      return (
                        <div
                          key={book.originalIndex}
                          onClick={() => toggleBookSelection(book.originalIndex)}
                          className="p-4 rounded-xl cursor-pointer transition-all hover:shadow-md"
                          style={{
                            background: isSelected
                              ? 'linear-gradient(135deg, rgba(201, 169, 97, 0.1) 0%, rgba(212, 165, 116, 0.1) 100%)'
                              : 'rgba(255, 255, 255, 0.6)',
                            border: isSelected
                              ? '2px solid #c9a961'
                              : '2px solid rgba(139, 111, 71, 0.2)',
                          }}
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-1 transition-all"
                              style={{
                                background: isSelected
                                  ? 'linear-gradient(135deg, #c9a961 0%, #d4a574 100%)'
                                  : 'rgba(255, 255, 255, 0.8)',
                                border: `2px solid ${isSelected ? '#c9a961' : 'rgba(139, 111, 71, 0.3)'}`,
                              }}
                            >
                              {isSelected && <Check className="w-3 h-3" style={{ color: '#2d1f15' }} strokeWidth={3} />}
                            </div>
                            <div className="flex-1">
                              <div className="font-bold mb-1" style={{ color: '#2d1f15' }}>
                                {book.title || 'Unknown Title'}
                              </div>
                              <div className="text-sm mb-1" style={{ color: '#5d4e37' }}>
                                {book.author || 'Unknown Author'}
                              </div>
                              <div className="flex flex-wrap gap-2 text-xs" style={{ color: '#8b6f47' }}>
                                {book.isbn && <span>ISBN: {book.isbn}</span>}
                                {book.rating && <span>⭐ {book.rating}</span>}
                                {book.readingStatus && (
                                  <span className="px-2 py-0.5 rounded" style={{
                                    background: 'rgba(201, 169, 97, 0.2)',
                                    color: '#5d4e37',
                                  }}>
                                    {book.readingStatus}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* No Results from Filters */}
              {parsedBooks.length > 0 && filteredBooks.length === 0 && (
                <div className="text-center py-12 px-4 rounded-2xl mb-6" style={{
                  background: 'linear-gradient(135deg, rgba(201, 169, 97, 0.05) 0%, rgba(212, 165, 116, 0.05) 100%)',
                  border: '2px dashed rgba(139, 111, 71, 0.3)',
                }}>
                  <Filter className="w-16 h-16 mx-auto mb-4" style={{ color: '#8b6f47' }} strokeWidth={1.5} />
                  <h3 className="text-xl font-bold mb-2" style={{ color: '#2d1f15' }}>
                    No books match your filters
                  </h3>
                  <p className="text-sm mb-4" style={{ color: '#5d4e37' }}>
                    Try adjusting your search or filter criteria
                  </p>
                  <button
                    onClick={clearFilters}
                    className="px-6 py-2 rounded-xl font-semibold transition-all hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, #c9a961 0%, #d4a574 100%)',
                      color: '#2d1f15',
                    }}
                  >
                    Clear All Filters
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentStep('upload')}
                  className="flex-1 px-6 py-4 rounded-xl font-bold transition-all hover:scale-105"
                  style={{
                    background: 'rgba(255, 255, 255, 0.6)',
                    border: '2px solid rgba(139, 111, 71, 0.3)',
                    color: '#5d4e37',
                  }}
                >
                  ← Back
                </button>
                <button
                  onClick={handleImport}
                  disabled={parsedBooks.length > 0 && selectedBookIndices.size === 0}
                  className="flex-1 px-6 py-4 rounded-xl font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                  style={{
                    background: (parsedBooks.length === 0 || selectedBookIndices.size > 0)
                      ? 'linear-gradient(135deg, #c9a961 0%, #d4a574 100%)'
                      : '#ccc',
                    color: '#2d1f15',
                  }}
                >
                  {parsedBooks.length > 0
                    ? `Import ${selectedBookIndices.size} Books →`
                    : 'Start Import →'}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Importing */}
          {currentStep === 'importing' && (
            <div className="text-center py-12">
              <div className="mb-8">
                <div
                  className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center animate-pulse"
                  style={{
                    background: 'linear-gradient(135deg, #c9a961 0%, #d4a574 100%)',
                    boxShadow: '0 8px 32px rgba(201, 169, 97, 0.4)',
                  }}
                >
                  <CloudUpload className="w-12 h-12" style={{ color: '#2d1f15' }} strokeWidth={2} />
                </div>

                <h3 className="text-3xl font-bold mb-3" style={{ color: '#2d1f15', fontFamily: 'Playfair Display, serif' }}>
                  Importing Your Library
                </h3>
                <p className="text-lg mb-8" style={{ color: '#5d4e37' }}>
                  {progress.currentBook || 'Processing books...'}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="max-w-2xl mx-auto mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold" style={{ color: '#5d4e37' }}>
                    {progress.current} of {progress.total} books
                  </span>
                  <span className="text-sm font-bold" style={{ color: '#c9a961' }}>
                    {progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0}%
                  </span>
                </div>
                <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(139, 111, 71, 0.2)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%`,
                      background: 'linear-gradient(90deg, #c9a961 0%, #d4a574 50%, #c89b65 100%)',
                      boxShadow: '0 2px 8px rgba(201, 169, 97, 0.4)',
                    }}
                  />
                </div>
              </div>

              {/* Progress Details */}
              <div className="max-w-2xl mx-auto p-6 rounded-xl" style={{
                background: 'linear-gradient(135deg, rgba(201, 169, 97, 0.05) 0%, rgba(212, 165, 116, 0.05) 100%)',
                border: '2px solid rgba(139, 111, 71, 0.2)',
              }}>
                <div className="flex items-center justify-center gap-2 text-sm" style={{ color: '#8b6f47' }}>
                  <Sparkles className="w-4 h-4" style={{ color: '#c9a961' }} />
                  <span>
                    {config.enrichFromGoogle && 'Enriching book data • '}
                    {config.skipDuplicates && 'Skipping duplicates • '}
                    {config.createCollections && 'Creating collections'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Complete */}
          {currentStep === 'complete' && importResult && (
            <div className="text-center py-12">
              <div
                className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  boxShadow: '0 8px 32px rgba(34, 197, 94, 0.4)',
                }}
              >
                <Check className="w-16 h-16 text-white" strokeWidth={3} />
              </div>

              <h3 className="text-4xl font-bold mb-3" style={{ color: '#2d1f15', fontFamily: 'Playfair Display, serif' }}>
                Import Complete!
              </h3>
              <p className="text-lg mb-8" style={{ color: '#5d4e37' }}>
                Your library has been successfully imported
              </p>

              {/* Stats Grid */}
              <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
                <div className="p-6 rounded-2xl" style={{
                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.1) 100%)',
                  border: '2px solid rgba(34, 197, 94, 0.3)',
                }}>
                  <div className="text-4xl font-black mb-2" style={{ color: '#15803d' }}>
                    {importResult.successful || 0}
                  </div>
                  <div className="text-sm font-bold" style={{ color: '#166534' }}>
                    Books Imported
                  </div>
                </div>

                {importResult.skipped > 0 && (
                  <div className="p-6 rounded-2xl" style={{
                    background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.1) 0%, rgba(202, 138, 4, 0.1) 100%)',
                    border: '2px solid rgba(234, 179, 8, 0.3)',
                  }}>
                    <div className="text-4xl font-black mb-2" style={{ color: '#a16207' }}>
                      {importResult.skipped}
                    </div>
                    <div className="text-sm font-bold" style={{ color: '#854d0e' }}>
                      Duplicates Skipped
                    </div>
                  </div>
                )}

                {importResult.booksWithoutISBN > 0 && (
                  <div className="p-6 rounded-2xl" style={{
                    background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)',
                    border: '2px solid rgba(251, 191, 36, 0.3)',
                  }}>
                    <div className="text-4xl font-black mb-2" style={{ color: '#d97706' }}>
                      {importResult.booksWithoutISBN}
                    </div>
                    <div className="text-sm font-bold" style={{ color: '#b45309' }}>
                      Without ISBN
                    </div>
                  </div>
                )}

                {importResult.skippedDueToMissingFields > 0 && (
                  <div className="p-6 rounded-2xl" style={{
                    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
                    border: '2px solid rgba(168, 85, 247, 0.3)',
                  }}>
                    <div className="text-4xl font-black mb-2" style={{ color: '#7c3aed' }}>
                      {importResult.skippedDueToMissingFields}
                    </div>
                    <div className="text-sm font-bold" style={{ color: '#6d28d9' }}>
                      Skipped (Missing Data)
                    </div>
                  </div>
                )}

                {importResult.failed > 0 && (
                  <div className="p-6 rounded-2xl" style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '2px solid rgba(239, 68, 68, 0.3)',
                  }}>
                    <div className="text-4xl font-black mb-2 text-red-700">
                      {importResult.failed}
                    </div>
                    <div className="text-sm font-bold text-red-800">
                      Failed
                    </div>
                  </div>
                )}

                {importResult.collectionsCreated > 0 && (
                  <div className="p-6 rounded-2xl" style={{
                    background: 'linear-gradient(135deg, rgba(201, 169, 97, 0.1) 0%, rgba(212, 165, 116, 0.1) 100%)',
                    border: '2px solid rgba(201, 169, 97, 0.3)',
                  }}>
                    <div className="text-4xl font-black mb-2" style={{ color: '#c9a961' }}>
                      {importResult.collectionsCreated}
                    </div>
                    <div className="text-sm font-bold" style={{ color: '#8b6f47' }}>
                      Collections Created
                    </div>
                  </div>
                )}
              </div>

              {/* ISBN Warning Info */}
              {importResult.booksWithoutISBN > 0 && (
                <div className="max-w-2xl mx-auto mb-8 p-6 rounded-2xl text-left" style={{
                  background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.05) 0%, rgba(245, 158, 11, 0.05) 100%)',
                  border: '2px solid rgba(251, 191, 36, 0.3)',
                }}>
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#d97706' }} strokeWidth={2} />
                    <div>
                      <h4 className="font-bold mb-2" style={{ color: '#2d1f15' }}>
                        {importResult.booksWithoutISBN} book{importResult.booksWithoutISBN > 1 ? 's' : ''} imported without ISBN
                      </h4>
                      <p className="text-sm" style={{ color: '#92400e' }}>
                        These books may have limited metadata enrichment. You can add ISBNs manually later to enable cover downloads and detailed information.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Required Fields Info */}
              {importResult.skippedDueToMissingFields > 0 && (
                <div className="max-w-2xl mx-auto mb-8 p-6 rounded-2xl text-left" style={{
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, rgba(147, 51, 234, 0.05) 100%)',
                  border: '2px solid rgba(168, 85, 247, 0.3)',
                }}>
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#7c3aed' }} strokeWidth={2} />
                    <div>
                      <h4 className="font-bold mb-2" style={{ color: '#2d1f15' }}>
                        {importResult.skippedDueToMissingFields} book{importResult.skippedDueToMissingFields > 1 ? 's' : ''} skipped
                      </h4>
                      <p className="text-sm mb-2" style={{ color: '#5d4e37' }}>
                        Books must have both of the following to be imported:
                      </p>
                      <ul className="text-sm space-y-1" style={{ color: '#7c3aed' }}>
                        <li>✓ Title (required)</li>
                        <li>✓ Author (required)</li>
                      </ul>
                      <p className="text-sm mt-2" style={{ color: '#6d28d9' }}>
                        ISBN is recommended but optional
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Collections List */}
              {importResult.collections && importResult.collections.length > 0 && (
                <div className="max-w-2xl mx-auto mb-8 p-6 rounded-2xl text-left" style={{
                  background: 'linear-gradient(135deg, rgba(201, 169, 97, 0.05) 0%, rgba(212, 165, 116, 0.05) 100%)',
                  border: '2px solid rgba(139, 111, 71, 0.2)',
                }}>
                  <div className="flex items-center gap-2 mb-4">
                    <Library className="w-5 h-5" style={{ color: '#c9a961' }} strokeWidth={2} />
                    <h4 className="font-bold" style={{ color: '#2d1f15' }}>
                      Collections Created
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {importResult.collections.map((collection: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-lg text-sm font-semibold"
                        style={{
                          background: 'linear-gradient(135deg, #c9a961 0%, #d4a574 100%)',
                          color: '#2d1f15',
                        }}
                      >
                        {collection}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleClose}
                className="px-8 py-4 rounded-xl font-bold transition-all hover:scale-105 shadow-xl"
                style={{
                  background: 'linear-gradient(135deg, #c9a961 0%, #d4a574 100%)',
                  color: '#2d1f15',
                }}
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
