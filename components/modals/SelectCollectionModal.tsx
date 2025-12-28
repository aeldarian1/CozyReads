'use client';

import { useState, useEffect } from 'react';
import { ModalBase, ModalFooter } from '@/components/ui/ModalBase';
import { useToast } from '@/contexts/ToastContext';

interface Collection {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string | null;
}

interface SelectCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookIds: string[];
  onSuccess?: () => void;
}

/**
 * Modal for selecting collections to add books to.
 * Supports single or multiple book selection.
 */
export function SelectCollectionModal({
  isOpen,
  onClose,
  bookIds,
  onSuccess,
}: SelectCollectionModalProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  // Load collections when modal opens
  useEffect(() => {
    if (isOpen) {
      loadCollections();
    }
  }, [isOpen]);

  const loadCollections = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/collections');
      if (!response.ok) throw new Error('Failed to load collections');
      const data = await response.json();
      setCollections(data);
    } catch (error) {
      console.error('Error loading collections:', error);
      toast.error('Failed to load collections');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCollection = (collectionId: string) => {
    const newSelected = new Set(selectedCollections);
    if (newSelected.has(collectionId)) {
      newSelected.delete(collectionId);
    } else {
      newSelected.add(collectionId);
    }
    setSelectedCollections(newSelected);
  };

  const handleSave = async () => {
    if (selectedCollections.size === 0) {
      toast.warning('Please select at least one collection');
      return;
    }

    setIsSaving(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      // Add each book to each selected collection
      for (const bookId of bookIds) {
        for (const collectionId of selectedCollections) {
          try {
            const response = await fetch(`/api/collections/${collectionId}/books`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ bookId }),
            });

            if (response.ok) {
              successCount++;
            } else {
              // Check if it's a duplicate error (book already in collection)
              const error = await response.json();
              if (error.error?.includes('already in collection')) {
                // Don't count duplicates as errors, just skip
                continue;
              }
              errorCount++;
            }
          } catch (error) {
            errorCount++;
          }
        }
      }

      const bookWord = bookIds.length === 1 ? 'book' : 'books';
      const collectionWord = selectedCollections.size === 1 ? 'collection' : 'collections';

      if (errorCount === 0) {
        toast.success(
          `Added ${bookIds.length} ${bookWord} to ${selectedCollections.size} ${collectionWord}`
        );
      } else {
        toast.warning(
          `Added ${bookIds.length} ${bookWord} with ${errorCount} errors`,
          'Partial Success'
        );
      }

      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error('Error adding books to collections:', error);
      toast.error('Failed to add books to collections');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setSelectedCollections(new Set());
    onClose();
  };

  const bookCount = bookIds.length;
  const bookWord = bookCount === 1 ? 'book' : 'books';

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={handleClose}
      title={`Add ${bookCount} ${bookWord} to Collections`}
      size="md"
      footer={
        <ModalFooter
          onCancel={handleClose}
          onConfirm={handleSave}
          confirmText="Add to Collections"
          confirmVariant="primary"
          isLoading={isSaving}
          isDisabled={selectedCollections.size === 0}
        />
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No collections found.</p>
          <p className="text-sm text-gray-500">
            Create a collection first to organize your books.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 mb-4">
            Select one or more collections to add {bookCount === 1 ? 'this book' : 'these books'} to:
          </p>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {collections.map((collection) => {
              const isSelected = selectedCollections.has(collection.id);

              return (
                <button
                  key={collection.id}
                  onClick={() => toggleCollection(collection.id)}
                  className={`
                    w-full px-4 py-3 rounded-xl border-2 transition-all duration-200
                    flex items-center gap-3 text-left
                    ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  {/* Checkbox */}
                  <div
                    className={`
                      flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center
                      transition-colors duration-200
                      ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300 bg-white'
                      }
                    `}
                  >
                    {isSelected && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Icon */}
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                    style={{ backgroundColor: collection.color + '20', color: collection.color }}
                  >
                    {collection.icon}
                  </div>

                  {/* Collection Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {collection.name}
                    </h3>
                    {collection.description && (
                      <p className="text-sm text-gray-500 truncate">
                        {collection.description}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {selectedCollections.size > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">{selectedCollections.size}</span>{' '}
                {selectedCollections.size === 1 ? 'collection' : 'collections'} selected
              </p>
            </div>
          )}
        </div>
      )}
    </ModalBase>
  );
}
