/**
 * Genre standardization and mapping utility
 * Normalizes genres from different APIs into consistent categories
 */

// Standard genre categories
export const STANDARD_GENRES = {
  // Fiction genres
  FICTION: 'Fiction',
  FANTASY: 'Fantasy',
  SCIENCE_FICTION: 'Science Fiction',
  MYSTERY: 'Mystery & Thriller',
  ROMANCE: 'Romance',
  HISTORICAL_FICTION: 'Historical Fiction',
  HORROR: 'Horror',
  LITERARY_FICTION: 'Literary Fiction',
  ADVENTURE: 'Adventure',
  YOUNG_ADULT: 'Young Adult',
  CHILDRENS: 'Children\'s',

  // Non-fiction genres
  BIOGRAPHY: 'Biography & Memoir',
  HISTORY: 'History',
  SELF_HELP: 'Self-Help & Personal Development',
  BUSINESS: 'Business & Economics',
  SCIENCE: 'Science & Nature',
  PHILOSOPHY: 'Philosophy & Religion',
  PSYCHOLOGY: 'Psychology',
  POLITICS: 'Politics & Social Sciences',
  TRUE_CRIME: 'True Crime',
  TRAVEL: 'Travel',
  COOKING: 'Cooking & Food',
  ART: 'Art & Photography',
  POETRY: 'Poetry',
  GRAPHIC_NOVEL: 'Graphic Novel & Comics',
} as const;

// Genre mapping rules: maps API-specific genres to standard categories
const GENRE_MAPPINGS: Record<string, string> = {
  // Fiction mappings
  'fiction': STANDARD_GENRES.FICTION,
  'general fiction': STANDARD_GENRES.FICTION,
  'literary fiction': STANDARD_GENRES.LITERARY_FICTION,
  'fiction / general': STANDARD_GENRES.FICTION,
  'fiction, general': STANDARD_GENRES.FICTION,

  // Fantasy mappings
  'fantasy': STANDARD_GENRES.FANTASY,
  'epic fantasy': STANDARD_GENRES.FANTASY,
  'fantasy fiction': STANDARD_GENRES.FANTASY,
  'fiction / fantasy': STANDARD_GENRES.FANTASY,
  'fiction, fantasy': STANDARD_GENRES.FANTASY,
  'fiction, fantasy, epic': STANDARD_GENRES.FANTASY,
  'high fantasy': STANDARD_GENRES.FANTASY,
  'urban fantasy': STANDARD_GENRES.FANTASY,

  // Science Fiction mappings
  'science fiction': STANDARD_GENRES.SCIENCE_FICTION,
  'sci-fi': STANDARD_GENRES.SCIENCE_FICTION,
  'scifi': STANDARD_GENRES.SCIENCE_FICTION,
  'fiction / science fiction': STANDARD_GENRES.SCIENCE_FICTION,
  'fiction, science fiction': STANDARD_GENRES.SCIENCE_FICTION,
  'dystopian': STANDARD_GENRES.SCIENCE_FICTION,
  'cyberpunk': STANDARD_GENRES.SCIENCE_FICTION,
  'space opera': STANDARD_GENRES.SCIENCE_FICTION,

  // Mystery & Thriller mappings
  'mystery': STANDARD_GENRES.MYSTERY,
  'thriller': STANDARD_GENRES.MYSTERY,
  'suspense': STANDARD_GENRES.MYSTERY,
  'detective': STANDARD_GENRES.MYSTERY,
  'crime': STANDARD_GENRES.MYSTERY,
  'fiction / mystery': STANDARD_GENRES.MYSTERY,
  'fiction / thriller': STANDARD_GENRES.MYSTERY,
  'police procedural': STANDARD_GENRES.MYSTERY,

  // Romance mappings
  'romance': STANDARD_GENRES.ROMANCE,
  'love stories': STANDARD_GENRES.ROMANCE,
  'fiction / romance': STANDARD_GENRES.ROMANCE,
  'contemporary romance': STANDARD_GENRES.ROMANCE,
  'historical romance': STANDARD_GENRES.ROMANCE,

  // Historical Fiction mappings
  'historical fiction': STANDARD_GENRES.HISTORICAL_FICTION,
  'fiction, historical': STANDARD_GENRES.HISTORICAL_FICTION,
  'fiction, historical, general': STANDARD_GENRES.HISTORICAL_FICTION,
  'fiction / historical': STANDARD_GENRES.HISTORICAL_FICTION,

  // Horror mappings
  'horror': STANDARD_GENRES.HORROR,
  'gothic': STANDARD_GENRES.HORROR,
  'fiction / horror': STANDARD_GENRES.HORROR,

  // Adventure mappings
  'adventure': STANDARD_GENRES.ADVENTURE,
  'action & adventure': STANDARD_GENRES.ADVENTURE,
  'fiction / action & adventure': STANDARD_GENRES.ADVENTURE,

  // Young Adult mappings
  'young adult': STANDARD_GENRES.YOUNG_ADULT,
  'ya': STANDARD_GENRES.YOUNG_ADULT,
  'teen': STANDARD_GENRES.YOUNG_ADULT,
  'young adult fiction': STANDARD_GENRES.YOUNG_ADULT,
  'juvenile fiction': STANDARD_GENRES.YOUNG_ADULT,

  // Children's mappings
  'children': STANDARD_GENRES.CHILDRENS,
  'childrens': STANDARD_GENRES.CHILDRENS,
  'juvenile': STANDARD_GENRES.CHILDRENS,
  'picture books': STANDARD_GENRES.CHILDRENS,
  'juvenile works': STANDARD_GENRES.CHILDRENS,

  // Biography mappings
  'biography': STANDARD_GENRES.BIOGRAPHY,
  'autobiography': STANDARD_GENRES.BIOGRAPHY,
  'memoir': STANDARD_GENRES.BIOGRAPHY,
  'biography & autobiography': STANDARD_GENRES.BIOGRAPHY,
  'biography / autobiography': STANDARD_GENRES.BIOGRAPHY,

  // History mappings
  'history': STANDARD_GENRES.HISTORY,
  'historical': STANDARD_GENRES.HISTORY,
  'world history': STANDARD_GENRES.HISTORY,
  'ancient history': STANDARD_GENRES.HISTORY,

  // Self-Help mappings
  'self-help': STANDARD_GENRES.SELF_HELP,
  'self help': STANDARD_GENRES.SELF_HELP,
  'personal development': STANDARD_GENRES.SELF_HELP,
  'self-improvement': STANDARD_GENRES.SELF_HELP,
  'motivational': STANDARD_GENRES.SELF_HELP,

  // Business mappings
  'business': STANDARD_GENRES.BUSINESS,
  'economics': STANDARD_GENRES.BUSINESS,
  'business & economics': STANDARD_GENRES.BUSINESS,
  'entrepreneurship': STANDARD_GENRES.BUSINESS,
  'management': STANDARD_GENRES.BUSINESS,

  // Science mappings
  'science': STANDARD_GENRES.SCIENCE,
  'nature': STANDARD_GENRES.SCIENCE,
  'science & nature': STANDARD_GENRES.SCIENCE,
  'biology': STANDARD_GENRES.SCIENCE,
  'physics': STANDARD_GENRES.SCIENCE,
  'astronomy': STANDARD_GENRES.SCIENCE,

  // Philosophy & Religion mappings
  'philosophy': STANDARD_GENRES.PHILOSOPHY,
  'religion': STANDARD_GENRES.PHILOSOPHY,
  'spirituality': STANDARD_GENRES.PHILOSOPHY,
  'theology': STANDARD_GENRES.PHILOSOPHY,
  'cabala': STANDARD_GENRES.PHILOSOPHY,
  'kabbalah': STANDARD_GENRES.PHILOSOPHY,

  // Psychology mappings
  'psychology': STANDARD_GENRES.PSYCHOLOGY,
  'mental health': STANDARD_GENRES.PSYCHOLOGY,
  'cognitive science': STANDARD_GENRES.PSYCHOLOGY,

  // Politics mappings
  'politics': STANDARD_GENRES.POLITICS,
  'political science': STANDARD_GENRES.POLITICS,
  'social sciences': STANDARD_GENRES.POLITICS,
  'sociology': STANDARD_GENRES.POLITICS,

  // True Crime mappings
  'true crime': STANDARD_GENRES.TRUE_CRIME,
  'murder': STANDARD_GENRES.TRUE_CRIME,

  // Travel mappings
  'travel': STANDARD_GENRES.TRAVEL,
  'travel writing': STANDARD_GENRES.TRAVEL,

  // Cooking mappings
  'cooking': STANDARD_GENRES.COOKING,
  'food': STANDARD_GENRES.COOKING,
  'recipes': STANDARD_GENRES.COOKING,
  'cookbooks': STANDARD_GENRES.COOKING,

  // Art mappings
  'art': STANDARD_GENRES.ART,
  'photography': STANDARD_GENRES.ART,
  'design': STANDARD_GENRES.ART,

  // Poetry mappings
  'poetry': STANDARD_GENRES.POETRY,
  'poems': STANDARD_GENRES.POETRY,

  // Graphic Novel mappings
  'graphic novel': STANDARD_GENRES.GRAPHIC_NOVEL,
  'comics': STANDARD_GENRES.GRAPHIC_NOVEL,
  'manga': STANDARD_GENRES.GRAPHIC_NOVEL,
  'comic books': STANDARD_GENRES.GRAPHIC_NOVEL,
};

// Patterns to ignore (overly specific, locations, etc.)
const IGNORE_PATTERNS = [
  /middle earth/i,
  /imaginary place/i,
  /translations into/i,
  /\d{4}s$/i, // Decades like "1990s"
  /^[A-Z]{2}$/i, // Country codes like "US"
  /^legends$/i,
];

/**
 * Normalizes a genre string from an API into standard categories
 */
export function normalizeGenre(rawGenre: string | null | undefined): string | null {
  if (!rawGenre || rawGenre.trim() === '') return null;

  // Clean and normalize the input
  const cleaned = rawGenre
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .replace(/['"]/g, '') // Remove quotes
    .replace(/\band\b/g, '&'); // Standardize "and" to "&"

  // Check if it matches ignore patterns
  for (const pattern of IGNORE_PATTERNS) {
    if (pattern.test(cleaned)) {
      return null;
    }
  }

  // Try direct mapping first
  if (GENRE_MAPPINGS[cleaned]) {
    return GENRE_MAPPINGS[cleaned];
  }

  // Try to extract from hierarchical genre strings (e.g., "Fiction / Fantasy / Epic")
  const parts = cleaned.split(/[\/,]/).map(p => p.trim());

  // Try each part, preferring later parts (more specific)
  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i];
    if (GENRE_MAPPINGS[part]) {
      return GENRE_MAPPINGS[part];
    }
  }

  // Try partial matches for common keywords
  for (const [key, value] of Object.entries(GENRE_MAPPINGS)) {
    if (cleaned.includes(key) && key.length > 3) {
      return value;
    }
  }

  // If no mapping found and it looks like a reasonable genre, return capitalized version
  if (cleaned.length < 30 && !cleaned.includes('(') && parts.length <= 2) {
    return capitalize(parts[parts.length - 1]);
  }

  return null;
}

/**
 * Normalizes a comma-separated string of genres into standardized categories
 * Returns up to maxGenres unique genres
 */
export function normalizeGenres(rawGenres: string | null | undefined, maxGenres = 3): string | null {
  if (!rawGenres || rawGenres.trim() === '') return null;

  // Split by comma and normalize each
  const genres = rawGenres
    .split(',')
    .map(g => normalizeGenre(g.trim()))
    .filter((g): g is string => g !== null);

  // Remove duplicates and limit
  const uniqueGenres = [...new Set(genres)].slice(0, maxGenres);

  return uniqueGenres.length > 0 ? uniqueGenres.join(', ') : null;
}

/**
 * Capitalizes the first letter of each word
 */
function capitalize(str: string): string {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get all standard genre names as an array
 */
export function getAllStandardGenres(): string[] {
  return Object.values(STANDARD_GENRES);
}
