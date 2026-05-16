/**
 * Color extraction utility for book spine colors
 * Extracts dominant colors from book cover images using Canvas API
 */

import { Book } from '@/app/page';

// Genre-based fallback colors for books without covers
const genreColors: { [key: string]: string } = {
  'Fiction': '#8b6f47',
  'Non-Fiction': '#6d8a96',
  'Mystery': '#7d5ba6',
  'Romance': '#c45b7d',
  'Science Fiction': '#5a7fa6',
  'Fantasy': '#8a5d9f',
  'Thriller': '#c74444',
  'Horror': '#4a4a4a',
  'Biography': '#d4a574',
  'History': '#8b7355',
  'Science': '#5d9f8a',
  'Self-Help': '#9f8a5d',
  'Poetry': '#a67d7d',
  'Adventure': '#7a9269',
  'Juvenile Fiction': '#f4a460',
  'Legends': '#6d5d4f',
};

const defaultColor = '#8b6f47'; // Default warm brown

// Cache for extracted colors (in-memory)
const colorCache = new Map<string, string>();

/**
 * Convert RGB to Hex color
 */
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Extract dominant color from an image URL using Canvas API
 */
export async function extractDominantColor(imageUrl: string): Promise<string> {
  // Check cache first
  if (colorCache.has(imageUrl)) {
    return colorCache.get(imageUrl)!;
  }

  return new Promise((resolve) => {
    // Set timeout to prevent hanging
    const timeout = setTimeout(() => {
      resolve(defaultColor);
    }, 5000);

    const img = new Image();

    // Use proxy for external images to avoid CORS
    const shouldUseProxy = imageUrl.includes('books.google.com') ||
                          imageUrl.includes('openlibrary.org');

    const finalImageUrl = shouldUseProxy
      ? `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`
      : imageUrl;

    // Set crossOrigin for CORS support (works with proxy)
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      clearTimeout(timeout);

      try {
        // Create canvas and context
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (!ctx) {
          resolve(defaultColor);
          return;
        }

        // Set canvas size (smaller for faster processing)
        canvas.width = 50;
        canvas.height = 50;

        // Draw image on canvas
        ctx.drawImage(img, 0, 0, 50, 50);

        // Get image data
        let imageData;
        try {
          imageData = ctx.getImageData(0, 0, 50, 50);
        } catch (corsError) {
          // CORS blocked - fall back to default color
          console.warn('CORS blocked color extraction for:', imageUrl);
          resolve(defaultColor);
          return;
        }

        const data = imageData.data;

        // Calculate average color (simple approach)
        let r = 0, g = 0, b = 0;
        let pixelCount = 0;

        // Sample every 4th pixel for performance
        for (let i = 0; i < data.length; i += 16) {
          // Skip very bright (white) and very dark (black) pixels
          const red = data[i];
          const green = data[i + 1];
          const blue = data[i + 2];
          const brightness = (red + green + blue) / 3;

          if (brightness > 30 && brightness < 225) {
            r += red;
            g += green;
            b += blue;
            pixelCount++;
          }
        }

        if (pixelCount > 0) {
          r = Math.floor(r / pixelCount);
          g = Math.floor(g / pixelCount);
          b = Math.floor(b / pixelCount);

          // Convert to hex for consistency
          const color = rgbToHex(r, g, b);
          colorCache.set(imageUrl, color);
          resolve(color);
        } else {
          resolve(defaultColor);
        }
      } catch (error) {
        console.warn('Error extracting color from:', imageUrl, error);
        resolve(defaultColor);
      }
    };

    img.onerror = () => {
      clearTimeout(timeout);
      resolve(defaultColor);
    };

    // Start loading the image (using proxy if needed)
    img.src = finalImageUrl;
  });
}

/**
 * Get spine color for a book (with fallbacks)
 * Priority: Cached color > Extract from cover > Genre color > Default
 */
export async function getSpineColor(book: Book): Promise<string> {
  // If book has cover URL, try to extract color
  if (book.coverUrl) {
    try {
      const color = await extractDominantColor(book.coverUrl);
      return color;
    } catch (error) {
      console.error('Failed to extract color for book:', book.title, error);
    }
  }

  // Fallback to genre-based color
  if (book.genre && genreColors[book.genre]) {
    return genreColors[book.genre];
  }

  // Final fallback
  return defaultColor;
}

/**
 * Preload colors for multiple books (for better performance)
 */
export async function preloadBookColors(books: Book[]): Promise<Map<string, string>> {
  const colorMap = new Map<string, string>();

  await Promise.all(
    books.map(async (book) => {
      const color = await getSpineColor(book);
      colorMap.set(book.id, color);
    })
  );

  return colorMap;
}
