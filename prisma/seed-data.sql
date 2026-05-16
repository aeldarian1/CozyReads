-- Sample Data for CozyReads

-- Sample Users (in real app, managed by Clerk)
INSERT INTO "User" (id, clerkId, email, firstName, lastName) VALUES
  ('user-1', 'clerk_user_1', 'reader@example.com', 'John', 'Smith'),
  ('user-2', 'clerk_user_2', 'bookworm@example.com', 'Jane', 'Doe');

-- Sample Books
INSERT INTO "Book" (id, userId, title, author, isbn, genre, description, coverUrl, readingStatus, rating, review, dateAdded, dateFinished) VALUES
  ('book-1', 'user-1', 'The Great Gatsby', 'F. Scott Fitzgerald', '978-0-7432-7356-5', 'Fiction', 'A classic American novel set in the Jazz Age.', 'https://books.google.com/books/content?id=...', 'Finished', 5, 'Masterpiece! Beautifully written.', NOW() - INTERVAL '6 months', NOW() - INTERVAL '5 months'),
  ('book-2', 'user-1', 'To Kill a Mockingbird', 'Harper Lee', '978-0-06-112008-4', 'Fiction', 'A gripping tale of racial inequality.', 'https://books.google.com/books/content?id=...', 'Finished', 5, 'One of the best books I''ve ever read.', NOW() - INTERVAL '4 months', NOW() - INTERVAL '3 months'),
  ('book-3', 'user-1', '1984', 'George Orwell', '978-0451524935', 'Dystopian', 'A haunting portrayal of totalitarianism.', 'https://books.google.com/books/content?id=...', 'Currently Reading', 0, NULL, NOW() - INTERVAL '2 months', NULL),
  ('book-4', 'user-1', 'Pride and Prejudice', 'Jane Austen', '978-0141439518', 'Romance', 'A timeless love story with witty dialogue.', 'https://books.google.com/books/content?id=...', 'Want to Read', 0, NULL, NOW(), NULL),
  ('book-5', 'user-2', 'The Hobbit', 'J.R.R. Tolkien', '978-0547928227', 'Fantasy', 'An epic adventure to the Lonely Mountain.', 'https://books.google.com/books/content?id=...', 'Finished', 5, 'Amazing worldbuilding!', NOW() - INTERVAL '1 year', NOW() - INTERVAL '11 months'),
  ('book-6', 'user-2', 'Dune', 'Frank Herbert', '978-0441172719', 'Science Fiction', 'Complex political intrigue on a desert planet.', 'https://books.google.com/books/content?id=...', 'Currently Reading', 4, 'Dense but fascinating.', NOW() - INTERVAL '1 month', NULL),
  ('book-7', 'user-2', 'The Catcher in the Rye', 'J.D. Salinger', '978-0316769174', 'Fiction', 'Coming-of-age story in New York City.', 'https://books.google.com/books/content?id=...', 'Finished', 3, 'Good but a bit dated in places.', NOW() - INTERVAL '2 years', NOW() - INTERVAL '21 months');

-- Sample Collections
INSERT INTO "Collection" (id, userId, name, description, color, icon) VALUES
  ('col-1', 'user-1', 'Classics', 'Classic literature', '#8b6f47', '📖'),
  ('col-2', 'user-1', 'Fiction', 'Contemporary fiction', '#d4a574', '📕'),
  ('col-3', 'user-2', 'Fantasy & Sci-Fi', 'Fantasy and science fiction', '#6c5ce7', '🧙'),
  ('col-4', 'user-2', 'Favorites', 'My all-time favorites', '#ffd700', '⭐');

-- Sample Book Collections (many-to-many)
INSERT INTO "BookCollection" (id, bookId, collectionId) VALUES
  ('bc-1', 'book-1', 'col-1'),
  ('bc-2', 'book-1', 'col-2'),
  ('bc-3', 'book-2', 'col-1'),
  ('bc-4', 'book-5', 'col-3'),
  ('bc-5', 'book-5', 'col-4'),
  ('bc-6', 'book-6', 'col-3');

-- Sample Quotes
INSERT INTO "Quote" (id, userId, bookId, text, pageNumber) VALUES
  ('quote-1', 'user-1', 'book-1', 'So we beat on, boats against the current, borne back ceaselessly into the past.', 180),
  ('quote-2', 'user-1', 'book-2', 'You never really understand a person until you consider things from his point of view.', 30),
  ('quote-3', 'user-2', 'book-5', 'All we have to decide is what to do with the time that is given us.', 42),
  ('quote-4', 'user-2', 'book-6', 'The mystery of life isn''t a problem to solve, but a reality to experience.', 156);

-- Sample Reading Goals
INSERT INTO "ReadingGoal" (id, userId, year, goal, booksRead) VALUES
  ('goal-1', 'user-1', 2024, 25, 3),
  ('goal-2', 'user-2', 2024, 52, 2);

-- Sample Reading Sessions
INSERT INTO "ReadingSession" (id, userId, bookId, pageStart, pageEnd, duration, dateSession) VALUES
  ('session-1', 'user-1', 'book-3', 1, 45, 120, NOW() - INTERVAL '2 days'),
  ('session-2', 'user-1', 'book-3', 45, 89, 90, NOW() - INTERVAL '1 day'),
  ('session-3', 'user-2', 'book-6', 156, 210, 150, NOW() - INTERVAL '3 days');

-- Sample Import History
INSERT INTO "ImportHistory" (id, userId, sourceType, itemsImported, itemsSkipped, metadata) VALUES
  ('import-1', 'user-1', 'CSV', 5, 1, '{"fileName": "my_books.csv", "date": "2024-01-10"}'),
  ('import-2', 'user-2', 'GOODREADS', 12, 2, '{"fileName": "goodreads_export.csv", "date": "2024-01-05"}');
