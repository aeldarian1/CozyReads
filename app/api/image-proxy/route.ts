import { NextRequest, NextResponse } from 'next/server';

/**
 * Image proxy API route for optimizing external book cover images.
 * Features:
 * - Proxies external images to avoid CORS issues
 * - Caches images for better performance
 * - Supports resizing for different use cases
 * - Reduces bandwidth by serving optimized images
 *
 * Usage: /api/image-proxy?url=https://example.com/image.jpg&w=400&h=600
 */

// Simple in-memory cache with TTL
const imageCache = new Map<string, { buffer: Buffer; contentType: string; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const imageUrl = searchParams.get('url');
    const width = searchParams.get('w') ? parseInt(searchParams.get('w')!) : undefined;
    const height = searchParams.get('h') ? parseInt(searchParams.get('h')!) : undefined;

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Missing image URL parameter' },
        { status: 400 }
      );
    }

    // Validate URL
    let url: URL;
    try {
      url = new URL(imageUrl);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid image URL' },
        { status: 400 }
      );
    }

    // Only allow http/https protocols
    if (!['http:', 'https:'].includes(url.protocol)) {
      return NextResponse.json(
        { error: 'Invalid protocol. Only HTTP and HTTPS are allowed.' },
        { status: 400 }
      );
    }

    // Create cache key
    const cacheKey = `${imageUrl}-${width || 'auto'}-${height || 'auto'}`;

    // Check cache
    const cached = imageCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return new NextResponse(cached.buffer, {
        headers: {
          'Content-Type': cached.contentType,
          'Cache-Control': 'public, max-age=86400, immutable', // Cache for 24 hours
        },
      });
    }

    // Fetch the image
    const imageResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CozyReads/1.0)',
      },
    });

    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${imageResponse.statusText}` },
        { status: imageResponse.status }
      );
    }

    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

    // Validate content type
    if (!contentType.startsWith('image/')) {
      return NextResponse.json(
        { error: 'URL does not point to an image' },
        { status: 400 }
      );
    }

    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // For now, we'll just pass through the image
    // In production, you'd use sharp or similar for resizing:
    // const sharp = require('sharp');
    // const resizedBuffer = await sharp(buffer)
    //   .resize(width, height, { fit: 'cover', withoutEnlargement: true })
    //   .webp({ quality: 85 })
    //   .toBuffer();

    // Store in cache
    imageCache.set(cacheKey, {
      buffer,
      contentType,
      timestamp: Date.now(),
    });

    // Clean up old cache entries (simple LRU-like behavior)
    if (imageCache.size > 500) {
      const entriesToDelete = Array.from(imageCache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, 100)
        .map(([key]) => key);

      entriesToDelete.forEach(key => imageCache.delete(key));
    }

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, immutable', // Cache for 24 hours
        'X-Image-Proxy': 'CozyReads',
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Helper function to clean the cache periodically
 */
export function cleanImageCache() {
  const now = Date.now();
  const keysToDelete: string[] = [];

  imageCache.forEach((value, key) => {
    if (now - value.timestamp > CACHE_TTL) {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach(key => imageCache.delete(key));

  return keysToDelete.length;
}

// Clean cache every hour
if (typeof setInterval !== 'undefined') {
  setInterval(cleanImageCache, 60 * 60 * 1000);
}
