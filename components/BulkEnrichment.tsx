'use client';

import { useState } from 'react';
import { Sparkles, Loader2, CheckCircle, XCircle } from 'lucide-react';

export function BulkEnrichment() {
  const [isEnriching, setIsEnriching] = useState(false);
  const [result, setResult] = useState<{
    enriched: number;
    total: number;
    message: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleBulkEnrich = async () => {
    setIsEnriching(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch('/api/bulk-enrich', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Bulk enrichment failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('Failed to enrich books. Please try again.');
      console.error('Bulk enrichment error:', err);
    } finally {
      setIsEnriching(false);
    }
  };

  return (
    <div
      className="rounded-2xl p-6 shadow-elevation-3 hover:shadow-elevation-4 transition-all duration-300"
      style={{
        background: 'var(--gradient-card)',
        border: '2px solid var(--border-color)',
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="p-3 rounded-xl"
          style={{
            background: 'linear-gradient(135deg, #c9a961 0%, #d4a574 100%)',
          }}
        >
          <Sparkles className="w-6 h-6 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <h3
            className="text-xl font-black"
            style={{ color: 'var(--text-dark)', fontFamily: 'Playfair Display, serif' }}
          >
            Auto-Enrich Library
          </h3>
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
            Automatically fetch covers and data for all books
          </p>
        </div>
      </div>

      {!result && !error && (
        <p className="text-sm mb-4 font-medium" style={{ color: 'var(--text-muted)' }}>
          Click below to automatically enrich all books in your library that are missing cover images or descriptions.
          This will fetch data from Google Books and other sources.
        </p>
      )}

      {result && (
        <div
          className="mb-4 p-4 rounded-xl flex items-start gap-3 animate-fadeIn"
          style={{
            background: result.enriched > 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(59, 130, 246, 0.1)',
            border: result.enriched > 0 ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(59, 130, 246, 0.3)',
          }}
        >
          {result.enriched > 0 ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#15803d' }} />
          ) : (
            <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#1e40af' }} />
          )}
          <div>
            <p className="font-bold text-sm mb-1" style={{ color: result.enriched > 0 ? '#15803d' : '#1e40af' }}>
              {result.message}
            </p>
            {result.total > 0 && (
              <p className="text-xs font-medium" style={{ color: result.enriched > 0 ? '#15803d' : '#1e40af' }}>
                Enriched {result.enriched} out of {result.total} books
              </p>
            )}
          </div>
        </div>
      )}

      {error && (
        <div
          className="mb-4 p-4 rounded-xl flex items-start gap-3 animate-fadeIn"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          }}
        >
          <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#b91c1c' }} />
          <p className="font-bold text-sm" style={{ color: '#b91c1c' }}>
            {error}
          </p>
        </div>
      )}

      <button
        onClick={handleBulkEnrich}
        disabled={isEnriching}
        className="w-full px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
        style={{
          background: isEnriching
            ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
            : 'linear-gradient(135deg, #c9a961 0%, #d4a574 50%, #c89b65 100%)',
          color: '#2d1f15',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 4px 12px rgba(201, 169, 97, 0.3)',
        }}
      >
        {isEnriching ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Enriching Library...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            <span>Enrich All Books</span>
          </>
        )}
      </button>

      {isEnriching && (
        <p className="text-xs text-center mt-3 font-medium animate-pulse" style={{ color: 'var(--text-muted)' }}>
          This may take a few minutes depending on your library size...
        </p>
      )}
    </div>
  );
}
