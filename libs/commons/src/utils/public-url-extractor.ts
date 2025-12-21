export const CLOUDINARY_DOMAIN = 'res.cloudinary.com';

/**
 * Extract public ID from Cloudinary URL
 */
export function extractPublicIdFromUrl(url: string): string | null {
  try {
    if (!url.includes(CLOUDINARY_DOMAIN)) return null;

    const patterns = [
      /\/v\d+\/(.+)\.(jpg|jpeg|png|gif|webp)$/i,
      /\/([^/]+)\.(jpg|jpeg|png|gif|webp)$/i,
      /\/v\d+\/[^/]*\/(.+)\.(jpg|jpeg|png|gif|webp)$/i,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1].split('/').pop() || null;
      }
    }

    return null;
  } catch (_) {
    return null;
  }
}

/**
 * Extract all public IDs from mixed text content (including HTML)
 * Searches for Cloudinary image URLs and extracts their public IDs
 */
export function extractAllPublicIdsFromText(text: string): string[] {
  try {
    if (!text || typeof text !== 'string') return [];

    // Regex pattern to find all Cloudinary URLs in text/HTML
    // Matches URLs that contain the Cloudinary domain and end with image extensions
    const cloudinaryUrlPattern = new RegExp(
      `https?://[^\\s"'<>]*${CLOUDINARY_DOMAIN.replace('.', '\\.')}/[^\\s"'<>]*\\.(jpg|jpeg|png|gif|webp)`,
      'gi',
    );

    const urls = text.match(cloudinaryUrlPattern) || [];
    const publicIds: string[] = [];

    for (const url of urls) {
      const publicId = extractPublicIdFromUrl(url);
      if (publicId && !publicIds.includes(publicId)) {
        publicIds.push(publicId);
      }
    }

    return publicIds;
  } catch (_) {
    return [];
  }
}
