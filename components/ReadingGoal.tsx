'use client';

import { useState, useEffect } from 'react';
import { Book } from '@/app/page';

export function ReadingGoal({ books }: { books: Book[] }) {
  const [goal, setGoal] = useState<number>(0);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedGoal = localStorage.getItem('readingGoal');
    if (savedGoal) {
      setGoal(parseInt(savedGoal));
    }
  }, []);

  if (!mounted) {
    return null;
  }

  const currentYear = new Date().getFullYear();
  const booksFinishedThisYear = books.filter((book) => {
    if (book.readingStatus !== 'Finished' || !book.dateFinished) return false;
    const finishedYear = new Date(book.dateFinished).getFullYear();
    return finishedYear === currentYear;
  }).length;

  const progress = goal > 0 ? Math.min((booksFinishedThisYear / goal) * 100, 100) : 0;

  const handleSetGoal = () => {
    const newGoal = parseInt(inputValue);
    if (newGoal > 0) {
      setGoal(newGoal);
      localStorage.setItem('readingGoal', newGoal.toString());
      setIsEditing(false);
      setInputValue('');
    }
  };

  if (goal === 0 && !isEditing) {
    return (
      <div
        className="rounded-2xl p-8 mb-8 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden group"
        style={{
          background: 'var(--gradient-card)',
          border: '1px solid var(--border-color)',
          boxShadow: '0 10px 30px rgba(93, 78, 55, 0.15)',
        }}
      >
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(139, 111, 71, 0.1) 20px, rgba(139, 111, 71, 0.1) 40px)'
        }} />
        <div className="text-center relative z-10">
          <h3 className="text-3xl font-black mb-3" style={{
            color: 'var(--text-dark)',
            fontFamily: 'Playfair Display, serif',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
          }}>
            📚 Set Your {currentYear} Reading Goal
          </h3>
          <p className="mb-6 text-lg" style={{ color: 'var(--text-muted)' }}>
            Challenge yourself! How many books do you want to read this year?
          </p>
          <button
            onClick={() => setIsEditing(true)}
            className="px-8 py-3.5 rounded-xl font-bold transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-2xl relative overflow-hidden group"
            style={{
              background: 'var(--gradient-accent)',
              color: 'var(--bg-primary)',
              boxShadow: '0 6px 20px rgba(201, 169, 97, 0.4)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              textShadow: '0 1px 2px rgba(255, 255, 255, 0.5)'
            }}
          >
            <span className="relative z-10">🎯 Set Goal</span>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: 'linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)'
              }}
            />
          </button>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div
        className="rounded-2xl p-6 mb-8 shadow-lg"
        style={{
          background: 'var(--gradient-card)',
          border: '2px solid var(--border-color)',
        }}
      >
        <div className="text-center">
          <h3 className="text-xl font-bold mb-4" style={{ color: '#5d4e37', fontFamily: 'Merriweather, serif' }}>
            {goal > 0 ? 'Update' : 'Set'} Your Reading Goal
          </h3>
          <div className="flex gap-3 justify-center items-center">
            <input
              type="number"
              min="1"
              placeholder="Number of books"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="px-4 py-2 rounded-xl w-40 focus:outline-none"
              style={{
                background: '#fff',
                border: '2px solid rgba(139, 111, 71, 0.3)',
                color: '#3e2723',
              }}
              autoFocus
            />
            <button
              onClick={handleSetGoal}
              className="px-5 py-2 rounded-xl font-semibold transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #d4a574 0%, #c89b65 100%)',
                color: '#3e2723',
              }}
            >
              Save
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setInputValue('');
              }}
              className="px-5 py-2 rounded-xl font-semibold transition-all"
              style={{
                background: '#e8dcc8',
                color: '#5d4e37',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getMessage = () => {
    if (booksFinishedThisYear >= goal) {
      return '🎉 Congratulations! You\'ve reached your goal!';
    } else if (progress >= 75) {
      return '🔥 Almost there! Keep going!';
    } else if (progress >= 50) {
      return '💪 Halfway there! You\'re doing great!';
    } else if (progress >= 25) {
      return '📖 Good progress! Keep reading!';
    } else {
      return '🌱 Just getting started!';
    }
  };

  return (
    <div
      className="rounded-2xl p-7 mb-8 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden"
      style={{
        background: 'var(--gradient-card)',
        border: '1px solid var(--border-color)',
        boxShadow: '0 10px 30px rgba(93, 78, 55, 0.15)',
      }}
    >
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(139, 111, 71, 0.1) 20px, rgba(139, 111, 71, 0.1) 40px)'
      }} />

      <div className="flex justify-between items-start mb-5 relative z-10">
        <div>
          <h3 className="text-3xl font-black mb-2" style={{
            color: 'var(--text-dark)',
            fontFamily: 'Playfair Display, serif',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
          }}>
            🎯 {currentYear} Reading Goal
          </h3>
          <p className="text-xl font-semibold" style={{ color: 'var(--text-muted)' }}>
            <span className="text-3xl font-black" style={{ color: 'var(--warm-brown)' }}>{booksFinishedThisYear}</span> of <span className="font-black">{goal}</span> books
          </p>
        </div>
        <button
          onClick={() => {
            setInputValue(goal.toString());
            setIsEditing(true);
          }}
          className="text-sm px-5 py-2.5 rounded-lg transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg font-bold"
          style={{
            background: 'linear-gradient(135deg, #e8dcc8 0%, #d4cbb8 100%)',
            color: '#5d4e37',
            border: '1px solid rgba(93, 78, 55, 0.2)'
          }}
        >
          ✏️ Edit
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-5 relative z-10">
        <div
          className="w-full h-10 rounded-full overflow-hidden relative"
          style={{
            background: 'linear-gradient(135deg, #e8dcc8 0%, #d4cbb8 100%)',
            boxShadow: 'inset 0 2px 6px rgba(93, 78, 55, 0.15)',
          }}
        >
          <div
            className="h-full transition-all duration-700 flex items-center justify-end pr-4 relative overflow-hidden"
            style={{
              width: `${progress}%`,
              background: booksFinishedThisYear >= goal
                ? 'linear-gradient(90deg, #5d7052 0%, #6d8062 50%, #7a9269 100%)'
                : 'linear-gradient(90deg, #c9a961 0%, #d4a574 50%, #c89b65 100%)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div className="absolute inset-0 opacity-30" style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
              animation: 'shine 3s ease-in-out infinite'
            }} />
            {progress > 10 && (
              <span className="text-white text-base font-black relative z-10" style={{
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)'
              }}>
                {Math.round(progress)}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Motivational Message */}
      <p className="text-center font-bold text-lg relative z-10" style={{
        color: '#8b6f47',
        fontFamily: 'Playfair Display, serif',
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
      }}>
        {getMessage()}
      </p>
    </div>
  );
}
