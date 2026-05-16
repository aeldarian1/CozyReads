'use client';

import { useState, useEffect } from 'react';

type Collection = {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    books: number;
  };
};

export function CollectionsManager() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#8b6f47',
    icon: '📚',
  });

  const iconOptions = ['📚', '⭐', '❤️', '🔥', '✨', '🎯', '📖', '🌟', '💎', '🏆', '📝', '🎨', '🎭', '🎬', '🎵'];
  const colorOptions = [
    { name: 'Warm Brown', value: '#8b6f47' },
    { name: 'Ocean Blue', value: '#6d8a96' },
    { name: 'Forest Green', value: '#5d7052' },
    { name: 'Royal Purple', value: '#7d5ba6' },
    { name: 'Rose', value: '#c45b7d' },
    { name: 'Sky Blue', value: '#5a7fa6' },
    { name: 'Amethyst', value: '#8a5d9f' },
    { name: 'Crimson', value: '#c74444' },
    { name: 'Gold', value: '#d4a574' },
    { name: 'Emerald', value: '#5d9f8a' },
  ];

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      const response = await fetch('/api/collections');
      const data = await response.json();
      setCollections(data);
    } catch (error) {
      console.error('Error loading collections:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingCollection
        ? `/api/collections/${editingCollection.id}`
        : '/api/collections';
      const method = editingCollection ? 'PUT' : 'POST';

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      loadCollections();
      resetForm();
    } catch (error) {
      console.error('Error saving collection:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this collection? Books will not be deleted, only removed from the collection.')) return;

    try {
      await fetch(`/api/collections/${id}`, {
        method: 'DELETE',
      });
      loadCollections();
    } catch (error) {
      console.error('Error deleting collection:', error);
    }
  };

  const handleEdit = (collection: Collection) => {
    setEditingCollection(collection);
    setFormData({
      name: collection.name,
      description: collection.description || '',
      color: collection.color,
      icon: collection.icon,
    });
    setIsCreating(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#8b6f47',
      icon: '📚',
    });
    setIsCreating(false);
    setEditingCollection(null);
  };

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-black mb-2" style={{
            color: 'var(--text-dark)',
            fontFamily: 'Playfair Display, serif',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
          }}>
            📚 My Collections
          </h2>
          <p className="text-base" style={{ color: 'var(--text-muted)' }}>
            Organize your books into custom shelves
          </p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
          style={{
            background: 'var(--gradient-accent)',
            color: 'var(--bg-primary)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
          }}
        >
          {isCreating ? '✕ Cancel' : '+ New Collection'}
        </button>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <form onSubmit={handleSubmit} className="mb-6 p-6 rounded-2xl shadow-lg" style={{
          background: 'var(--gradient-card)',
          border: '2px solid var(--border-color)',
        }}>
          <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-dark)' }}>
            {editingCollection ? 'Edit Collection' : 'Create New Collection'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-semibold mb-2" style={{ color: 'var(--text-dark)' }}>
                Collection Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Favorites, To Read, Classics..."
                className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2"
                style={{
                  borderColor: 'var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-dark)',
                }}
              />
            </div>

            <div>
              <label className="block font-semibold mb-2" style={{ color: 'var(--text-dark)' }}>
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
                className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2"
                style={{
                  borderColor: 'var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-dark)',
                }}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-2" style={{ color: 'var(--text-dark)' }}>
              Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {iconOptions.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon })}
                  className="w-12 h-12 rounded-lg transition-all duration-200 hover:scale-110"
                  style={{
                    background: formData.icon === icon ? 'var(--gradient-accent)' : 'var(--bg-secondary)',
                    border: `2px solid ${formData.icon === icon ? 'var(--warm-brown)' : 'var(--border-color)'}`,
                  }}
                >
                  <span className="text-2xl">{icon}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-2" style={{ color: 'var(--text-dark)' }}>
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((colorOption) => (
                <button
                  key={colorOption.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: colorOption.value })}
                  className="px-4 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
                  style={{
                    background: colorOption.value,
                    color: '#fff',
                    border: `3px solid ${formData.color === colorOption.value ? '#fff' : 'transparent'}`,
                    boxShadow: formData.color === colorOption.value ? '0 4px 12px rgba(0, 0, 0, 0.3)' : 'none',
                  }}
                >
                  {colorOption.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg"
              style={{
                background: 'var(--gradient-accent)',
                color: 'var(--bg-primary)',
              }}
            >
              {editingCollection ? 'Update Collection' : 'Create Collection'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105"
              style={{
                background: 'var(--bg-secondary)',
                color: 'var(--text-dark)',
                border: '2px solid var(--border-color)',
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Collections Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {collections.map((collection) => (
          <div
            key={collection.id}
            className="p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative group"
            style={{
              background: 'var(--gradient-card)',
              border: '2px solid var(--border-color)',
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl shadow-md"
                  style={{
                    background: collection.color,
                  }}
                >
                  {collection.icon}
                </div>
                <div>
                  <h3 className="font-bold text-lg" style={{ color: 'var(--text-dark)' }}>
                    {collection.name}
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {collection._count?.books || 0} {collection._count?.books === 1 ? 'book' : 'books'}
                  </p>
                </div>
              </div>
            </div>

            {collection.description && (
              <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                {collection.description}
              </p>
            )}

            {/* Action buttons - show on hover */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2 mt-3">
              <button
                onClick={() => handleEdit(collection)}
                className="flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105"
                style={{
                  background: 'var(--gradient-accent)',
                  color: 'var(--bg-primary)',
                }}
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => handleDelete(collection.id)}
                className="px-3 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #c14953 0%, #a83a44 100%)',
                  color: '#fff',
                }}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}

        {collections.length === 0 && !isCreating && (
          <div className="col-span-full text-center py-12 px-4 rounded-2xl" style={{
            background: 'var(--gradient-card)',
            border: '3px dashed var(--border-color)',
          }}>
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-dark)' }}>
              No collections yet
            </h3>
            <p className="mb-4" style={{ color: 'var(--text-muted)' }}>
              Create your first collection to organize your books
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
