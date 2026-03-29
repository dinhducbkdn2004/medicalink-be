import * as cheerio from 'cheerio';

/**
 * Clean HTML content by removing unwanted elements, attributes, and tags.
 * @param html The raw HTML string.
 * @returns Cleaned HTML string.
 */
export function cleanHtml(html: string): string {
  if (!html) return '';
  const $ = cheerio.load(html);

  // 1. Remove WordPress TOC, ads, and hospital contact blocks
  $(
    '.ftwp-in-post, .ftwp-container-outer, .div_element_ads, .content_insert, .ftwp-heading',
  ).remove();

  // 2. Remove media tags that are not needed for simple display
  $('img, iframe, script, style').remove();

  // 3. Remove all attributes (style, class, id) to keep only semantic tags
  $('*').each((_, el) => {
    const element = el as any;
    const attribs = element.attribs as Record<string, string> | undefined;
    if (attribs) {
      Object.keys(attribs).forEach((attr) => {
        $(el).removeAttr(attr);
      });
    }
  });

  // 4. Optionally: keep only specific tags (p, h1-h6, ul, ol, li, br, strong, em)
  // For now, removing attributes is usually enough to "clean" it for React.

  return $('body').html() || '';
}

/**
 * Extract plain text from HTML for RAG embeddings.
 * @param html The raw or cleaned HTML string.
 * @returns Plain text string.
 */
export function extractPlainText(html: string): string {
  if (!html) return '';
  const $ = cheerio.load(html);

  // Remove unwanted elements again to be safe
  $(
    '.ftwp-in-post, .ftwp-container-outer, .div_element_ads, .content_insert, .ftwp-heading, img, iframe, script, style',
  ).remove();

  // Extract text and normalize whitespace
  return $.text().replace(/\s\s+/g, ' ').trim();
}
